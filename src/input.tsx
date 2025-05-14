import "./input.css";
import { useState, useRef, useEffect } from "react";

interface InputProps {
  onPositionChange: (position: { x: number; y: number }) => void;
}

function Input({ onPositionChange }: InputProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updatePosition(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updatePosition(e as unknown as React.MouseEvent);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onPositionChange({ x: 0, y: 0 });
  };

  const updatePosition = (e: React.MouseEvent) => {
    if (!joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate position relative to the joystick center
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    // Calculate distance from center
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = centerX;

    // Normalize position if it exceeds the joystick bounds
    if (distance > maxDistance) {
      const angle = Math.atan2(y, x);
      const newPosition = {
        x: Math.cos(angle) * maxDistance,
        y: Math.sin(angle) * maxDistance,
      };
      setPosition(newPosition);
      onPositionChange(newPosition);
    } else {
      const newPosition = { x, y };
      setPosition(newPosition);
      onPositionChange(newPosition);
    }
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging]);

  return (
    <div
      className="joystick-area"
      ref={joystickRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        left: "50%",
        bottom: "50px",
        transform: "translateX(-50%)",
      }}
    >
      <div
        className="tap-area"
        style={{
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        }}
      />
    </div>
  );
}

export default Input;
