import { useEffect, useState, useRef, useCallback } from "react";
import { onMIDISuccess } from "../utils/midiUtils";

export const useInitializeMIDI = (socket: WebSocket | null) => {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const midiAccessRef = useRef<MIDIAccess | null>(null);

  // Function to handle successful MIDI access
  const onAccessSuccess = useCallback(
    (midiAccess: MIDIAccess, socket) => {
      midiAccessRef.current = midiAccess;
      onMIDISuccess(midiAccess, socket);
      setConnected(true);
      setLoading(false);
    },
    [socket]
  );

  // Function to connect to MIDI
  const connectMIDI = useCallback(() => {
    if (midiAccessRef.current || loading) return; // Prevent multiple calls

    setLoading(true);
    if (navigator.requestMIDIAccess) {
      navigator
        .requestMIDIAccess()
        .then((accessSuccess) => onAccessSuccess(accessSuccess, socket))
        .catch(() => {
          console.error("Failed to access MIDI devices.");
          setConnected(false);
          setLoading(false);
        });
    } else {
      console.warn("Web MIDI API not supported in this browser.");
      setLoading(false);
    }
  }, [loading, onAccessSuccess]);

  // Function to disconnect MIDI
  const disconnectMIDI = useCallback(() => {
    if (midiAccessRef.current) {
      for (let input of midiAccessRef.current.inputs.values()) {
        input.onmidimessage = null;
      }
      console.log("MIDI disconnected.");
      midiAccessRef.current = null;
      setConnected(false);
    }
  }, []);

  // Cleanup when unmounting
  useEffect(() => {
    return () => {
      disconnectMIDI();
    };
  }, [disconnectMIDI]);

  return { loading, connected, connectMIDI, disconnectMIDI };
};
