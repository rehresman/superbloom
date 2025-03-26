// Save this as init.osc.js in your project
const osc = require('osc');

// Create an OSC UDP port
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57122,
  remoteAddress: "127.0.0.1",
  remotePort: 57110
});

// Open the port
udpPort.open();

// Wait for the port to be ready
udpPort.on("ready", () => {
  console.log("Initializing SuperCollider with OSC commands...");
  
  // Define your synth
  udpPort.send({
    address: "/d_recv",
    args: [{
      type: "blob",
      value: Buffer.from(`SynthDef("thrasher", {
        arg freq = 440, amp = 0.1, gate = 1, clip = 0.9,
        cutoff = 12000, res = 1, drive = 1, grit = 0, vibrato = 0;
        var sigL, sigR, env, filterCutoff, filterRes, lfoAmt;
        
        // Simple ADSR envelope
        env = EnvGen.kr(Env.adsr(0.05, 0.1, 0.8, 1), gate, doneAction: 2);
        // lfo pitch modulation
        freq = freq + (vibrato * SinOsc.kr(freq / 100));
        // Sine wave oscillator
        sigL = SinOscFB.ar(freq, grit)*(1-(grit/4)) + (Saw.ar(freq *2) * grit);
        sigR = SinOscFB.ar(freq + 1, grit)*(1-(grit/4)) + (Saw.ar((freq + 1)*2) * grit);
        //filter
        sigL = RLPF.ar(sigL, cutoff, res);
        sigR = RLPF.ar(sigR, cutoff + 1, res);
        sigL = (sigL * drive).tanh * env * amp;
        sigR = (sigR * drive).tanh * env * amp;
        // Output in stereo
        Out.ar(0, [sigL, sigR]);
      })`)
    }]
  });
  
  console.log("Synth definition sent to SuperCollider");
});

udpPort.on("error", (error) => {
  console.error("OSC error:", error);
});