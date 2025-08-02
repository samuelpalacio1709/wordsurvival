import "./input.css";
import { useState, useRef, useEffect } from "react";

interface InputProps {
  onPositionChange: (position: { x: number; y: number }) => void;
}

function Input({ onPositionChange }: InputProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [visible, setVisible] = useState(false);
  const [joystickCenter, setJoystickCenter] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight - 100,
  });
  const joystickRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      if (e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      setJoystickCenter({ x: clientX, y: clientY });
      setVisible(true);
      setIsDragging(true);
      setPosition({ x: 0, y: 0 });
      onPositionChange({ x: 0, y: 0 });
    };
    const handlePointerUp = () => {
      setIsDragging(false);
      setVisible(false);
      setPosition({ x: 0, y: 0 });
      onPositionChange({ x: 0, y: 0 });
    };
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchend", handlePointerUp);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, []);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && joystickRef.current) {
        e.preventDefault();
        const touch = e.touches[0];
        if (touch) {
          const rect = joystickRef.current.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const x = touch.clientX - rect.left - centerX;
          const y = touch.clientY - rect.top - centerY;
          const distance = Math.sqrt(x * x + y * y);
          const maxDistance = centerX;
          let newPosition;
          if (distance > maxDistance) {
            const angle = Math.atan2(y, x);
            newPosition = {
              x: Math.cos(angle) * maxDistance,
              y: Math.sin(angle) * maxDistance,
            };
          } else {
            newPosition = { x, y };
          }
          setPosition(newPosition);
          onPositionChange(newPosition);
        }
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && joystickRef.current) {
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = e.clientX - rect.left - centerX;
        const y = e.clientY - rect.top - centerY;
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = centerX;
        let newPosition;
        if (distance > maxDistance) {
          const angle = Math.atan2(y, x);
          newPosition = {
            x: Math.cos(angle) * maxDistance,
            y: Math.sin(angle) * maxDistance,
          };
        } else {
          newPosition = { x, y };
        }
        setPosition(newPosition);
        onPositionChange(newPosition);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isDragging]);

  if (!visible) return null;

  return (
    <div
      className="joystick-area"
      ref={joystickRef}
      style={{
        position: "fixed",
        left: joystickCenter.x - 50,
        top: joystickCenter.y - 50,
        width: 100,
        height: 100,
        zIndex: 1000,
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
