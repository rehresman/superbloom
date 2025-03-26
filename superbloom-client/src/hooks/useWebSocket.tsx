import { useEffect, useState, useRef } from "react";

export const useWebSocket = ({
  host,
  onMessage,
}: {
  host: string;
  onMessage?: { dataType: string; onMessageHandler: (data: any) => void };
}) => {
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const socketRef = useRef<WebSocket | null>(null); // Use ref to persist socket across renders

  const disconnect = () => {
    socketRef.current && socketRef.current.close();
  };

  const setUpSocket = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${host}`;

    setLoading(true);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus(true);
      setLoading(false);
    };

    socket.onclose = () => {
      setConnectionStatus(false);
      setLoading(false);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus(false);
      setLoading(false);
    };

    socket.onmessage = (event) => {
      if (!onMessage) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === onMessage.dataType) {
          onMessage.onMessageHandler(data);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };
  };

  useEffect(() => {
    setUpSocket();
    // Cleanup function to close the WebSocket when the component unmounts
    return () => {
      disconnect();
    };
  }, []); // Runs only once when the component mounts

  return {
    loading,
    connectionStatus,
    socket: socketRef.current,
    setUpSocket,
    disconnect,
  };
};
