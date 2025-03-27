//globals
let activeNotes = new Set();

// Initialize Web MIDI API
export const initMIDI = (socket: WebSocket | null) => {
  if (navigator.requestMIDIAccess) {
    navigator
      .requestMIDIAccess()
      .then((midiAccess) => onMIDISuccess(midiAccess, socket), onMIDIFailure);
  } else {
    console.warn("Web MIDI API not supported in this browser.");
  }
};

// MIDI initialization successful
export const onMIDISuccess = (access, socket: WebSocket | null) => {
  const midiAccess = access;
  console.log("MIDI access granted");

  //   connectMIDIButton.textContent = "MIDI Enabled";

  // Connect to all MIDI inputs
  const inputs = midiAccess.inputs.values();
  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    input.value.onmidimessage = (message) => onMIDIMessage(socket, message);

    console.log(
      `Connected to MIDI input: ${input.value.name || "Unknown device"}`
    );
  }

  // Handle connection state changes
  midiAccess.onstatechange = (e) => {
    console.log(`MIDI connection state change: ${e.port.name} ${e.port.state}`);

    // Update UI based on available inputs
    if ([...midiAccess.inputs.values()].length === 0) {
      //  updateStatus(midiStatus, "disconnected", "MIDI: No devices connected");
    } else {
      //updateStatus(midiStatus, "connected", "MIDI: Connected");
    }
  };
};

// Handle incoming MIDI messages
function onMIDIMessage(socket: WebSocket | null, message) {
  const data = message.data;
  const cmd = data[0] >> 4;
  //const channel = data[0] & 0xf;
  const noteNumber = data[1];
  const velocity = data[2];

  console.log(`MIDI message: [${Array.from(data).join(", ")}]`);

  // Note on
  if (cmd === 9 && velocity > 0) {
    noteOn(socket, noteNumber, velocity);
  }
  // Note off
  else if (cmd === 8 || (cmd === 9 && velocity === 0)) {
    noteOff(socket, noteNumber);
  }
  // Control change
  else if (cmd === 11) {
    controlChange(socket, noteNumber, velocity);

    // Update UI for certain CCs
    // if (noteNumber === 1) {
    //   // Modulation
    //   document.getElementById("modulation").value = velocity;
    //   document.getElementById("modValue").textContent = velocity;
    // } else if (noteNumber === 11) {
    //   // Expression
    //   document.getElementById("expression").value = velocity;
    //   document.getElementById("exprValue").textContent = velocity;
    // }
  }
}

// Send MIDI note on
export function noteOn(socket: WebSocket | null, note, velocity) {
  activeNotes.add(note);
  sendOSC(socket, "/midi/noteon", [note, velocity]);

  // Update keyboard UI
  const key = document.querySelector(`.key[data-note="${note}"]`);
  if (key) {
    key.classList.add("active");
  }
}

// Send MIDI note off
export function noteOff(socket: WebSocket | null, note) {
  activeNotes.delete(note);
  sendOSC(socket, "/midi/noteoff", [note, 0]);

  // Update keyboard UI
  const key = document.querySelector(`.key[data-note="${note}"]`);
  if (key) {
    key.classList.remove("active");
  }
}

// Send OSC message through WebSocket
//need to pass in socket
function sendOSC(socket: WebSocket | null, address, args) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const message = {
      type: "osc",
      address: address,
      args: args,
    };

    try {
      socket.send(JSON.stringify(message));
      console.log(`Sent OSC: ${address} ${JSON.stringify(args)}`);
      return true;
    } catch (err) {
      console.log(`Error sending OSC: ${err.message}`);
      return false;
    }
  } else {
    console.log("Cannot send OSC: WebSocket not connected");
    return false;
  }
}

// Send MIDI control change
function controlChange(socket: WebSocket | null, cc, value) {
  sendOSC(socket, "/midi/cc", [cc, value]);
}

// MIDI initialization failed
export function onMIDIFailure(error) {
  console.log(`MIDI access failed: ${error.message || error}`);
  //updateStatus(midiStatus, "disconnected", "MIDI: Access denied");
}
