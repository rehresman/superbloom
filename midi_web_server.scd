// ===== PART 1: SuperCollider Code (save as midi_web_server.scd) =====

// Run this code in SuperCollider
s.boot; // Boot the server

// Set up OSC communication
n = NetAddr("127.0.0.1", 57120); // Local address for OSC communication

// Create a simple synth definition that responds to MIDI
SynthDef(\midiSynth, {
    arg freq=440, amp=0.5, gate=1;
    var sig, env;
    env = EnvGen.kr(Env.adsr(0.01, 0.1, 0.8, 0.1), gate, doneAction: 2);
    sig = SinOsc.ar(freq, 0, amp) * env;
    Out.ar(0, sig ! 2);
}).add;

// Set up OSC responder for MIDI notes
OSCdef(\midiReceiver, {
    arg msg;
    var note = msg[1];
    var velocity = msg[2];
    var freq = note.midicps;

    ("Received MIDI note: " ++ note ++ " with velocity: " ++ velocity).postln;

    if(velocity > 0, {
        Synth(\midiSynth, [\freq, freq, \amp, velocity/127]);
    });
}, '/midi/noteon');

// For continuous controllers
OSCdef(\midiCC, {
    arg msg;
    var cc = msg[1];
    var value = msg[2];

    ("Received CC: " ++ cc ++ " with value: " ++ value).postln;

    // Map CC values to your parameters
    // Example: map CC 1 (modulation) to some parameter
    if(cc == 1, {
        // Do something with the value
    });
}, '/midi/cc');

// Start the HTTP server for WebSocket communication
// This requires the SC-WebSocket quark
Quarks.install("SC-WebSocket");
WebSocketServer.new(8080).start;

"SuperCollider server ready for MIDI communication via web!".postln;
