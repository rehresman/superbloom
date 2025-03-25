// Save this as sc_receiver.scd
// Boot the server
s.boot;

// Show the audio meter to verify sound
s.meter;

// Create a simple synth definition
SynthDef(\midiSynth, {
    arg freq=440, amp=0.5, gate=1;
    var sig, env;

    // Simple envelope
    env = EnvGen.kr(Env.adsr(0.01, 0.1, 0.8, 0.1), gate, doneAction: 2);

    // Simple oscillator (can be changed to a more complex sound)
    sig = SinOsc.ar(freq, 0, amp) * env;

    // Output
    Out.ar(0, sig ! 2);
}).add;

// Dictionary to keep track of active notes
~notes = Dictionary.new;

// Listen for note on messages
OSCdef(\noteOn, { |msg, time, addr|
    var note = msg[1];
    var vel = msg[2];
    var freq = note.midicps;

    "Note ON: note %, velocity %, frequency %".format(note, vel, freq.round(0.01)).postln;

    // Create and store synth
    ~notes[note] = Synth(\midiSynth, [
        \freq, freq,
        \amp, vel/127,
        \gate, 1
    ]);

}, '/midi/noteon');

// Listen for note off messages
OSCdef(\noteOff, { |msg, time, addr|
    var note = msg[1];

    "Note OFF: note %".format(note).postln;

    // Release the synth if it exists
    if(~notes[note].notNil, {
        ~notes[note].set(\gate, 0);
        ~notes.removeAt(note);
    });

}, '/midi/noteoff');

// Listen for control change messages
OSCdef(\cc, { |msg, time, addr|
    var cc = msg[1];
    var val = msg[2];

    "Control Change: cc %, value %".format(cc, val).postln;

    // Process different CC messages
    switch(cc,
        1, { // Modulation wheel
            // Example: affect all active notes
            ~notes.do { |synth| synth.set(\someParam, val/127); };
        },
        // Add more CC handlers as needed
    );

}, '/midi/cc');

// Set up a test responder
OSCdef(\test, { |msg, time, addr|
    "Test message received: %".format(msg).postln;

    // Play a test sound
    { SinOsc.ar(440, 0, 0.2) * EnvGen.kr(Env.perc(0.01, 0.5), doneAction: 2) ! 2 }.play;

}, '/test');

// Print info
"SuperCollider OSC MIDI receiver ready.".postln;
"Listening for OSC messages on port: %".format(NetAddr.langPort).postln;

// Play a test sound to confirm everything is working
{
    SinOsc.ar(440, 0, EnvGen.kr(Env.perc(0.01, 0.5), doneAction: 2) * 0.2) ! 2
}.play;

"Test tone played. System ready!".postln;