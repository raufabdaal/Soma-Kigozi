import React, { useState } from 'react';
import { UserStats, SubjectId } from '../types';
import { SUBJECTS } from '../data/curriculumData';
import { 
  Flame, 
  Sparkles, 
  ChevronDown, 
  Check, 
  Globe, 
  FlaskConical, 
  Calculator, 
  BookOpenCheck 
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';

interface NavbarProps {
  userStats: UserStats;
  activeSubject: SubjectId;
  setActiveSubject: (subject: SubjectId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userStats,
  activeSubject,
  setActiveSubject,
}) => {
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const currentSubject = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];

  const getSubjectIcon = (id: SubjectId, sizeClass = 'w-5 h-5') => {
    switch (id) {
      case 'sst':
        return <Globe className={`${sizeClass} text-blue-500`} />;
      case 'science':
        return <FlaskConical className={`${sizeClass} text-emerald-500`} />;
      case 'math':
        return <Calculator className={`${sizeClass} text-amber-500`} />;
      case 'english':
        return <BookOpenCheck className={`${sizeClass} text-rose-500`} />;
      default:
        return <Globe className={`${sizeClass} text-blue-500`} />;
    }
  };

  const getSubjectTheme = (id: SubjectId) => {
    switch (id) {
      case 'sst':
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-600',
          badgeBg: 'bg-blue-50 text-blue-900 border-blue-200',
          glow: 'shadow-blue-500/20',
        };
      case 'science':
        return {
          bg: 'bg-emerald-500',
          border: 'border-emerald-600',
          badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          glow: 'shadow-emerald-500/20',
        };
      case 'math':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-600',
          badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
          glow: 'shadow-amber-500/20',
        };
      case 'english':
        return {
          bg: 'bg-rose-500',
          border: 'border-rose-600',
          badgeBg: 'bg-rose-50 text-rose-900 border-rose-200',
          glow: 'shadow-rose-500/20',
        };
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-slate-200/90 shadow-2xs">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Prominent Subject Switcher with Flag/Icon Badge */}
        <div className="relative">
          <button
            id="nav-subject-switcher-btn"
            onClick={() => {
              soundFx.playClick();
              setShowSubjectMenu(!showSubjectMenu);
            }}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 transition-all cursor-pointer shadow-xs active:translate-y-0.5"
          >
            {/* Subject Flag/Icon Pill */}
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shadow-inner">
              {getSubjectIcon(activeSubject, 'w-4.5 h-4.5')}
            </div>

            <div className="text-left">
              <span className="font-heading font-black text-xs sm:text-sm text-slate-900 block leading-tight">
                {currentSubject.name}
              </span>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                {userStats.gradeLevel} Curriculum
              </span>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-slate-400 ml-1 transition-transform duration-200 ${
                showSubjectMenu ? 'rotate-180 text-slate-800' : ''
              }`}
            />
          </button>

          {/* Subject Switcher Popover */}
          {showSubjectMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSubjectMenu(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-2.5 z-50 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Select P.7 Subject
                </div>

                {SUBJECTS.map((subj) => {
                  const isSelected = subj.id === activeSubject;
                  const theme = getSubjectTheme(subj.id);

                  return (
                    <button
                      key={subj.id}
                      id={`subject-select-${subj.id}`}
                      onClick={() => {
                        soundFx.playClick();
                        setActiveSubject(subj.id);
                        setShowSubjectMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? `${theme.badgeBg} font-black shadow-xs`
                          : 'hover:bg-slate-100 text-slate-700 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                          {getSubjectIcon(subj.id, 'w-5 h-5')}
                        </div>
                        <div>
                          <div className="font-heading text-xs sm:text-sm text-slate-900 leading-tight">
                            {subj.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {subj.badgeLabel || 'NCDC Core'}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: Crisp Metrics (Streak & Gems) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Flame */}
          <div
            id="nav-streak-indicator"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 font-extrabold text-xs sm:text-sm shadow-xs select-none"
            title={`${userStats.currentStreak} Day Study Streak`}
          >
            <Flame className="w-4.5 h-4.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span className="font-heading">{userStats.currentStreak}</span>
          </div>

          {/* Enjuba Gems */}
          <div
            id="nav-gems-indicator"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-900 font-extrabold text-xs sm:text-sm shadow-xs select-none"
            title={`${userStats.enjubaGems} Enjuba Gems`}
          >
            <Sparkles className="w-4.5 h-4.5 text-blue-600 fill-blue-400" />
            <span className="font-heading">{userStats.enjubaGems}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
