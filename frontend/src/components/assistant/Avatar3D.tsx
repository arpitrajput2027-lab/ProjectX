"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useAvatarStore } from "@/store/avatarStore";

const AVATAR_URL = "/models/avatar.glb";

export default function Avatar3D() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(AVATAR_URL);

  const avatarState = useAvatarStore((s) => s.avatarState);
  const mouthAmplitude = useAvatarStore((s) => s.mouthAmplitude);

  // Available blend shapes console mein print karo (for debugging)
  useEffect(() => {
    scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.morphTargetDictionary) {
        console.log("=== BLEND SHAPES for", mesh.name, "===");
        console.log(Object.keys(mesh.morphTargetDictionary));
      }
    });
  }, [scene]);

  // Har frame mein procedural movement aur lip-sync
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Subtle procedural movement (breathing & head movement)
    // Kyunki model mein baked animations nahi hain, hum code se hila rahe hain
    if (group.current) {
      // Breathing effect (up and down slightly)
      // Base position Y is -1.6
      group.current.position.y = -1.6 + Math.sin(time * 2) * 0.015;
      
      // Slight head rotation (looking around naturally)
      let targetRotY = Math.sin(time * 0.5) * 0.03;

      // Agar soch raha hai (thinking), toh thoda right dekhega
      if (avatarState === "thinking") {
        targetRotY += 0.15;  // Look slightly right
      }

      // Smooth rotation apply karo (Sirf Y axis par, X hataya taaki aage na jhuke)
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.05);
    }

    // 2. Lip sync — blend shapes update karo
    scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
        const dict = mesh.morphTargetDictionary;

        // jawOpen — main mouth open/close (faster lerp for snappier response)
        if (dict["jawOpen"] !== undefined) {
          const currentJaw = mesh.morphTargetInfluences[dict["jawOpen"]];
          mesh.morphTargetInfluences[dict["jawOpen"]] = THREE.MathUtils.lerp(
            currentJaw,
            Math.min(mouthAmplitude * 0.8, 0.85),
            0.5 // faster lerp for snappier lip sync
          );
        }

        // mouthOpen — some models use this instead of / in addition to jawOpen
        if (dict["mouthOpen"] !== undefined) {
          const current = mesh.morphTargetInfluences[dict["mouthOpen"]];
          mesh.morphTargetInfluences[dict["mouthOpen"]] = THREE.MathUtils.lerp(
            current,
            Math.min(mouthAmplitude * 0.7, 0.8),
            0.5
          );
        }

        // viseme_aa — vowel shape for more natural look
        if (dict["viseme_aa"] !== undefined) {
          const current = mesh.morphTargetInfluences[dict["viseme_aa"]];
          mesh.morphTargetInfluences[dict["viseme_aa"]] = THREE.MathUtils.lerp(
            current,
            Math.min(mouthAmplitude * 0.6, 0.6),
            0.4
          );
        }

        // mouthFunnel — lip rounding
        if (dict["mouthFunnel"] !== undefined) {
          const currentFunnel = mesh.morphTargetInfluences[dict["mouthFunnel"]];
          mesh.morphTargetInfluences[dict["mouthFunnel"]] = THREE.MathUtils.lerp(
            currentFunnel,
            Math.min(mouthAmplitude * 0.5, 0.55),
            0.4
          );
        }
      }
    });
  });

  return (
    <group ref={group}>
      <primitive
        object={scene}
        // Scale aur Position adjust kiya for Half-Body frame
        scale={2.5}
        position={[0, -1.8, 1.6]} 
        rotation={[-0.2, 0, 0]}  // Agar face ulta ho toh rotation={[0, Math.PI, 0]} karna
      />
    </group>
  );
}

useGLTF.preload(AVATAR_URL);
