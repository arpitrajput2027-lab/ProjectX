import { useCallback, useRef } from "react";
import { useAvatarStore } from "@/store/avatarStore";

export function useAvatar() {
  const { setAvatarState, setMouthAmplitude, setEmotion } = useAvatarStore();
  const animationFrameId = useRef<number>();

  const startTalking = useCallback(() => {
    setAvatarState("speaking");
    // We no longer use a continuous sine wave.
    // Lip sync is now driven accurately word-by-word via the TTS onboundary event in useTTS.ts
  }, [setAvatarState]);

  const startThinking = useCallback(() => {
    setAvatarState("thinking");
    setEmotion("neutral");
    setMouthAmplitude(0);
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
  }, [setAvatarState, setEmotion, setMouthAmplitude]);

  const stopThinking = useCallback(() => {
    setAvatarState("idle");
    setMouthAmplitude(0);
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
  }, [setAvatarState, setMouthAmplitude]);

  const startListening = useCallback(() => {
    setAvatarState("listening");
    setMouthAmplitude(0);
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
  }, [setAvatarState, setMouthAmplitude]);

  const stopTalking = useCallback(() => {
    setAvatarState("idle");
    setMouthAmplitude(0);
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
  }, [setAvatarState, setMouthAmplitude]);

  return {
    avatarState: useAvatarStore((s) => s.avatarState),
    startTalking,
    startThinking,
    stopThinking,
    startListening,
    stopTalking
  };
}
