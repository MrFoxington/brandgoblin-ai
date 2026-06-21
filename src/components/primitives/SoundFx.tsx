"use client";

/**
 * SoundFx — Phase 1.7 "Juice & Sound"
 * Real audio files via HTMLAudioElement, graceful silent fallback if files are missing.
 * Default: ON for new users; saved preference respected.
 * Mute immediately stops any active loops.
 * prefers-reduced-motion: skips the looping anticipation bed + conjure whoosh.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

const MUTE_KEY = "brandgoblin_mute_sound_v1";
const HINT_KEY = "brandgoblin_sound_hint_v1";

// ── Sound file map — wire to expected filenames, silent if 404 ──────────────
// Drop these files in /public/sounds/ (CC0 / royalty-free, commercial-OK):
//   button-press.mp3      ~100ms  soft tactile click (Kenney.nl Interface Sounds)
//   conjure-start.mp3     ~600ms  whoosh + rising shimmer (Freesound CC0 / Mixkit)
//   anticipation-loop.mp3 2-4s    looping ambient bed, clean loop point (Freesound CC0)
//   reveal.mp3            ~1.5s   sparkle burst + warm chord (Mixkit / Freesound CC0)
//   streak-chime.mp3      ~400ms  single clear chime, pitch-shifted per streak (Kenney.nl)
//   level-up.mp3          ~1.5s   fanfare for refill celebration (Kenney.nl / Mixkit)
const SOUND_FILES = {
  "button-press":      "/sounds/button-press.mp3",
  "conjure-start":     "/sounds/conjure-start.mp3",
  "anticipation-loop": "/sounds/anticipation-loop.mp3",
  "reveal":            "/sounds/reveal.mp3",
  "streak-chime":      "/sounds/streak-chime.mp3",
  "level-up":          "/sounds/level-up.mp3",
  "nudge":             "/sounds/nudge.mp3",
  "share":             "/sounds/share.mp3",
} as const;

type SoundName = keyof typeof SOUND_FILES;

// ── Context interface (additive — existing callers unchanged) ────────────────

interface SoundContextValue {
  muted: boolean;
  toggleMute: () => void;
  // Original cues
  playReveal: () => void;
  playCopy: () => void;
  playLevelUp: () => void;
  playComplete: () => void;
  playFavorite: () => void;
  // Phase 1.7 cues
  playButtonPress: () => void;
  playConjureStart: () => void;
  startAnticipation: () => void;
  stopAnticipation: () => void;
  playStreak: (count: number) => void;
  playNudge: () => void;
  playShare: () => void;
}

const noop = () => {};

const SoundContext = createContext<SoundContextValue>({
  muted: false,
  toggleMute: noop,
  playReveal: noop,
  playCopy: noop,
  playLevelUp: noop,
  playComplete: noop,
  playFavorite: noop,
  playButtonPress: noop,
  playConjureStart: noop,
  startAnticipation: noop,
  stopAnticipation: noop,
  playStreak: noop,
  playNudge: noop,
  playShare: noop,
});

export function useSoundFx() {
  return useContext(SoundContext);
}

// ── Audio player — created once per provider (client-side only) ──────────────

function prefersReducedMotion(): boolean {
  try {
    return typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch { return false; }
}

function createAudioPlayer(getMuted: () => boolean) {
  const sources = new Map<string, HTMLAudioElement>();
  let loopEl: HTMLAudioElement | null = null;
  let loopFadeId: ReturnType<typeof setInterval> | null = null;
  let primed = false;

  // Load sound files — 404 / unavailable = silent, no console spam
  for (const [name, src] of Object.entries(SOUND_FILES) as [SoundName, string][]) {
    try {
      const el = new Audio();
      el.preload = "auto";
      el.src = src;
      sources.set(name, el);
    } catch { /* file unavailable — cue is silent */ }
  }

  // ── Audio unlock chain ────────────────────────────────────────────────────
  // Must be called from a user-gesture handler (e.g. playButtonPress on Conjure click)
  // so subsequent non-gesture plays (the anticipation loop from an effect) are unblocked.
  function ensurePrimed() {
    if (primed) return;
    primed = true;
    sources.forEach((el) => {
      try {
        el.muted = true;
        const p = el.play();
        if (p) {
          p.then(() => {
            try { el.pause(); el.currentTime = 0; el.muted = false; } catch {}
          }).catch(() => {});
        }
      } catch {}
    });
  }

  // ── One-shot playback (cloneNode allows overlapping cues) ─────────────────
  function playOne(name: SoundName, volume = 0.5, playbackRate = 1.0) {
    if (getMuted()) return;
    const src = sources.get(name);
    if (!src) return; // file not loaded — silent
    try {
      const clone = src.cloneNode() as HTMLAudioElement;
      clone.volume = Math.min(1, Math.max(0, volume));
      clone.playbackRate = playbackRate;
      clone.play().catch(() => {});
    } catch {}
  }

  // ── Anticipation loop ─────────────────────────────────────────────────────
  function startLoop() {
    if (getMuted() || prefersReducedMotion()) return;
    const src = sources.get("anticipation-loop");
    if (!src) return;

    stopLoopImmediate(); // clear any stale loop before starting

    try {
      const clone = src.cloneNode(true) as HTMLAudioElement;
      clone.loop = true;
      clone.volume = 0;
      loopEl = clone;

      const p = clone.play();
      if (p) {
        p.then(() => {
          // Fade in over ~600ms
          let v = 0;
          const target = 0.28;
          const id = setInterval(() => {
            if (!loopEl || loopEl !== clone) { clearInterval(id); return; }
            v = Math.min(v + 0.025, target);
            try { clone.volume = v; } catch {}
            if (v >= target) clearInterval(id);
          }, 50);
        }).catch(() => {
          if (loopEl === clone) loopEl = null;
        });
      }
    } catch {}
  }

  function stopLoop() {
    const el = loopEl;
    if (!el) return;
    if (loopFadeId !== null) { clearInterval(loopFadeId); loopFadeId = null; }

    let v = el.volume;
    loopFadeId = setInterval(() => {
      try {
        v = Math.max(0, v - 0.05);
        el.volume = v;
        if (v <= 0) {
          el.pause();
          if (loopFadeId !== null) { clearInterval(loopFadeId); loopFadeId = null; }
          if (loopEl === el) loopEl = null;
        }
      } catch {
        if (loopFadeId !== null) { clearInterval(loopFadeId); loopFadeId = null; }
      }
    }, 40);
  }

  // Immediate stop — called when user mutes mid-generation or on provider cleanup
  function stopLoopImmediate() {
    if (loopFadeId !== null) { clearInterval(loopFadeId); loopFadeId = null; }
    try {
      if (loopEl) { loopEl.pause(); loopEl.currentTime = 0; loopEl = null; }
    } catch {}
  }

  // ── Cue map ────────────────────────────────────────────────────────────────

  return {
    ensurePrimed,
    stopLoopImmediate,

    // Tactile click — fires in gesture context, doubles as audio-unlock trigger
    playButtonPress() {
      ensurePrimed();
      playOne("button-press", 0.4);
    },

    // Whoosh + shimmer on job submit — reduced-motion users: skip
    playConjureStart() {
      ensurePrimed();
      if (!prefersReducedMotion()) playOne("conjure-start", 0.45);
    },

    // Ambient bed during generation — loops cleanly, fades out on stopAnticipation
    startAnticipation() { ensurePrimed(); startLoop(); },
    stopAnticipation()  { stopLoop(); },

    // Reveal / complete — both map to reveal.mp3 (the big satisfying landing)
    playReveal()   { ensurePrimed(); playOne("reveal", 0.6); },
    playComplete() { ensurePrimed(); playOne("reveal", 0.6); },

    // Refill / level-up fanfare
    playLevelUp()  { ensurePrimed(); playOne("level-up", 0.65); },

    // Copy / favorite — soft feedback, reuse button-press file at lower volume
    playCopy()     { ensurePrimed(); playOne("button-press", 0.3); },
    playFavorite() { ensurePrimed(); playOne("button-press", 0.35); },

    // Streak chime — pitch rises with real streak count (1.0× at 1, up to 1.8× at 9+)
    playStreak(count: number) {
      if (getMuted()) return;
      ensurePrimed();
      const rate = Math.min(1.0 + Math.max(0, count - 1) * 0.1, 1.8);
      playOne("streak-chime", 0.5, rate);
    },

    // Nudge — single magic ding when post-reveal CTAs appear (honest invite, not pressure)
    playNudge() { ensurePrimed(); playOne("nudge", 0.55); },

    // Share — celebratory applause/cheer on a REAL successful share (distinct from reveal/level-up)
    playShare() { ensurePrimed(); playOne("share", 0.55); },
  };
}

