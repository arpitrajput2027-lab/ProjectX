import { useState, useCallback, useRef, useEffect } from "react";
import { useAvatar } from "./useAvatar";

interface UseSTTProps {
  onTranscript: (text: string) => void;
}

export function useSTT({ onTranscript }: UseSTTProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const intendedToRecordRef = useRef<boolean>(false);
  const { startListening, stopTalking } = useAvatar();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript + " ";
            }
          }
          if (transcript.trim()) {
            onTranscript(transcript.trim());
          }
        };

        recognitionRef.current.onend = () => {
          if (intendedToRecordRef.current) {
            // Auto-restart if it stopped due to silence timeout in continuous mode
            try {
              recognitionRef.current.start();
            } catch (e) {}
          } else {
            setIsRecording(false);
            stopTalking(); // Reset avatar state
          }
        };
        
        recognitionRef.current.onerror = (e: any) => {
          console.error("STT Error:", e.error);
          if (e.error === "network") {
            alert("Microphone network error. This usually happens if you are using a browser like Brave/Arc, or if you lack an internet connection. Please try using Google Chrome or Edge.");
          }
          if (e.error !== "no-speech") {
            setIsRecording(false);
            stopTalking();
          }
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
    }
  }, [onTranscript, stopTalking]);

  const startRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        intendedToRecordRef.current = true;
        recognitionRef.current.start();
        setIsRecording(true);
        startListening();
      } catch (e) {
        console.error("Failed to start recording:", e);
      }
    } else {
      alert("Speech Recognition API is not supported in this browser.");
    }
  }, [startListening]);

  const stopRecording = useCallback(() => {
    intendedToRecordRef.current = false;
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
        stopTalking();
      } catch (e) {
        console.error("Failed to stop recording:", e);
      }
    }
  }, [isRecording, stopTalking]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return { isRecording, startRecording, stopRecording, toggleRecording };
}
