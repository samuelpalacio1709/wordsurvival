import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Input from "./input.tsx";
import App from "./App.tsx";

function Main() {
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });

  return (
    <StrictMode>
      <Input onPositionChange={setJoystickPosition} />
      <App joystickPosition={joystickPosition} />
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Main />);
