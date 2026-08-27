import { useCallback, useRef } from "react";
import { useAvatar } from "./useAvatar";
import { useAvatarStore } from "@/store/avatarStore";

export function useTTS() {
  const { startTalking, stopTalking } = useAvatar();
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!synth) return;

      // Stop any ongoing speech
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Try to find a good English female voice
      const voices = synth.getVoices();
      const preferredVoice = 
        voices.find(v => v.lang.includes("en") && (v.name.includes("Zira") || v.name.includes("Samantha") || v.name.includes("Google UK English Female") || v.name.includes("Female"))) 
        || voices.find(v => v.lang.includes("en-US") && v.name.includes("Google")) 
        || voices.find(v => v.lang.includes("en"))
        || voices[0];
        
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        startTalking();
      };

      utterance.onboundary = (event) => {
        // This fires at the start of every word.
        // We set a random amplitude to simulate the word being spoken,
        // and then let it naturally decay in a short timeout.
        const amplitude = 0.6 + Math.random() * 0.4; // 0.6 to 1.0
        useAvatarStore.getState().setMouthAmplitude(amplitude);
        
        // Decay the mouth shape quickly after the word starts
        setTimeout(() => {
           if (useAvatarStore.getState().avatarState === "speaking") {
               useAvatarStore.getState().setMouthAmplitude(0.1 + Math.random() * 0.2); // partial close
           }
        }, 100); 
      };

      utterance.onend = () => {
        stopTalking();
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        stopTalking();
        if (onEnd) onEnd();
      };

      currentUtterance.current = utterance;
      synth.speak(utterance);
    },
    [synth, startTalking, stopTalking]
  );

  const stop = useCallback(() => {
    if (synth) {
      synth.cancel();
      stopTalking();
    }
  }, [synth, stopTalking]);

  return { speak, stop };
}
