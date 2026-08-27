"use client";

import { useRef, useState, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Avatar3D from "./Avatar3D";
import { useAvatarStore } from "@/store/avatarStore";

function AvatarLoader() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#8b6a3e" wireframe />
    </mesh>
  );
}

export default function AvatarWindow() {
  // Check if we are on a smaller screen and adjust
  const getInitialPos = () => {
    if (typeof window === "undefined") return { x: 230, y: 20 };
    return {
      x: window.innerWidth > 1024 ? window.innerWidth - 340 : 20,
      y: 20 // Top Right
    };
  };

  const [pos, setPos] = useState(getInitialPos());

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const avatarState = useAvatarStore((s) => s.avatarState);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    },
    [pos]
  );

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPos({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const borderColor =
    avatarState === "listening"
      ? "#ef4444" // red
      : avatarState === "thinking"
      ? "#8b6a3e" // bronze
      : avatarState === "speaking"
      ? "#5f7350" // success green
      : "rgba(26,24,20,0.1)"; // subtle ink

  const stateLabel =
    avatarState === "listening"
      ? "● Listening..."
      : avatarState === "thinking"
      ? "● Thinking..."
      : avatarState === "speaking"
      ? "● Speaking"
      : "● Idle";

  const stateColor = 
      avatarState === "listening"
      ? "text-red-500"
      : avatarState === "thinking"
      ? "text-amber-500"
      : avatarState === "speaking"
      ? "text-green-500"
      : "text-gray-500";

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: 320,
        height: 380,
        zIndex: 1000,
        borderColor: borderColor
      }}
      className="shadow-2xl rounded-xl overflow-hidden bg-white border-2"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Header */}
      <div
        onMouseDown={onMouseDown}
        className="px-4 py-2 bg-gray-100 flex items-center justify-between cursor-grab select-none border-b border-black/5"
      >
        <span className="font-semibold text-sm text-gray-800">
          AI Interviewer
        </span>
        <span className={`text-[10px] font-mono transition-colors ${stateColor}`}>
          {stateLabel}
        </span>
      </div>

      {/* Canvas */}
      <div className="w-full h-[calc(100%-37px)] bg-gray-50 relative">
        <Canvas
           camera={{ position: [0, 1.5, 2.8], fov: 38 }}
           className="w-full h-full"
        >
          <ambientLight intensity={0.75} color="#faf8f4" />
          <directionalLight position={[2, 4, 3]} intensity={1.0} color="#ffffff" />
          <pointLight position={[-2, 3, 2]} intensity={0.4} color="#f4f0e8" />

          <Suspense fallback={<AvatarLoader />}>
            <Avatar3D />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Canvas>
      </div>
    </div>
  );
}
