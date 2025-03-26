import { useWebSocket } from "../hooks/useWebSocket";

export const WebSocketConnectionStatus = () => {
  const host = "localhost:3000";
  const { loading, connectionStatus, setUpSocket, disconnect } = useWebSocket({
    host,
  });

  return (
    <div>
      <h1>Connection</h1>

      <div>{`Web Socket Connected: ${connectionStatus}`}</div>
      <div>MIDI: Not connected</div>
      {loading ? <div>loading</div> : <div>not loading</div>}
      <span>
        <button onClick={connectionStatus ? disconnect : setUpSocket}>
          {connectionStatus ? "Disconnect" : "Connect to OSC Bridge"}
        </button>
        <button>Enable Web MIDI</button>
      </span>

      <div>MIDI CC Optimization: Enabled</div>
    </div>
  );
};
