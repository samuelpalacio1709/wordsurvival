import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh } from "three";

interface JoystickPosition {
  x: number;
  y: number;
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
        <meshStandardMaterial color="#4a2f1b" />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
    </group>
  );
}

function Rock({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#666666" roughness={0.8} />
    </mesh>
  );
}

function Capsule({ joystickPosition }: { joystickPosition: JoystickPosition }) {
  const meshRef = useRef<Mesh>(null);
  const speed = 0.09;
  const { camera } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      // Normalize joystick values to be between -1 and 1
      const normalizedX = joystickPosition.x / 50;
      const normalizedY = joystickPosition.y / 50;

      // Allow diagonal movement by applying both X and Z movement
      meshRef.current.position.x += normalizedX * speed;
      meshRef.current.position.z += normalizedY * speed;

      // Update camera position to follow player while maintaining offset
      camera.position.x = meshRef.current.position.x;
      camera.position.z = meshRef.current.position.z + 15; // Keep the same distance behind
      camera.position.y = 20; // Keep the same height
      camera.lookAt(meshRef.current.position);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
      <capsuleGeometry args={[0.5, 1, 16, 32]} />
      <meshPhysicalMaterial
        color="orange"
        metalness={0.2}
        roughness={0.4}
        clearcoat={0.5}
        clearcoatRoughness={0.2}
      />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#8B4513" roughness={0.8} metalness={0.2} />
    </mesh>
  );
}

function Grid() {
  return (
    <gridHelper
      args={[100, 100, "#666666", "#444444"]}
      position={[0, -0.49, 0]}
    />
  );
}

function Skybox() {
  return (
    <mesh>
      <sphereGeometry args={[500, 32, 32]} />
      <meshBasicMaterial color="#87CEEB" side={1} />
    </mesh>
  );
}

function Scene({ joystickPosition }: { joystickPosition: JoystickPosition }) {
  return (
    <>
      <Skybox />
      <Grid />
      <Ground />
      <Capsule joystickPosition={joystickPosition} />

      {/* Background elements */}
      <Tree position={[-10, 0, -10]} />
      <Tree position={[10, 0, -15]} />
      <Tree position={[-15, 0, 5]} />
      <Tree position={[15, 0, 8]} />

      <Rock position={[-8, 0, 8]} />
      <Rock position={[12, 0, -8]} />
      <Rock position={[-12, 0, -12]} />
      <Rock position={[8, 0, 12]} />
    </>
  );
}

function App({ joystickPosition }: { joystickPosition: JoystickPosition }) {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{
          fov: 45,
          position: [0, 20, 15],
          near: 0.1,
          far: 1000,
        }}
        shadows
      >
        <color attach="background" args={["#87CEEB"]} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[-5, 5, -5]}
          intensity={0.5}
          color="#ffffff"
        />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />
        <Scene joystickPosition={joystickPosition} />
      </Canvas>
    </div>
  );
}

export default App;