// ── Module-level ref — lets XPProvider / Reveal fire sounds outside React tree

export const globalSoundFx = {
  playReveal:  noop as () => void,
  playLevelUp: noop as () => void,
  playCopy:    noop as () => void,
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function SoundFxProvider({ children }: { children: ReactNode }) {
  // Start muted (SSR-safe). After hydration: default ON unless explicitly muted ("1").
  const [muted, setMuted] = useState(true);
  const mutedRef = useRef(true);
  mutedRef.current = muted;

  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  // Create player once, client-side only
  useEffect(() => {
    playerRef.current = createAudioPlayer(() => mutedRef.current);
    return () => { playerRef.current?.stopLoopImmediate(); };
  }, []);

  // Resolve saved preference — null (no pref) → ON; "0" → ON; "1" → muted
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MUTE_KEY);
      setMuted(saved === "1");
    } catch {}
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try { localStorage.setItem(MUTE_KEY, next ? "1" : "0"); } catch {}
      // Flag 3: muting mid-generation must stop the loop immediately
      if (next) playerRef.current?.stopLoopImmediate();
      return next;
    });
  }, []);

  const p = () => playerRef.current;

  const value: SoundContextValue = {
    muted,
    toggleMute,
    playReveal:        () => p()?.playReveal(),
    playCopy:          () => p()?.playCopy(),
    playLevelUp:       () => p()?.playLevelUp(),
    playComplete:      () => p()?.playComplete(),
    playFavorite:      () => p()?.playFavorite(),
    playButtonPress:   () => p()?.playButtonPress(),
    playConjureStart:  () => p()?.playConjureStart(),
    startAnticipation: () => p()?.startAnticipation(),
    stopAnticipation:  () => p()?.stopAnticipation(),
    playStreak:        (n) => p()?.playStreak(n),
    playNudge:         () => p()?.playNudge(),
    playShare:         () => p()?.playShare(),
  };

  // Keep module-level refs in sync for out-of-tree callers
  globalSoundFx.playReveal  = value.playReveal;
  globalSoundFx.playLevelUp = value.playLevelUp;
  globalSoundFx.playCopy    = value.playCopy;

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

