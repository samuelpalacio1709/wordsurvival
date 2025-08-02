import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Physics,
  Debug,
  useCylinder,
  usePlane,
  useSphere,
  useBox,
} from "@react-three/cannon";

interface JoystickPosition {
  x: number;
  y: number;
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
  useFrame(() => {
    if (ref.current) {
      const normalizedX = joystickPosition.x / 50;
      const normalizedY = joystickPosition.y / 50;
      api.velocity.set(normalizedX * speed * 50, 0, normalizedY * speed * 50);
      camera.position.x = ref.current.position.x;
      camera.position.z = ref.current.position.z + 15;
      camera.position.y = 20;
      camera.lookAt(ref.current.position);
    }
  });
  return (
    <mesh ref={ref}>
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
