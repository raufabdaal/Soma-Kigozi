import React from 'react';
import { BookOpen, Zap, Trophy, Download } from 'lucide-react';
import { soundFx } from '../services/soundEffects';

export type NavTab = 'study' | 'practice' | 'parent' | 'offline';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  completedLessonsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    {
      id: 'study' as NavTab,
      label: 'Learn',
      icon: BookOpen,
      color: 'text-blue-500',
      activeBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    {
      id: 'practice' as NavTab,
      label: 'Practice',
      icon: Zap,
      color: 'text-amber-500',
      activeBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    {
      id: 'parent' as NavTab,
      label: 'Progress',
      icon: Trophy,
      color: 'text-emerald-500',
      activeBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'offline' as NavTab,
      label: 'Offline',
      icon: Download,
      color: 'text-indigo-500',
      activeBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    },
  ];

  return (
    <nav
      id="duolingo-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#131f24]/95 backdrop-blur-md border-t-2 border-slate-200 dark:border-[#37464f] shadow-lg px-2 sm:px-6 py-2 transition-colors duration-200"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? `${tab.activeBg} border-2 font-black shadow-xs`
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1b2a32] font-bold'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 sm:w-6 sm:h-6 stroke-[2.4] ${
                    isActive ? tab.color : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <span
                className={`text-[11px] sm:text-xs mt-1 tracking-tight ${
                  isActive ? 'font-heading font-black' : 'font-semibold'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
