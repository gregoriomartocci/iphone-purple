"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import type { ChatMessage } from "@/types";

const QUICK_ACTIONS = [
  { label: "Ver ofertas", message: "¿Cuáles son las ofertas actuales?" },
  { label: "Plan Canje", message: "¿Cómo funciona el Plan Canje?" },
  { label: "Rastrear pedido", message: "Quiero rastrear mi pedido" },
  { label: "Hablar con alguien", message: "Quiero hablar con una persona" },
];

export function ChatbotBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "¡Hola! Soy Violeta, tu asistente de iPhone Purple 💜 ¿En qué te puedo ayudar hoy?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: ChatMessage = {
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Error en la respuesta");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content ?? "";
                assistantContent += delta;
                setMessages((prev) =>
                  prev.map((m, i) =>
                    i === prev.length - 1
                      ? { ...m, content: assistantContent }
                      : m
                  )
                );
              } catch {}
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lo siento, hubo un problema. ¿Podés intentarlo de nuevo?",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[70] w-80 bg-white rounded-2xl shadow-xl border border-[#E8E8E8] flex flex-col overflow-hidden max-h-[480px]"
          >
            {/* Header */}
            <div className="bg-[#7B2FBE] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex flex-col">
                <span className="font-semibold text-sm leading-tight">Violeta</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="text-xs text-white/70">En línea</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white min-h-0">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "user" ? (
                    <div className="bg-[#7B2FBE] text-white text-sm rounded-2xl rounded-br-sm px-3 py-2 ml-auto max-w-[80%] leading-relaxed">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="bg-[#F5F5F5] text-[#111] text-sm rounded-2xl rounded-bl-sm px-3 py-2 mr-auto max-w-[80%] leading-relaxed">
                      {msg.content || (
                        /* Typing indicator */
                        <span className="flex items-center gap-1 py-0.5">
                          <span className="w-1.5 h-1.5 bg-[#999] rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 bg-[#999] rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 bg-[#999] rounded-full animate-bounce [animation-delay:300ms]" />
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Quick actions — only on first message */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-1.5 px-0 pb-0">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.message)}
                      className="border border-[#E8E8E8] text-[#666] text-xs rounded-lg px-2.5 py-1.5 hover:border-[#7B2FBE] hover:text-[#7B2FBE] transition-colors bg-white"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-[#E8E8E8] px-3 py-3 flex gap-2 flex-shrink-0 bg-white">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Escribí tu consulta..."
                className="flex-1 bg-[#F7F7F7] rounded-xl px-3 py-2 text-sm text-[#111] placeholder:text-[#999] border-none outline-none"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="bg-[#7B2FBE] text-white rounded-xl w-8 h-8 flex items-center justify-center hover:bg-[#6D28D9] transition-colors disabled:opacity-40 flex-shrink-0"
                aria-label="Enviar mensaje"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-[#7B2FBE] text-white rounded-full w-14 h-14 shadow-lg hover:bg-[#6D28D9] flex items-center justify-center transition-colors"
        aria-label="Abrir chat con Violeta"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
