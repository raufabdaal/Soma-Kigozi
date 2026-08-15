import React, { useState } from 'react';
import { UserStats, SubjectId } from '../types';
import { SUBJECTS } from '../data/curriculumData';
import { SubjectBadge } from './SubjectBadge';
import { 
  Flame, 
  Sparkles, 
  Heart, 
  ChevronDown, 
  Check, 
  Moon, 
  Sun, 
  Monitor, 
  ShieldAlert,
  Zap,
  Info
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';
import { ThemeMode } from '../services/themeManager';

interface NavbarProps {
  userStats: UserStats;
  activeSubject: SubjectId;
  setActiveSubject: (subject: SubjectId) => void;
  onNavigateHome?: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDarkMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  userStats,
  activeSubject,
  setActiveSubject,
  theme,
  setTheme,
  isDarkMode,
}) => {
  const [activeModal, setActiveModal] = useState<'subject' | 'streak' | 'gems' | 'hearts' | 'theme' | null>(null);

  const currentSubject = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];

  const getSubjectShortCode = (id: SubjectId) => {
    switch (id) {
      case 'sst':
        return 'SST';
      case 'science':
        return 'SCI';
      case 'math':
        return 'MTH';
      case 'english':
        return 'ENG';
    }
  };

  const closeModal = () => setActiveModal(null);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#131f24]/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-[#37464f] transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        
        {/* LEFT: DUOLINGO-STYLE SUBJECT FLAG SWITCHER */}
        <div className="relative">
          <button
            id="nav-subject-switcher-btn"
            onClick={() => {
              soundFx.playClick();
              setActiveModal(activeModal === 'subject' ? null : 'subject');
            }}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1b2a32] dark:hover:bg-[#202f36] border-2 border-slate-200 dark:border-[#37464f] text-slate-800 dark:text-slate-100 transition-all cursor-pointer shadow-xs active:translate-y-0.5"
            title="Switch Primary Subject"
          >
            {/* Subject Flag / Crest Badge */}
            <SubjectBadge subjectId={activeSubject} size="sm" />

            {/* Subject Short Code / Label */}
            <div className="hidden xs:flex flex-col text-left leading-tight pr-1">
              <span className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                {getSubjectShortCode(activeSubject)}
              </span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest hidden sm:block">
                {userStats.gradeLevel}
              </span>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-400 transition-transform duration-200 ${
                activeModal === 'subject' ? 'rotate-180 text-blue-500' : ''
              }`}
            />
          </button>

          {/* SUBJECT SWITCHER DROPDOWN POPOVER */}
          {activeModal === 'subject' && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeModal} />
              <div className="absolute top-full left-0 mt-2.5 w-76 sm:w-80 bg-white dark:bg-[#1b2a32] rounded-3xl border-2 border-slate-200 dark:border-[#37464f] shadow-2xl p-2.5 z-50 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    NCDC {userStats.gradeLevel} Subjects
                  </span>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    Uganda PLE Track
                  </span>
                </div>

                {SUBJECTS.map((subj) => {
                  const isSelected = subj.id === activeSubject;

                  return (
                    <button
                      key={subj.id}
                      id={`subject-select-${subj.id}`}
                      onClick={() => {
                        soundFx.playClick();
                        setActiveSubject(subj.id);
                        closeModal();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-600 shadow-xs'
                          : 'hover:bg-slate-100 dark:hover:bg-[#202f36] border-2 border-transparent text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <SubjectBadge subjectId={subj.id} size="md" />
                        <div>
                          <div className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                            {subj.name}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-400 font-bold mt-0.5">
                            {subj.badgeLabel || 'NCDC Core Syllabus'}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0 ml-2">
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

        {/* RIGHT: DUOLINGO TOP STATS (STREAK, GEMS, HEARTS, THEME) */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* 1. STREAK PILL */}
          <div className="relative">
            <button
              id="nav-streak-indicator"
              onClick={() => {
                soundFx.playClick();
                setActiveModal(activeModal === 'streak' ? null : 'streak');
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-300 font-extrabold text-xs sm:text-sm shadow-xs cursor-pointer active:translate-y-0.5 transition-all"
              title="Daily Study Streak"
            >
              <Flame className="w-4.5 h-4.5 fill-amber-500 text-amber-500 animate-pulse" />
              <span className="font-heading">{userStats.currentStreak}</span>
            </button>

            {/* Streak Popover */}
            {activeModal === 'streak' && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeModal} />
                <div className="absolute top-full right-0 mt-2.5 w-64 bg-white dark:bg-[#1b2a32] rounded-3xl border-2 border-slate-200 dark:border-[#37464f] shadow-2xl p-4 z-50 text-center space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center mx-auto text-amber-500 shadow-inner">
                    <Flame className="w-7 h-7 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-slate-900 dark:text-white text-base">
                      {userStats.currentStreak} Day Streak!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Practice daily to maintain your momentum for PLE distinctions.
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-[#202f36] p-2.5 rounded-2xl border border-amber-200 dark:border-[#37464f] flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Streak Freezes Equipped</span>
                    <span className="text-amber-600 dark:text-amber-400 font-black">{userStats.streakFreezes} 🛡️</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 2. ENJUBA GEMS PILL */}
          <div className="relative">
            <button
              id="nav-gems-indicator"
              onClick={() => {
                soundFx.playClick();
                setActiveModal(activeModal === 'gems' ? null : 'gems');
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-300 font-extrabold text-xs sm:text-sm shadow-xs cursor-pointer active:translate-y-0.5 transition-all"
              title="Enjuba Gems"
            >
              <Sparkles className="w-4.5 h-4.5 text-blue-600 fill-blue-400 dark:text-blue-400" />
              <span className="font-heading">{userStats.enjubaGems}</span>
            </button>

            {/* Gems Popover */}
            {activeModal === 'gems' && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeModal} />
                <div className="absolute top-full right-0 mt-2.5 w-64 bg-white dark:bg-[#1b2a32] rounded-3xl border-2 border-slate-200 dark:border-[#37464f] shadow-2xl p-4 z-50 text-center space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 flex items-center justify-center mx-auto text-blue-500 shadow-inner">
                    <Sparkles className="w-7 h-7 fill-blue-400 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-slate-900 dark:text-white text-base">
                      {userStats.enjubaGems} Enjuba Gems
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Earn gems by acing lesson checks and hitting daily study goals!
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 3. HEARTS PILL */}
          <div className="relative hidden xs:block">
            <button
              id="nav-hearts-indicator"
              onClick={() => {
                soundFx.playClick();
                setActiveModal(activeModal === 'hearts' ? null : 'hearts');
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-300 font-extrabold text-xs sm:text-sm shadow-xs cursor-pointer active:translate-y-0.5 transition-all"
              title="Practice Energy (Hearts)"
            >
              <Heart className="w-4.5 h-4.5 text-rose-600 fill-rose-500 dark:text-rose-400" />
              <span className="font-heading">{userStats.hearts}</span>
            </button>

            {/* Hearts Popover */}
            {activeModal === 'hearts' && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeModal} />
                <div className="absolute top-full right-0 mt-2.5 w-64 bg-white dark:bg-[#1b2a32] rounded-3xl border-2 border-slate-200 dark:border-[#37464f] shadow-2xl p-4 z-50 text-center space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
                    <Heart className="w-7 h-7 fill-rose-500 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-slate-900 dark:text-white text-base">
                      {userStats.hearts} / {userStats.maxHearts} Hearts
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Hearts keep you focused. In Soma, review mistakes in Practice Arena to refill!
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 4. THEME TOGGLE (SYSTEM AUTO / DARK / LIGHT) */}
          <div className="relative">
            <button
              id="nav-theme-toggle-btn"
              onClick={() => {
                soundFx.playClick();
                setActiveModal(activeModal === 'theme' ? null : 'theme');
              }}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1b2a32] dark:hover:bg-[#202f36] border-2 border-slate-200 dark:border-[#37464f] text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs active:translate-y-0.5"
              title="Theme Settings (System / Dark / Light)"
            >
              {theme === 'system' ? (
                <Monitor className="w-4.5 h-4.5 text-blue-500" />
              ) : isDarkMode ? (
                <Moon className="w-4.5 h-4.5 text-indigo-400" />
              ) : (
                <Sun className="w-4.5 h-4.5 text-amber-500" />
              )}
            </button>

            {/* Theme Dropdown */}
            {activeModal === 'theme' && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeModal} />
                <div className="absolute top-full right-0 mt-2.5 w-52 bg-white dark:bg-[#1b2a32] rounded-3xl border-2 border-slate-200 dark:border-[#37464f] shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Appearance
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setTheme('system');
                      closeModal();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                      theme === 'system'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202f36]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      <span>Auto (System)</span>
                    </div>
                    {theme === 'system' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setTheme('dark');
                      closeModal();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                      theme === 'dark'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202f36]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      <span>Dark Theme</span>
                    </div>
                    {theme === 'dark' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setTheme('light');
                      closeModal();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                      theme === 'light'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202f36]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      <span>Light Theme</span>
                    </div>
                    {theme === 'light' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
