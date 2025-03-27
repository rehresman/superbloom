import "./App.css";
import { AppHeader } from "./components/AppHeader";
import { WebSocketConnectionStatus } from "./components/WebSocketConnectionStatus";
import styled from "@emotion/styled";

const StyledAppContainer = styled.div({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
});

function App() {
  return (
    <StyledAppContainer>
      <AppHeader />
      <WebSocketConnectionStatus />
    </StyledAppContainer>
  );
}

export default App;
