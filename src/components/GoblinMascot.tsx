"use client";

export default function GoblinMascot({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 280 340"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="BrandGoblin AI mascot"
      role="img"
    >
      <style>{`
        @keyframes goblin-float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes crystal-glow {
          0%,100% { opacity:1; }
          50% { opacity:0.55; }
        }
        @keyframes shadow-scale {
          0%,100% { transform: scaleX(1); opacity:0.35; }
          50% { transform: scaleX(0.75); opacity:0.15; }
        }
        .gob-float { animation: goblin-float 3.5s ease-in-out infinite; transform-origin: 140px 200px; }
        .gob-crystal { animation: crystal-glow 2s ease-in-out infinite; }
        .gob-shadow { animation: shadow-scale 3.5s ease-in-out infinite; transform-origin: 140px 320px; }
      `}</style>

      {/* Shadow */}
      <ellipse className="gob-shadow" cx="140" cy="320" rx="70" ry="12" fill="#7c3aed" opacity="0.35"/>

      <g className="gob-float">
        {/* BODY */}
        <ellipse cx="140" cy="230" rx="52" ry="62" fill="#1a1a2e"/>
        <path d="M112 195 L128 250 L140 225 L152 250 L168 195 Q140 182 112 195Z" fill="#0f0f1a"/>
        {/* G emblem */}
        <circle cx="140" cy="228" r="14" fill="#7c3aed" opacity="0.9"/>
        <text x="140" y="234" textAnchor="middle" fontFamily="'Space Grotesk',sans-serif" fontSize="14" fontWeight="700" fill="white">G</text>
        {/* Collar */}
        <path d="M120 194 Q140 186 160 194 L155 206 Q140 200 125 206Z" fill="#2d2d4e"/>

        {/* NECK */}
        <rect x="128" y="166" width="24" height="30" rx="7" fill="#4ade80"/>

        {/* HEAD */}
        <ellipse cx="140" cy="140" rx="52" ry="54" fill="#4ade80"/>

        {/* Ears */}
        <path d="M88 126 Q72 108 80 94 Q92 104 92 120Z" fill="#4ade80"/>
        <path d="M192 126 Q208 108 200 94 Q188 104 188 120Z" fill="#4ade80"/>
        <path d="M89 122 Q77 108 83 97 Q91 105 90 118Z" fill="#22c55e" opacity="0.5"/>
        <path d="M191 122 Q203 108 197 97 Q189 105 190 118Z" fill="#22c55e" opacity="0.5"/>

        {/* GOGGLES band */}
        <rect x="82" y="122" width="116" height="7" rx="3.5" fill="#4b21a8"/>
        {/* Goggle frames */}
        <ellipse cx="115" cy="137" rx="26" ry="20" fill="#3b0764"/>
        <ellipse cx="165" cy="137" rx="26" ry="20" fill="#3b0764"/>
        {/* Goggle bridge */}
        <rect x="137" y="131" width="26" height="7" rx="3" fill="#4b21a8"/>
        {/* Goggle lenses */}
        <ellipse cx="115" cy="137" rx="20" ry="15" fill="#7c3aed" opacity="0.85"/>
        <ellipse cx="165" cy="137" rx="20" ry="15" fill="#7c3aed" opacity="0.85"/>
        {/* Lens shine */}
        <ellipse cx="108" cy="131" rx="7" ry="4" fill="white" opacity="0.25"/>
        <ellipse cx="158" cy="131" rx="7" ry="4" fill="white" opacity="0.25"/>
        {/* Pupils */}
        <circle cx="115" cy="138" r="6" fill="#a78bfa"/>
        <circle cx="165" cy="138" r="6" fill="#a78bfa"/>
        <circle cx="118" cy="136" r="2" fill="white" opacity="0.7"/>
        <circle cx="168" cy="136" r="2" fill="white" opacity="0.7"/>

        {/* NOSE */}
        <ellipse cx="140" cy="158" rx="6" ry="4.5" fill="#22c55e"/>
        <circle cx="137" cy="159" r="1.5" fill="#166534" opacity="0.5"/>
        <circle cx="143" cy="159" r="1.5" fill="#166534" opacity="0.5"/>

        {/* MOUTH */}
        <path d="M124 170 Q132 179 140 180 Q148 179 156 170" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="131" y="171" width="6" height="5" rx="1" fill="white" opacity="0.9"/>
        <rect x="140" y="171" width="6" height="5" rx="1" fill="white" opacity="0.9"/>

        {/* RIGHT ARM — raised, holding crystal */}
        <path d="M190 210 Q220 175 226 158" fill="none" stroke="#4ade80" strokeWidth="20" strokeLinecap="round"/>
        {/* Hand */}
        <ellipse cx="229" cy="151" rx="14" ry="12" fill="#4ade80"/>
        <ellipse cx="221" cy="141" rx="5" ry="9" fill="#4ade80" transform="rotate(-15,221,141)"/>
        <ellipse cx="230" cy="138" rx="5" ry="10" fill="#4ade80" transform="rotate(-5,230,138)"/>
        <ellipse cx="239" cy="142" rx="5" ry="9" fill="#4ade80" transform="rotate(15,239,142)"/>

        {/* CRYSTAL */}
        <g className="gob-crystal">
          <ellipse cx="230" cy="118" rx="18" ry="18" fill="#7c3aed" opacity="0.3"/>
          <polygon points="230,85 218,104 222,125 230,129 238,125 242,104" fill="#7c3aed"/>
          <polygon points="230,85 218,104 230,109" fill="#a78bfa"/>
          <polygon points="230,85 242,104 230,109" fill="#6d28d9"/>
          <polygon points="218,104 222,125 230,109" fill="#8b5cf6"/>
          <polygon points="242,104 238,125 230,109" fill="#5b21b6"/>
          <polygon points="230,90 223,101 227,104" fill="white" opacity="0.4"/>
        </g>

        {/* LEFT ARM — relaxed at side */}
        <path d="M90 210 Q68 238 66 254" fill="none" stroke="#4ade80" strokeWidth="18" strokeLinecap="round"/>
        <ellipse cx="65" cy="260" rx="12" ry="10" fill="#4ade80"/>

        {/* LEGS */}
        <rect x="110" y="284" width="22" height="34" rx="9" fill="#0f0f1a"/>
        <rect x="148" y="284" width="22" height="34" rx="9" fill="#0f0f1a"/>
        {/* Boots */}
        <ellipse cx="121" cy="318" rx="16" ry="9" fill="#1e1b4b"/>
        <ellipse cx="159" cy="318" rx="16" ry="9" fill="#1e1b4b"/>
        <ellipse cx="116" cy="315" rx="5" ry="3" fill="#4c1d95" opacity="0.6"/>
        <ellipse cx="154" cy="315" rx="5" ry="3" fill="#4c1d95" opacity="0.6"/>
      </g>
    </svg>
  );
}
