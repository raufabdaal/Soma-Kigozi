import React from 'react';
import { SubjectId } from '../types';

interface SubjectBadgeProps {
  subjectId: SubjectId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SubjectBadge: React.FC<SubjectBadgeProps> = ({
  subjectId,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  switch (subjectId) {
    case 'sst':
      // Ugandan National Tricolor Crest / Shield for Social Studies
      return (
        <div
          className={`${sizeMap[size]} rounded-2xl bg-linear-to-b from-blue-500 to-indigo-600 border border-blue-400/50 shadow-xs flex items-center justify-center relative overflow-hidden shrink-0 ${className}`}
          title="Social Studies & Civics"
        >
          {/* Subtle Uganda Flag ribbon */}
          <div className="absolute top-0 inset-x-0 h-1.5 flex">
            <div className="flex-1 bg-black" />
            <div className="flex-1 bg-amber-400" />
            <div className="flex-1 bg-red-600" />
          </div>
          <svg className="w-5 h-5 text-white stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="9" />
            <path d="M3.6 9h16.8" />
            <path d="M3.6 15h16.8" />
            <path d="M11.5 3a17 17 0 0 0 0 18" />
            <path d="M12.5 3a17 17 0 0 1 0 18" />
          </svg>
        </div>
      );

    case 'science':
      // Emerald Flask with Bubbling Reactions
      return (
        <div
          className={`${sizeMap[size]} rounded-2xl bg-linear-to-b from-emerald-500 to-teal-700 border border-emerald-400/50 shadow-xs flex items-center justify-center relative overflow-hidden shrink-0 ${className}`}
          title="Integrated Science"
        >
          <svg className="w-5 h-5 text-white stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
            <path d="M8.5 2h7" />
            <path d="M7 16h10" />
          </svg>
        </div>
      );

    case 'math':
      // Radiant Gold Calculator & Geometry
      return (
        <div
          className={`${sizeMap[size]} rounded-2xl bg-linear-to-b from-amber-500 to-orange-600 border border-amber-400/50 shadow-xs flex items-center justify-center relative overflow-hidden shrink-0 ${className}`}
          title="Mathematics"
        >
          <svg className="w-5 h-5 text-white stroke-[2.4]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect width="16" height="20" x="4" y="2" rx="3" />
            <line x1="8" x2="16" y1="6" y2="6" />
            <line x1="16" x2="16" y1="14" y2="18" />
            <line x1="8" x2="8" y1="14" y2="18" />
            <line x1="12" x2="12" y1="14" y2="18" />
            <line x1="8" x2="16" y1="10" y2="10" />
          </svg>
        </div>
      );

    case 'english':
      // Rose & Purple Book with Quill
      return (
        <div
          className={`${sizeMap[size]} rounded-2xl bg-linear-to-b from-rose-500 to-pink-600 border border-rose-400/50 shadow-xs flex items-center justify-center relative overflow-hidden shrink-0 ${className}`}
          title="English Language"
        >
          <svg className="w-5 h-5 text-white stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
            <path d="m9 16 2 2 4-4" />
          </svg>
        </div>
      );

    default:
      return null;
  }
};
