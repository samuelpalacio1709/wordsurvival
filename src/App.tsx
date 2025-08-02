import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Physics,
  Debug,
  useCylinder,
  usePlane,
  useSphere,
  useBox,
} from "@react-three/cannon";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface JoystickPosition {
  x: number;
  y: number;
}

function mergeRefs<T = unknown>(refs: Array<React.Ref<T> | undefined>) {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") ref(value);
      else if (ref && typeof ref === "object")
        (ref as React.MutableRefObject<T | null>).current = value;
    });
  };
}

function Tree({ position }: { position: [number, number, number] }) {
  const [ref] = useBox(() => ({
    args: [1, 3, 1],
    position: [position[0], position[1] + 1.5, position[2]],
    type: "Static",
  }));
  return (
    <group ref={ref} position={position}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
        <meshStandardMaterial color="#4a2f1b" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
    </group>
  );
}

function Rock({ position }: { position: [number, number, number] }) {
  const [ref] = useSphere(() => ({ args: [0.5], position, type: "Static" }));
  return (
    <mesh ref={ref} position={position}>
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#666666" roughness={0.8} />
    </mesh>
  );
}

function Capsule({ joystickPosition }: { joystickPosition: JoystickPosition }) {
  const [ref, api] = useCylinder(() => ({
    args: [0.5, 0.5, 2, 16],
    mass: 1,
    position: [0, 1, 0],
    fixedRotation: true,
  }));
  const speed = 0.09;
  const { camera } = useThree();
  const position = useRef([0, 1, 0]);
  const meshRef = useRef<THREE.Mesh | null>(null);
  useEffect(() => {
    const unsubscribe = api.position.subscribe((p) => {
      position.current = p;
    });
    return unsubscribe;
  }, [api.position]);
  useFrame(() => {
    const normalizedX = joystickPosition.x / 50;
    const normalizedY = joystickPosition.y / 50;
    api.velocity.set(normalizedX * speed * 800, 0, normalizedY * speed * 800);
    const [x, y, z] = position.current;
    camera.position.x = x;
    camera.position.z = z + 15;
    camera.position.y = 20;
    camera.lookAt(x, y, z);
    if (meshRef.current && (normalizedX !== 0 || normalizedY !== 0)) {
      meshRef.current.rotation.y = Math.atan2(normalizedX, normalizedY);
    }
  });
  return (
    <mesh ref={mergeRefs([ref, meshRef])}>
      <capsuleGeometry args={[0.5, 1, 16, 32]} />
      <meshPhysicalMaterial
        color="orange"
        metalness={0.2}
        roughness={0.4}
        clearcoat={0.5}
        clearcoatRoughness={0.2}
      />
      <mesh position={[0, 1.25, 0.4]}>
        <boxGeometry args={[0.7, 0.08, 0.24]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 1.38, 0.4]}>
        <boxGeometry args={[0.36, 0.18, 0.18]} />
        <meshStandardMaterial color="#00aaff" />
      </mesh>
    </mesh>
  );
}

function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.5, 0],
    type: "Static",
  }));
  return (
    <mesh ref={ref} position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{
          fov: 45,
          position: [0, 20, 15],
          near: 0.1,
          far: 1000,
        }}
      >
        <color attach="background" args={["#87CEEB"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[0, 10, 0]} intensity={1} />
        <directionalLight
          position={[-5, 5, -5]}
          intensity={0.5}
          color="#ffffff"
        />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />
        <Physics gravity={[0, -30, 0]}>
          <Debug>
            <Scene joystickPosition={joystickPosition} />
          </Debug>
        </Physics>
      </Canvas>
    </div>
  );
}

export default App;
