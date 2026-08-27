import { useState, useCallback, useRef, useEffect } from "react";

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
};

interface UseInterviewWebSocketProps {
  studentId: string;
  onMessageReceived: (msg: string) => void;
  onInterviewEnded: (feedback: any) => void;
}

export function useInterviewWebSocket({ studentId, onMessageReceived, onInterviewEnded }: UseInterviewWebSocketProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error" | "ended">("idle");
  const ws = useRef<WebSocket | null>(null);
  const feedbackReceived = useRef(false); // Track if feedback was received (avoids stale closure)

  const connect = useCallback(() => {
    feedbackReceived.current = false;
    setStatus("connecting");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") || "ws://localhost:8000";
    ws.current = new WebSocket(`${apiUrl}/api/mock-interview/ws/${studentId}`);

    ws.current.onopen = () => {
      setStatus("connected");
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "question" || data.type === "message") {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "assistant",
            content: data.text,
            timestamp: Date.now()
          }]);
          onMessageReceived(data.text);
        } else if (data.type === "feedback") {
          feedbackReceived.current = true; // Mark feedback as received BEFORE setting state
          setStatus("ended");
          onInterviewEnded(data.feedback);
        } else if (data.type === "error") {
          console.error("Interview Error:", data.message);
        }
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    ws.current.onclose = () => {
      // Only reset to idle if we did NOT receive feedback
      // Using a ref avoids the stale closure problem
      if (!feedbackReceived.current) {
        setStatus("idle");
      }
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
      if (!feedbackReceived.current) {
        setStatus("error");
      }
    };
  }, [studentId, onMessageReceived, onInterviewEnded]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      if (!feedbackReceived.current) {
        setStatus("idle");
      }
    }
  }, []);

  const endInterview = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "end_interview" }));
    }
  }, []);

  const sendAnswer = useCallback((text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: Date.now()
    }]);

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "answer", text }));
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const reset = useCallback(() => {
    feedbackReceived.current = false;
    setMessages([]);
    setStatus("idle");
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  return {
    messages,
    status,
    connect,
    disconnect,
    sendAnswer,
    endInterview,
    reset
  };
}
