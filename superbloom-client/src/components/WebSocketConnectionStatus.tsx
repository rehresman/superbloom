import { useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

export const WebSocketConnectionStatus = () => {
  const [setWebSocketStatus, webSocketStatus] = useState(false);
  const [setMidiStatus, MidiStatus] = useState(false);

  const { loading, connected } = useWebSocket();

  return (
    <div>
      <h1>Connection</h1>

      <div>{`Web Socket Connected: ${connected}`}</div>
      <div>MIDI: Not connected</div>

      {loading ? <div>loading</div> : <div>not loading</div>}

      <span>
        <button>Connect to OSC Bridge</button>
        <button>Enable Web MIDI</button>
      </span>

      <div>MIDI CC Optimization: Enabled</div>
    </div>
  );
};
