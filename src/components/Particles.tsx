"use client";

const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: `${Math.floor((i * 37 + 11) % 100)}%`,
  top: `${Math.floor((i * 53 + 23) % 100)}%`,
  size: (i % 3) + 2,
  color: i % 2 === 0 ? "rgba(124,58,237,0.6)" : "rgba(16,185,129,0.6)",
  duration: 4 + (i % 4),
  delay: (i * 0.3) % 3,
}));

export default function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            filter: "blur(1px)",
            animation: `particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
