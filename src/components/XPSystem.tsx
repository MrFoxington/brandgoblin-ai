"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export interface XPState {
  xp: number;
  level: number;
  levelName: string;
  levelEmoji: string;
  xpToNextLevel: number;
  xpProgress: number; // 0-100
  totalGenerations: number;
  totalContent: number;
  achievements: string[];
}

const LEVELS = [
  { min: 0,    name: "Brand Apprentice",  emoji: "🌱" },
  { min: 100,  name: "Brand Creator",     emoji: "✨" },
  { min: 300,  name: "Brand Wizard",      emoji: "🧙" },
  { min: 700,  name: "Brand Sorcerer",    emoji: "🔮" },
  { min: 1500, name: "Goblin Master",     emoji: "🧌" },
  { min: 3000, name: "Creator Legend",    emoji: "👑" },
];

const ACHIEVEMENTS = [
  { id: "first_brand",     label: "First Brand Born",   emoji: "🎂", threshold: (s: XPState) => s.totalGenerations >= 1 },
  { id: "five_brands",     label: "Five Brands Deep",   emoji: "🖐️", threshold: (s: XPState) => s.totalGenerations >= 5 },
  { id: "content_creator", label: "Content Machine",    emoji: "🚀", threshold: (s: XPState) => s.totalContent >= 10 },
  { id: "wizard",          label: "Wizard Level",       emoji: "🧙", threshold: (s: XPState) => s.level >= 2 },
  { id: "legend",          label: "Creator Legend",     emoji: "👑", threshold: (s: XPState) => s.level >= 5 },
];

function getLevel(xp: number) {
  let lvl = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) { lvl = i; break; }
  }
  return lvl;
}

function computeState(raw: { xp: number; totalGenerations: number; totalContent: number; achievements: string[] }): XPState {
  const lvlIdx = getLevel(raw.xp);
  const current = LEVELS[lvlIdx];
  const next = LEVELS[lvlIdx + 1];
  const xpInLevel = raw.xp - current.min;
  const xpNeeded = next ? next.min - current.min : 1000;
  const xpProgress = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  const xpToNextLevel = next ? next.min - raw.xp : 0;

  return {
    ...raw,
    level: lvlIdx,
    levelName: current.name,
    levelEmoji: current.emoji,
    xpToNextLevel,
    xpProgress,
  };
}

const XP_KEY = "brandgoblin_xp_v1";

function loadRaw() {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(XP_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

interface XPContextValue {
  state: XPState;
  addXP: (amount: number, reason?: string) => void;
  trackGeneration: () => void;
  trackContent: () => void;
}

const defaultState: XPState = {
  xp: 0, level: 0, levelName: "Brand Apprentice", levelEmoji: "🌱",
  xpToNextLevel: 100, xpProgress: 0, totalGenerations: 0, totalContent: 0, achievements: [],
};

const XPContext = createContext<XPContextValue>({
  state: defaultState,
  addXP: () => {},
  trackGeneration: () => {},
  trackContent: () => {},
});

export function useXP() { return useContext(XPContext); }

export function XPProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState({ xp: 0, totalGenerations: 0, totalContent: 0, achievements: [] as string[] });
  const [levelUpMsg, setLevelUpMsg] = useState<{ name: string; emoji: string } | null>(null);

  useEffect(() => {
    const saved = loadRaw();
    if (saved) setRaw(saved);
  }, []);

  const save = useCallback((next: typeof raw) => {
    setRaw(next);
    try { localStorage.setItem(XP_KEY, JSON.stringify(next)); } catch { /* noop */ }
  }, []);

  const addXP = useCallback((amount: number) => {
    setRaw((prev) => {
      const prevLevel = getLevel(prev.xp);
      const newXP = prev.xp + amount;
      const newLevel = getLevel(newXP);

      // Check achievements
      const newState = computeState({ ...prev, xp: newXP });
      const newAchievements = [...prev.achievements];
      ACHIEVEMENTS.forEach((a) => {
        if (!newAchievements.includes(a.id) && a.threshold(newState)) {
          newAchievements.push(a.id);
        }
      });

      const next = { ...prev, xp: newXP, achievements: newAchievements };
      try { localStorage.setItem(XP_KEY, JSON.stringify(next)); } catch { /* noop */ }

      // Level up?
      if (newLevel > prevLevel) {
        const lvl = LEVELS[newLevel];
        setTimeout(() => {
          setLevelUpMsg({ name: lvl.name, emoji: lvl.emoji });
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#a78bfa", "#34d399", "#fbbf24", "#f472b6"] });
          setTimeout(() => setLevelUpMsg(null), 4000);
        }, 300);
      }

      return next;
    });
  }, []);

  const trackGeneration = useCallback(() => {
    setRaw((prev) => {
      const next = { ...prev, totalGenerations: prev.totalGenerations + 1 };
      try { localStorage.setItem(XP_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
    addXP(50);
  }, [addXP]);

  const trackContent = useCallback(() => {
    setRaw((prev) => {
      const next = { ...prev, totalContent: prev.totalContent + 1 };
      try { localStorage.setItem(XP_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
    addXP(10);
  }, [addXP]);

  const state = computeState(raw);

  return (
    <XPContext.Provider value={{ state, addXP, trackGeneration, trackContent }}>
      {children}
      <AnimatePresence>
        {levelUpMsg && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
          >
            <div className="rounded-3xl border border-primary/40 bg-[rgba(12,10,24,0.98)] backdrop-blur-xl px-8 py-5 text-center shadow-2xl">
              <p className="text-4xl mb-2">{levelUpMsg.emoji}</p>
              <p className="text-xs font-bold tracking-widest uppercase text-primary-light mb-1">Level Up!</p>
              <p className="font-display text-2xl font-black text-white">{levelUpMsg.name}</p>
              <p className="text-xs text-muted mt-1">You&apos;re getting better at this 🧌</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </XPContext.Provider>
  );
}

// XP Bar widget — drop anywhere
export function XPBar({ compact }: { compact?: boolean }) {
  const { state } = useXP();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{state.levelEmoji}</span>
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${state.xpProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs text-faint tabular-nums">{state.xp} XP</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-white/3 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{state.levelEmoji}</span>
          <div>
            <p className="font-display font-black text-white text-sm">{state.levelName}</p>
            <p className="text-xs text-faint">{state.xp} XP total</p>
          </div>
        </div>
        {state.xpToNextLevel > 0 && (
          <p className="text-xs text-muted">{state.xpToNextLevel} XP to next level</p>
        )}
      </div>
      <div className="h-2.5 w-full rounded-full bg-white/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-primary-light to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${state.xpProgress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      {state.achievements.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {ACHIEVEMENTS.filter((a) => state.achievements.includes(a.id)).map((a) => (
            <span key={a.id} className="text-xs rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-primary-light">
              {a.emoji} {a.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
