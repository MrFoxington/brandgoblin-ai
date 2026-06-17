"use client";

export default function CrystalIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <style>{`
          @keyframes crystal-float {
            0%,100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          @keyframes crystal-spin-glow {
            0%   { opacity: 0.5; transform: scale(1) rotate(0deg); }
            50%  { opacity: 1;   transform: scale(1.15) rotate(180deg); }
            100% { opacity: 0.5; transform: scale(1) rotate(360deg); }
          }
          @keyframes sparkle-1 {
            0%,100% { opacity: 0; transform: scale(0) rotate(0deg); }
            40%,60% { opacity: 1; transform: scale(1) rotate(180deg); }
          }
          @keyframes sparkle-2 {
            0%,100% { opacity: 0; transform: scale(0) rotate(0deg); }
            30%,70% { opacity: 1; transform: scale(1) rotate(90deg); }
          }
          @keyframes sparkle-3 {
            0%,100% { opacity: 0; transform: scale(0); }
            50%      { opacity: 1; transform: scale(1.2); }
          }
          @keyframes inner-pulse {
            0%,100% { opacity: 0.6; }
            50%      { opacity: 1; }
          }
          .c-float      { animation: crystal-float 3.2s ease-in-out infinite; transform-origin: 80px 110px; }
          .c-orbit      { animation: crystal-spin-glow 6s linear infinite; transform-origin: 80px 110px; }
          .c-sp1        { animation: sparkle-1 2.4s ease-in-out infinite; transform-origin: 18px 48px; }
          .c-sp2        { animation: sparkle-2 3.1s ease-in-out infinite 0.6s; transform-origin: 140px 70px; }
          .c-sp3        { animation: sparkle-3 2s ease-in-out infinite 1.2s; transform-origin: 30px 150px; }
          .c-sp4        { animation: sparkle-1 2.8s ease-in-out infinite 0.9s; transform-origin: 128px 155px; }
          .c-sp5        { animation: sparkle-2 3.5s ease-in-out infinite 0.3s; transform-origin: 80px 20px; }
          .c-inner      { animation: inner-pulse 2s ease-in-out infinite; }
        `}</style>

        {/* Outer glow ring */}
        <radialGradient id="glowGrad" cx="50%" cy="55%" r="50%">
          <stop offset="0%"   stopColor="#a78bfa" stopOpacity="0.6"/>
          <stop offset="60%"  stopColor="#7c3aed" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
        </radialGradient>

        {/* Crystal face gradients */}
        <linearGradient id="faceFront" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#c4b5fd"/>
          <stop offset="50%"  stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#4c1d95"/>
        </linearGradient>
        <linearGradient id="faceLeft" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#6d28d9"/>
          <stop offset="100%" stopColor="#2e1065"/>
        </linearGradient>
        <linearGradient id="faceRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#10b981"/>
          <stop offset="100%" stopColor="#065f46"/>
        </linearGradient>
        <linearGradient id="faceTop" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor="#e9d5ff"/>
          <stop offset="100%" stopColor="#a78bfa"/>
        </linearGradient>
        <linearGradient id="faceBottomLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#34d399"/>
          <stop offset="100%" stopColor="#065f46"/>
        </linearGradient>
        <linearGradient id="faceBottomRight" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#8b5cf6"/>
          <stop offset="100%" stopColor="#3b0764"/>
        </linearGradient>
      </defs>

      {/* Outer rotating glow ring */}
      <g className="c-orbit">
        <ellipse cx="80" cy="115" rx="62" ry="58" fill="url(#glowGrad)"/>
      </g>

      {/* Sparkles */}
      {/* Top sparkle */}
      <g className="c-sp5">
        <line x1="80" y1="12" x2="80" y2="28" stroke="#e9d5ff" strokeWidth="2" strokeLinecap="round"/>
        <line x1="72" y1="20" x2="88" y2="20" stroke="#e9d5ff" strokeWidth="2" strokeLinecap="round"/>
        <line x1="74" y1="14" x2="86" y2="26" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="86" y1="14" x2="74" y2="26" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      {/* Top-left sparkle */}
      <g className="c-sp1">
        <line x1="18" y1="42" x2="18" y2="54" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="48" x2="24" y2="48" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round"/>
        <line x1="13" y1="43" x2="23" y2="53" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="23" y1="43" x2="13" y2="53" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      {/* Right sparkle */}
      <g className="c-sp2">
        <line x1="140" y1="64" x2="140" y2="76" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round"/>
        <line x1="134" y1="70" x2="146" y2="70" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round"/>
        <line x1="135" y1="65" x2="145" y2="75" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="145" y1="65" x2="135" y2="75" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      {/* Bottom-left sparkle */}
      <g className="c-sp3">
        <line x1="30" y1="150" x2="30" y2="160" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="25" y1="155" x2="35" y2="155" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      {/* Bottom-right sparkle */}
      <g className="c-sp4">
        <line x1="128" y1="149" x2="128" y2="161" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="122" y1="155" x2="134" y2="155" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* Crystal body */}
      <g className="c-float">
        {/* Top cap */}
        <polygon points="80,38 56,82 80,70 104,82" fill="url(#faceTop)"/>

        {/* Front-left face */}
        <polygon points="56,82 44,148 80,160 80,70" fill="url(#faceFront)"/>

        {/* Front-right face */}
        <polygon points="104,82 116,148 80,160 80,70" fill="url(#faceRight)"/>

        {/* Left side face */}
        <polygon points="80,38 56,82 80,70" fill="url(#faceLeft)"/>

        {/* Right side face */}
        <polygon points="80,38 104,82 80,70" fill="url(#faceTop)" opacity="0.8"/>

        {/* Bottom-left */}
        <polygon points="44,148 80,190 80,160" fill="url(#faceBottomLeft)"/>

        {/* Bottom-right */}
        <polygon points="116,148 80,190 80,160" fill="url(#faceBottomRight)"/>

        {/* Inner shine highlight */}
        <g className="c-inner">
          <polygon points="80,45 68,75 80,68 92,75" fill="white" opacity="0.35"/>
          <polygon points="68,88 72,120 80,100" fill="white" opacity="0.18"/>
        </g>

        {/* Green inner glow */}
        <polygon points="90,95 108,138 80,152 80,80" fill="#10b981" opacity="0.12"/>

        {/* Edge lines for depth */}
        <polyline points="80,38 56,82 44,148 80,190 116,148 104,82 80,38" fill="none" stroke="#c4b5fd" strokeWidth="0.8" strokeOpacity="0.5"/>
        <line x1="80" y1="38" x2="80" y2="70" stroke="#e9d5ff" strokeWidth="0.8" strokeOpacity="0.6"/>
        <line x1="80" y1="70" x2="56" y2="82" stroke="#a78bfa" strokeWidth="0.6" strokeOpacity="0.5"/>
        <line x1="80" y1="70" x2="104" y2="82" stroke="#6ee7b7" strokeWidth="0.6" strokeOpacity="0.5"/>
        <line x1="80" y1="160" x2="80" y2="190" stroke="#a78bfa" strokeWidth="0.8" strokeOpacity="0.5"/>
      </g>
    </svg>
  );
}
