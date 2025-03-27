import { useGlobalKeyHandler } from "../hooks/useGlobalKeyHandler";
import { useInitializeMIDI } from "../hooks/useInitializeMidi";
import { useWebSocket } from "../hooks/useWebSocket";
import { processOscMessage } from "../utils/webSocketUtils";
import styled from "@emotion/styled";

const StyledConnectionContainer = styled.div({
  display: "flex",
  gap: "5px",
  flexDirection: "column",
  alignItems: "center",
  width: "500px",
  background: "grey",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "10px 5px 5px lightgreen;",
});

const StyledConnectionStatus = styled.div<{ status: boolean }>(
  ({ status }) => ({
    backgroundColor: status ? "lightgreen" : "salmon",
    opacity: status ? "100%" : "60%",
    borderRadius: "5px",
    padding: "5px",
    border: "1px solid",
    display: "flex",
    alignContent: "left",
    color: "black",
    fontWeight: "700",
    fontSize: "20px",
    cursor: "not-allowed",
  })
);

const StyledConnectionButton = styled.button<{ status: boolean }>(
  ({ status }) => ({
    marginTop: "20px",
    fontSize: "20px",
    fontWeight: "550",
    backgroundColor: status ? "salmon" : "lightgreen",
    borderColor: status ? "salmon" : "lightgreen",
    color: "black",
    borderRadius: "8px",
    "&:hover": {
      background: status
        ? "linear-gradient(45deg, #ff6b6b, #ffcc5c)"
        : "linear-gradient(45deg, lightgreen, #ffcc5c)",
      cursor: "pointer",
    },
  })
);

const StyledButtonContainer = styled.span({
  display: "flex",
  gap: "20px",
});

const StyledMIDICCOptimizationStatus = styled.div({
  backgroundColor: "lightgrey",
  color: "black",
});

const StyledConnectionStatusContainer = styled.div({
  display: "flex",
  flexDirection: "column",
  alignSelf: "flex-start",
  width: "inherit",
  gap: "5px",
});

const StyledH1 = styled.h1({
  margin: "5px",
});

export const WebSocketConnectionStatus = () => {
  const host = "localhost:3000";
  const {
    connectionStatus: webSocketConnected,
    socket,
    setUpSocket,
    disconnect,
  } = useWebSocket({
    host,
    onMessage: { dataType: "osc", onMessageHandler: processOscMessage },
  });

  useGlobalKeyHandler({ socket });
  const {
    connected: MIDIConnected,
    disconnectMIDI,
    connectMIDI,
  } = useInitializeMIDI(socket);

  return (
    <StyledConnectionContainer>
      <StyledH1>Connection Status</StyledH1>
      <StyledConnectionStatusContainer>
        <StyledConnectionStatus
          status={webSocketConnected}
        >{`Web Socket Connected: ${webSocketConnected}`}</StyledConnectionStatus>
        <StyledConnectionStatus
          status={MIDIConnected}
        >{`MIDI Connected: ${MIDIConnected}`}</StyledConnectionStatus>
      </StyledConnectionStatusContainer>
      <StyledButtonContainer>
        <StyledConnectionButton
          status={webSocketConnected}
          onClick={webSocketConnected ? disconnect : setUpSocket}
        >
          {webSocketConnected
            ? "Disconnect Web Socket"
            : "Connect to OSC Bridge"}
        </StyledConnectionButton>
        <StyledConnectionButton
          status={MIDIConnected}
          onClick={MIDIConnected ? disconnectMIDI : connectMIDI}
        >
          {MIDIConnected ? "Disconnect MIDI" : "Connect MIDI"}
        </StyledConnectionButton>
      </StyledButtonContainer>

      <StyledMIDICCOptimizationStatus>
        MIDI CC Optimization: Enabled
      </StyledMIDICCOptimizationStatus>
    </StyledConnectionContainer>
  );
};
