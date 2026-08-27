import { create } from "zustand";

export type AvatarState = "idle" | "listening" | "thinking" | "speaking";
export type EmotionTag = "neutral" | "happy" | "confused" | "excited" | "concerned";

interface AvatarStore {
  avatarState: AvatarState;
  setAvatarState: (s: AvatarState) => void;
  emotion: EmotionTag;
  setEmotion: (e: EmotionTag) => void;
  mouthAmplitude: number;
  setMouthAmplitude: (v: number) => void;
  userText: string;
  setUserText: (t: string) => void;
  aiResponse: string;
  setAiResponse: (t: string) => void;
  isListening: boolean;
  setIsListening: (v: boolean) => void;
  isThinking: boolean;
  setIsThinking: (v: boolean) => void;
}

export const useAvatarStore = create<AvatarStore>((set) => ({
  avatarState: "idle",
  setAvatarState: (s) => set({ avatarState: s }),
  emotion: "neutral",
  setEmotion: (e) => set({ emotion: e }),
  mouthAmplitude: 0,
  setMouthAmplitude: (v) => set({ mouthAmplitude: v }),
  userText: "",
  setUserText: (t) => set({ userText: t }),
  aiResponse: "",
  setAiResponse: (t) => set({ aiResponse: t }),
  isListening: false,
  setIsListening: (v) => set({ isListening: v }),
  isThinking: false,
  setIsThinking: (v) => set({ isThinking: v }),
}));
