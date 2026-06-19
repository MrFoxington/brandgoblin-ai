"use client";

/**
 * SoundFx — muteable Tone.js sound cue system
 * Default: on for first-run, preference persisted.
 * Exports: useSoundFx() hook + <SoundToggle /> button
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const MUTE_KEY = "brandgoblin_mute_sound_v1";

interface SoundContextValue {
  muted: boolean;
  toggleMute: () => void;
  playReveal: () => void;
  playCopy: () => void;
  playLevelUp: () => void;
  playComplete: () => void;
  playFavorite: () => void;
}

const SoundContext = createContext<SoundContextValue>({
  muted: false,
  toggleMute: () => {},
  playReveal: () => {},
  playCopy: () => {},
  playLevelUp: () => {},
  playComplete: () => {},
  playFavorite: () => {},
});

export function useSoundFx() {
  return useContext(SoundContext);
}

// Simple Web Audio API synth (no Tone.js load needed for these micro-sounds)
function makeCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch { return null; }
}

function playTone(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  gain: number,
  attack: number,
  decay: number,
  delay = 0
) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
  gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + attack + decay);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + attack + decay + 0.05);
}

function createPlayer(muted: () => boolean) {
  let ctx: AudioContext | null = null;

  function getCtx() {
    if (!ctx) ctx = makeCtx();
    if (ctx?.state === "suspended") ctx.resume();
    return ctx;
  }

  return {
    reveal() {
      if (muted()) return;
      const c = getCtx(); if (!c) return;
      // ascending sparkle chime: C5 → E5 → G5
      [523, 659, 784].forEach((freq, i) => playTone(c, freq, "sine", 0.06, 0.01, 0.18, i * 0.07));
    },
    copy() {
      if (muted()) return;
      const c = getCtx(); if (!c) return;
      playTone(c, 880, "sine", 0.05, 0.005, 0.1);
    },
    levelUp() {
      if (muted()) return;
      const c = getCtx(); if (!c) return;
      // fanfare: C5 E5 G5 C6
      [523, 659, 784, 1047].forEach((freq, i) => playTone(c, freq, "triangle", 0.07, 0.02, 0.25, i * 0.09));
    },
    complete() {
      if (muted()) return;
      const c = getCtx(); if (!c) return;
      // warm chord: G4 + B4 + D5
      [[392, 0], [494, 0.03], [587, 0.06]].forEach(([freq, d]) =>
        playTone(c, freq as number, "sine", 0.055, 0.02, 0.5, d as number)
      );
    },
    favorite() {
      if (muted()) return;
      const c = getCtx(); if (!c) return;
      // quick pop: two notes
      playTone(c, 660, "sine", 0.07, 0.01, 0.12);
      playTone(c, 880, "sine", 0.05, 0.01, 0.1, 0.08);
    },
  };
}

// Module-level reference so components outside the tree (e.g. XPProvider) can fire sounds
export const globalSoundFx = {
  playReveal: () => {},
  playLevelUp: () => {},
  playCopy: () => {},
};

export function SoundFxProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(true); // start true — flip after hydration
  const mutedRef = { current: muted };
  mutedRef.current = muted;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MUTE_KEY);
      setMuted(saved === "1");
    } catch { /* noop */ }
  }, []);

  const player = createPlayer(() => mutedRef.current);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try { localStorage.setItem(MUTE_KEY, next ? "1" : "0"); } catch { /* noop */ }
      return next;
    });
  }, []);

  const value = {
    muted,
    toggleMute,
    playReveal: () => player.reveal(),
    playCopy: () => player.copy(),
    playLevelUp: () => player.levelUp(),
    playComplete: () => player.complete(),
    playFavorite: () => player.favorite(),
  };

  // Keep module-level ref in sync so components outside React tree can fire sounds
  globalSoundFx.playReveal = value.playReveal;
  globalSoundFx.playLevelUp = value.playLevelUp;
  globalSoundFx.playCopy = value.playCopy;

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

export function SoundToggle({ className = "" }: { className?: string }) {
  const { muted, toggleMute } = useSoundFx();
  return (
    <button
      type="button"
      onClick={toggleMute}
      title={muted ? "Unmute sounds" : "Mute sounds"}
      className={`rounded-full border border-white/15 bg-white/5 p-2 text-sm hover:bg-white/10 transition-colors ${className}`}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
