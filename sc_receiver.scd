// Save this as sc_receiver.scd
// Boot the server
s.boot;

s.quit;
// Show the audio meter to verify sound
s.meter;


(
s.waitForBoot({
	// Create a dictionary to keep track of active notes/synths
	~notes = Dictionary.new;
	// Cleanup function - use this to stop all MIDI processing
	~cleanup = {
		MIDIdef(\noteOn).free;
		MIDIdef(\noteOff).free;
		~notes.clear;

		// modulation/control buses
		~cutoffBus = Bus.control(s, 1);
		~resonanceBus = Bus.control(s, 1);
		~driveBus = Bus.control(s, 1);
		~oscBus = Bus.control(s, 1);
		~vibratoBus = Bus.control(s,1);

		~cutoffBus.set(12000);
		~resonanceBus.set(1);
		~driveBus.set(1);
		~oscBus.set(0);
		~vibratoBus.set(0);
	};

	//avoid two instances running
	~cleanup.value;

	// synth definition
	SynthDef(\thrasher, {|freq = 440,
		amp = 0.1,
		gate = 1,
		clip = 0.9|

		var sigL, sigR, env,filterCutoff, filterRes, drive, gritAmt, lfoAmt;

		filterCutoff = In.kr(~cutoffBus.index, 1);
		filterRes = In.kr(~resonanceBus.index, 1);
		drive = In.kr(~driveBus.index, 1);
		gritAmt = In.kr(~oscBus.index, 1);
		lfoAmt = In.kr(~vibratoBus.index, 1);


		// Simple ADSR envelope
		env = EnvGen.kr(Env.adsr(0.05, 0.1, 0.8, 1), gate, doneAction: 2);
		// lfo pitch modulation
		freq = freq + ( lfoAmt * SinOsc.kr(freq / 100));
		// Sine wave oscillator
		sigL = SinOscFB.ar(freq, gritAmt)*(1-(gritAmt/4)) + (Saw.ar(freq *2) * gritAmt);
		sigR = SinOscFB.ar(freq + 1, gritAmt)*(1-(gritAmt/4)) + (Saw.ar((freq + 1)*2) * gritAmt);

		//filter
		sigL = RLPF.ar(sigL, filterCutoff, filterRes);
		sigR = RLPF.ar(sigR, filterCutoff + 1, filterRes);

		sigL = (sigL * drive).tanh * env * amp;
		sigR = (sigR * drive).tanh * env * amp;


		// Output in stereo
		Out.ar(0, [sigL, sigR]);

}).add;

	// Listen for note on messages
	OSCdef(\noteOn, { |msg, time, addr|
		var note = msg[1];
		var vel = msg[2];
		var freq = note.midicps;

		//"Note ON: note %, velocity %, frequency %".format(note, vel, freq.round(0.01)).postln;

		// Create and store synth
		~notes[note] = Synth(\thrasher, [
			\freq, freq,
			\amp, vel/127 * 0.5
		]);

	}, '/midi/noteon');



	// Listen for note off messages
	OSCdef(\noteOff, { |msg, time, addr|
		var note = msg[1];

		//"Note OFF: note %".format(note).postln;

		// Release the synth if it exists
		if(~notes[note].notNil, {
			~notes[note].set(\gate, 0);
			~notes.removeAt(note);
		});

	}, '/midi/noteoff');

	// Listen for control change messages
	OSCdef(\cc, { |msg, time, addr|
		var cc = msg[1].asInteger;
		var val = msg[2];
		var knob;

		"Control Change: cc %, value %".format(cc, val).postln;

		// Process different CC messages
		switch(cc,
			1,
			{ // Modulation wheel
				knob = val.linlin(0, 127, 0, 10);
				~vibratoBus.set(knob);
			},
			71,
			{
				knob = val.linlin(0, 127, 1.0, 0.03);
				~resonanceBus.set(knob);
			},
			74,
			{
				knob = val.linexp(0, 127, 20, 12000);
				~cutoffBus.set(knob);
			},
			76,
			{
				knob = val.linlin(0, 127, 1.0, 5.0);
				~driveBus.set(knob);
			},
			77,
			{
				knob = val.linlin(0, 127, 0.0, 3pi/4);
				~oscBus.set(knob);
			}
		);

	}, '/midi/cc');

	s.sync;
});

)


// When you're done, run:
~cleanup.value;