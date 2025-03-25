# SuperCollider MIDI Web Controller

A web-based MIDI controller interface for SuperCollider that connects through an OSC bridge.

## Project Structure

```
supercollider-midi-web/
├── public/                 # Web files served by Express
│   ├── index.html          # Main HTML page
├── server.js               # Node.js OSC bridge server
├── sc_receiver.scd         # supercollider code
└── package.json            # Project dependencies
```

## Setup Instructions

1. **Run the supercollider code:**
   ```
   in cs.receiver.scd, boot the supercollider server with cmd + B.  Then run the main code block in the parentheses.
   ```

2. **Start the server:**
   ```
   node server.js
   ```

3. **Access the interface:**
   Open your browser and navigate to http://localhost:3000


## Key Features

- WebSocket to OSC bridge for browser-to-SuperCollider communication
- Virtual piano keyboard for testing without MIDI hardware
- Computer keyboard support for playing notes
- MIDI device connection via Web MIDI API
- Message throttling to prevent lag with high-resolution controllers