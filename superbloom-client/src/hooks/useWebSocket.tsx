import { useEffect, useState, useRef } from "react";

export const useWebSocket = () => {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null); // Use ref to persist socket across renders

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = "localhost:3000";
    const wsUrl = `${protocol}//${host}`;

    setLoading(true);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("eh");
      setConnected(true);
      setLoading(false);
    };

    socket.onclose = () => {
      setConnected(false);
      setLoading(false);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnected(false);
      setLoading(false);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "osc") {
          console.log("Processing OSC message");
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    // Cleanup function to close the WebSocket when the component unmounts
    // return () => {
    //   if (socketRef.current) {
    //     socketRef.current.close();
    //   }
    // };
  }, []); // Runs only once when the component mounts

  return { loading, connected };
};
