# SuperCollider MIDI Web Controller

A web-based MIDI controller interface for SuperCollider that connects through an OSC bridge.

## Project Structure

```
supercollider-midi-web/
├── public/                 # Web files served by Express
│   ├── index.html          # Main HTML page
│   ├── css/                # CSS stylesheets
│   │   └── styles.css      # Main styles
│   └── js/                 # JavaScript files
│       ├── utils.js        # Utility functions
│       ├── websocket.js    # WebSocket communication
│       ├── midi.js         # MIDI handling
│       ├── keyboard.js     # Virtual keyboard UI
│       ├── app.js          # Main application init
│       └── midi-optimized.js (optional) # Enhanced MIDI throttling
├── server.js               # Node.js OSC bridge server
└── package.json            # Project dependencies
```

## Setup Instructions

1. **Create the directory structure:**
   ```
   mkdir -p supercollider-midi-web/public/css
   mkdir -p supercollider-midi-web/public/js
   ```

2. **Copy the files to their respective locations:**
   - Place index.html in the public directory
   - Place all CSS files in the public/css directory
   - Place all JavaScript files in the public/js directory
   - Place server.js and package.json in the root directory

3. **Install dependencies:**
   ```
   cd supercollider-midi-web
   npm install
   ```

4. **Start the server:**
   ```
   node server.js
   ```

5. **Access the interface:**
   Open your browser and navigate to http://localhost:3000

## Performance Optimization

For high-resolution MIDI controllers that send many messages (like knobs and sliders), you can use the optimized MIDI handling:

1. Replace midi.js with midi-optimized.js by modifying index.html:
   ```html
   <!-- Replace this line -->
   <script src="js/midi.js"></script>
   
   <!-- With this line -->
   <script src="js/midi-optimized.js"></script>
   ```

## SuperCollider Setup

Make sure SuperCollider is running with appropriate OSC listeners:

```supercollider
// Initialize OSC listeners for MIDI messages
OSCdef(\midiNoteOn, { |msg|
    var note = msg[1].asInteger;
    var vel = msg[2];
    // Your note handling code here
}, '/midi/noteon');

OSCdef(\midiNoteOff, { |msg|
    var note = msg[1].asInteger;
    // Your note-off handling code here
}, '/midi/noteoff');

OSCdef(\midiCC, { |msg|
    var cc = msg[1].asInteger;
    var val = msg[2];
    // Your CC handling code here
}, '/midi/cc');
```

## Key Features

- WebSocket to OSC bridge for browser-to-SuperCollider communication
- Virtual piano keyboard for testing without MIDI hardware
- Computer keyboard support for playing notes
- MIDI device connection via Web MIDI API
- Message throttling to prevent lag with high-resolution controllers