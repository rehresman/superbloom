import { useGlobalKeyHandler } from "../hooks/useGlobalKeyHandler";
import { useInitializeMIDI } from "../hooks/useInitializeMidi";
import { useWebSocket } from "../hooks/useWebSocket";
import { processOscMessage } from "../utils/webSocketUtils";

export const WebSocketConnectionStatus = () => {
  const host = "localhost:3000";
  const { loading, connectionStatus, socket, setUpSocket, disconnect } =
    useWebSocket({
      host,
      onMessage: { dataType: "osc", onMessageHandler: processOscMessage },
    });

  useGlobalKeyHandler({ socket });
  const {
    loading: MIDILoading,
    connected: MIDIConnected,
    disconnectMIDI,
    connectMIDI,
  } = useInitializeMIDI({ socket });

  return (
    <div>
      <h1>Connection</h1>

      <div>{`Web Socket Connected: ${connectionStatus}`}</div>
      <div>{`MIDI Connected: ${MIDIConnected}`}</div>
      {loading || MIDILoading ? <div>loading</div> : <div>not loading</div>}
      <span>
        <button onClick={connectionStatus ? disconnect : setUpSocket}>
          {connectionStatus ? "Disconnect Web Socket" : "Connect to OSC Bridge"}
        </button>
        <button onClick={MIDIConnected ? disconnectMIDI : connectMIDI}>
          {MIDIConnected ? "Disconnect MIDI" : "Connect MIDI"}
        </button>
      </span>

      <div>MIDI CC Optimization: Enabled</div>
    </div>
  );
};
