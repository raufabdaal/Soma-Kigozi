import React from 'react';

interface CraneMascotProps {
  mood?: 'happy' | 'cheering' | 'studying' | 'streak';
  size?: 'sm' | 'md' | 'lg';
  speechText?: string;
  className?: string;
}

export const CraneMascot: React.FC<CraneMascotProps> = ({
  mood = 'happy',
  size = 'md',
  speechText,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Ugandan Crested Crane Vector Character */}
      <div className={`${sizeClasses[size]} shrink-0 relative select-none animate-bounce duration-1000`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Shadow */}
          <ellipse cx="50" cy="90" rx="30" ry="6" fill="#cbd5e1" className="dark:fill-[#202f36]" />

          {/* Body */}
          <ellipse cx="48" cy="60" rx="26" ry="22" fill="#334155" />
          <ellipse cx="48" cy="62" rx="21" ry="17" fill="#64748b" />

          {/* Neck */}
          <path
            d="M58 48 Q 66 32 60 18 Q 50 18 52 35 Z"
            fill="#1e293b"
          />

          {/* Head */}
          <circle cx="62" cy="20" r="14" fill="#0f172a" />
          {/* White cheek patch (Characteristic Crested Crane mark) */}
          <circle cx="60" cy="21" r="6.5" fill="#ffffff" />
          {/* Red cheek throat wattles */}
          <ellipse cx="64" cy="26" rx="3" ry="5" fill="#ef4444" />

          {/* Golden Crown Plumage (Feathers on head) */}
          <path
            d="M 54 8 L 56 16 L 60 6 L 62 15 L 66 4 L 67 15 L 72 7 L 70 17"
            stroke="#fbbf24"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Eyes */}
          <circle cx="59" cy="19" r="2.2" fill="#0f172a" />
          <circle cx="60" cy="18" r="0.8" fill="#ffffff" />

          {/* Beak */}
          <polygon points="73,19 86,22 73,26" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

          {/* Wing with Ugandan tricolor tint */}
          <path
            d="M 30 52 Q 45 42 60 55 Q 40 75 28 66 Z"
            fill="#475569"
            stroke="#334155"
            strokeWidth="2"
          />
          <path
            d="M 35 56 Q 44 50 52 58"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 38 61 Q 45 56 50 63"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Legs (Standing gracefully on one leg, iconic crane stance) */}
          <line x1="45" y1="80" x2="45" y2="90" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          <line x1="53" y1="80" x2="57" y2="85" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

          {/* Small Graduation Cap or Sparkle if mood is studying */}
          {mood === 'studying' && (
            <g transform="translate(48, -2)">
              <polygon points="12,4 24,0 12,-4 0,0" fill="#1e293b" />
              <polygon points="12,4 20,2 20,5 12,7" fill="#0f172a" />
              <line x1="22" y1="2" x2="22" y2="8" stroke="#fbbf24" strokeWidth="1" />
            </g>
          )}

          {mood === 'streak' && (
            <g transform="translate(68, 40) scale(0.6)">
              <path
                d="M10 2c0 0-4 4-4 8 0 4 3 6 5 6s4-2 4-6c0-3-2-5-5-8z"
                fill="#f59e0b"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Duolingo-style Speech Bubble with triangle indicator */}
      {speechText && (
        <div className="relative bg-white dark:bg-[#1b2a32] text-slate-800 dark:text-slate-100 px-4 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-[#37464f] shadow-sm max-w-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-8 border-r-slate-200 dark:border-r-[#37464f]" />
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-t-5 border-t-transparent border-b-5 border-b-transparent border-r-7 border-r-white dark:border-r-[#1b2a32]" />
          <p className="text-xs sm:text-sm font-extrabold leading-snug tracking-tight">
            {speechText}
          </p>
        </div>
      )}
    </div>
  );
};
