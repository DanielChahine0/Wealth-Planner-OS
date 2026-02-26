"use client";
import { useState, useCallback, useRef } from "react";
import { useStore } from "@/lib/store";
import { streamChat } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

export function useAdvisorStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { profile, simulationResult, riskReport } = useStore();

  const sendMessage = useCallback(
    (userText: string) => {
      if (!profile || !simulationResult || !riskReport) return;
      if (isStreaming) return;

      const userMessage: ChatMessage = { role: "user", content: userText };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsStreaming(true);
      setError(null);

      // Add empty assistant message that we'll stream into
      const assistantMessage: ChatMessage = { role: "assistant", content: "" };
      setMessages([...newMessages, assistantMessage]);

      let accumulated = "";

      abortRef.current = streamChat(
        profile,
        simulationResult,
        riskReport,
        newMessages,
        (token) => {
          accumulated += token;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: accumulated,
            };
            return updated;
          });
        },
        () => {
          setIsStreaming(false);
        },
        (err) => {
          setIsStreaming(false);
          setError(err.message);
        }
      );
    },
    [messages, isStreaming, profile, simulationResult, riskReport]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, error, sendMessage, abort };
}
