import React, { useState } from 'react';
import { UserStats, SubjectId } from '../types';
import { SUBJECTS } from '../data/curriculumData';
import { Flame, Sparkles, ChevronDown, Check } from 'lucide-react';
import { soundFx } from '../services/soundEffects';

interface NavbarProps {
  userStats: UserStats;
  activeSubject: SubjectId;
  setActiveSubject: (subject: SubjectId) => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userStats,
  activeSubject,
  setActiveSubject,
  onNavigateHome,
}) => {
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const currentSubject = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Clean Minimal Brand & Subject Selector */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            id="nav-brand-logo"
            onClick={() => {
              soundFx.playClick();
              onNavigateHome();
            }}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-heading font-black text-lg shadow-sm border-b-3 border-emerald-600 group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="font-heading font-black text-xl tracking-tight text-slate-900">
              SOMA
            </span>
          </button>

          {/* Subject Switcher Pill */}
          <div className="relative">
            <button
              id="nav-subject-selector-btn"
              onClick={() => {
                soundFx.playClick();
                setShowSubjectMenu(!showSubjectMenu);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-heading font-extrabold text-slate-800 transition-colors cursor-pointer"
            >
              <span>{currentSubject.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showSubjectMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Subject Selector Dropdown */}
            {showSubjectMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSubjectMenu(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-2 z-50 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Select P.7 Subject
                  </div>
                  {SUBJECTS.map((subj) => {
                    const isSelected = subj.id === activeSubject;
                    return (
                      <button
                        key={subj.id}
                        onClick={() => {
                          soundFx.playClick();
                          setActiveSubject(subj.id);
                          setShowSubjectMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-blue-900 border border-blue-200'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>{subj.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Only Essential Gamification Metrics (Streak & Gems) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Streak Flame */}
          <div
            id="nav-streak-indicator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 font-extrabold text-xs sm:text-sm shadow-xs select-none"
            title={`${userStats.currentStreak} Day Study Streak`}
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{userStats.currentStreak}</span>
          </div>

          {/* Enjuba Gems */}
          <div
            id="nav-gems-indicator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-900 font-extrabold text-xs sm:text-sm shadow-xs select-none"
            title={`${userStats.enjubaGems} Enjuba Gems`}
          >
            <Sparkles className="w-4 h-4 text-blue-600 fill-blue-400" />
            <span>{userStats.enjubaGems}</span>
          </div>

        </div>

      </div>
    </header>
  );
};
