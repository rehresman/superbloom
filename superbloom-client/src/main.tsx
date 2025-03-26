import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  //strict mode is turned off for now because 2 web socket connections are being added with it on
  //<StrictMode>
  <App />
  //</StrictMode>
);
