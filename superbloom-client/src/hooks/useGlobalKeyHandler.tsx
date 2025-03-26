import { noteOff, noteOn } from "../utils/midiUtils";
import { useEffect } from "react";

// Key mapping for computer keyboard
const keyMap = {
  a: 60,
  w: 61,
  s: 62,
  e: 63,
  d: 64,
  f: 65,
  t: 66,
  g: 67,
  y: 68,
  h: 69,
  u: 70,
  j: 71,
  k: 72,
  o: 73,
  l: 74,
  p: 75,
  ";": 76,
  "'": 77,
};

// Track key states
const pressedKeys = new Set();

function handleKeyDown(socket, e) {
  const key = e.key.toLowerCase(); // Normalize key case
  if (pressedKeys.has(key) || !keyMap[key]) return;

  noteOn(socket, keyMap[key], 100);
  pressedKeys.add(key);
}

function handleKeyUp(socket, e) {
  const key = e.key.toLowerCase();
  if (!pressedKeys.has(key) || !keyMap[key]) return;

  noteOff(socket, keyMap[key]);
  pressedKeys.delete(key);
}

export const useGlobalKeyHandler = ({ socket }) => {
  useEffect(() => {
    console.log("apply keyhandler");
    const keyDownListener = (e) => handleKeyDown(socket, e);
    const keyUpListener = (e) => handleKeyUp(socket, e);

    document.addEventListener("keydown", keyDownListener);
    document.addEventListener("keyup", keyUpListener);

    return () => {
      document.removeEventListener("keydown", keyDownListener);
      document.removeEventListener("keyup", keyUpListener);
      pressedKeys.clear(); // Ensure no lingering pressed keys
    };
  }, [socket]); // Include socket in dependency array
};
