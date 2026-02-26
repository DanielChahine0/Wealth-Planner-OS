"use client";
import { useState, useRef, useEffect } from "react";
import { useAdvisorStream } from "@/hooks/useAdvisorStream";
import { Button } from "@/components/shared/Button";
import { MessageBubble } from "./MessageBubble";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const { messages, isStreaming, error, sendMessage, abort } = useAdvisorStream();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => abort(), [abort]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage(text);
  };

  const STARTER_QUESTIONS = [
    "What is my biggest financial risk?",
    "How can I optimize my tax strategy?",
    "Should I increase my contribution rate?",
    "What happens if I retire 5 years earlier?",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-rim flex items-center gap-3">
        <div
          className="w-8 h-8 border border-gold/30 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #1A1510, #26200F)" }}
        >
          <span className="text-gold text-xs">◆</span>
        </div>
        <div>
          <h3 className="text-sm text-parchment">AI Financial Advisor</h3>
          <p className="text-xs text-dust">Context-aware analysis powered by Claude</p>
        </div>
        {isStreaming && (
          <div className="ml-auto flex items-center gap-2 text-xs text-gold">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-slow-pulse" />
            Thinking
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-8 py-8">
            <div>
              <div
                className="w-16 h-16 border border-gold/20 flex items-center justify-center mx-auto mb-5"
                style={{ background: "linear-gradient(135deg, #1A1510, #26200F)" }}
              >
                <span className="text-gold text-2xl">◆</span>
              </div>
              <h3 className="font-serif text-xl text-parchment">How can I help?</h3>
              <p className="text-sm text-mist max-w-xs mt-2 leading-relaxed">
                Ask me anything about your financial plan, simulation results, or strategy options.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="group text-left text-sm text-mist bg-elevated hover:bg-hover border border-rim hover:border-gold/30 px-4 py-3 transition-all"
                >
                  <span className="text-gold mr-1.5 font-mono">→</span>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
        )}
        {error && (
          <div className="flex items-start gap-2 text-sm text-crimson bg-crimson-bg border border-crimson/25 p-4">
            <svg className="w-4 h-4 text-crimson flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-rim p-4 bg-elevated">
        <form onSubmit={handleSubmit} className="flex gap-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your financial plan..."
            disabled={isStreaming}
            className="flex-1 bg-surface border border-rim text-parchment px-4 py-2.5 text-sm focus:outline-none focus:border-gold disabled:opacity-50 transition-all placeholder:text-dust"
          />
          {isStreaming ? (
            <Button type="button" variant="secondary" size="md" onClick={abort}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
              </svg>
              Stop
            </Button>
          ) : (
            <Button type="submit" size="md" disabled={!input.trim()} className="px-5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