// ── SoundToggle — with one-time "sound on" hint for new users ────────────────

export function SoundToggle({ className = "" }: { className?: string }) {
  const { muted, toggleMute } = useSoundFx();
  const [showHint, setShowHint] = useState(false);
  const hintShownRef = useRef(false); // prevent re-showing within same session

  // Show hint once when sound is first found to be ON (after hydration resolves mute state)
  useEffect(() => {
    if (hintShownRef.current || muted) return;
    try {
      if (!localStorage.getItem(HINT_KEY)) {
        hintShownRef.current = true;
        setShowHint(true);
      }
    } catch {}
  }, [muted]);

  // Auto-dismiss after 4s and mark as seen
  useEffect(() => {
    if (!showHint) return;
    const t = setTimeout(() => {
      setShowHint(false);
      try { localStorage.setItem(HINT_KEY, "1"); } catch {}
    }, 4000);
    return () => clearTimeout(t);
  }, [showHint]);

  function handleClick() {
    setShowHint(false);
    try { localStorage.setItem(HINT_KEY, "1"); } catch {}
    toggleMute();
  }

  return (
    <div className="relative inline-flex">
      {showHint && !muted && (
        <span className="absolute top-full mt-1.5 right-0 z-50 whitespace-nowrap rounded-lg bg-black/75 px-2.5 py-1 text-[10px] font-medium text-white/85 pointer-events-none select-none">
          🔊 sound on — tap to mute
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        title={muted ? "Unmute sounds" : "Mute sounds"}
        className={`rounded-full border border-white/15 bg-white/5 p-2 text-sm hover:bg-white/10 transition-colors ${className}`}
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}
