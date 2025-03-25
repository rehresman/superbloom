import { useState } from "react";
import "./App.css";
import { WebSocketConnectionStatus } from "./components/webSocketConnectionStatus";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <WebSocketConnectionStatus />
    </>
  );
}

export default App;
