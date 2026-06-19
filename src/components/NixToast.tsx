"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const NIX_QUOTES = [
  "Magic complete! ✨",
  "I'd buy from this brand.",
  "This makes me smile.",
  "I can see customers loving this.",
  "I've got a good feeling about this.",
  "Copied! Go build something great.",
  "That's a good choice.",
  "Nix approves. 🧌",
  "Your brand is looking incredible.",
  "We're cooking now!",
  "Even I'm impressed.",
  "This one's a winner.",
];

interface Toast {
  id: string;
  message: string;
  type: "nix" | "success" | "energy";
  emoji?: string;
}

interface ToastContextValue {
  showNixQuote: () => void;
  showToast: (message: string, type?: Toast["type"], emoji?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showNixQuote: () => {},
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function NixToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast["type"] = "nix", emoji?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t.slice(-2), { id, message, type, emoji }]);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  const showNixQuote = useCallback(() => {
    const quote = NIX_QUOTES[Math.floor(Math.random() * NIX_QUOTES.length)];
    showToast(quote, "nix");
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showNixQuote, showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.85 }}
              transition={{ type: "spring", bounce: 0.35, duration: 0.5 }}
              className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-primary/30 bg-[rgba(12,10,24,0.95)] backdrop-blur-md px-4 py-3 shadow-2xl max-w-xs"
            >
              {toast.type === "nix" && (
                <Image src="/nix/happy-waving-nix.png" alt="Nix" width={36} height={36} className="shrink-0" />
              )}
              {toast.type === "success" && <span className="text-xl shrink-0">{toast.emoji ?? "✅"}</span>}
              {toast.type === "energy" && <span className="text-xl shrink-0">⚡</span>}
              <p className="text-sm font-semibold text-white leading-snug">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
