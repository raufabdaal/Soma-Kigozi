import React from 'react';
import { GradeLevel, UserStats } from '../types';
import { 
  Flame, 
  Sun, 
  Heart, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Sparkles,
  Users,
  GraduationCap
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';

interface NavbarProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  activeTab: 'study' | 'practice' | 'parent' | 'offline';
  setActiveTab: (tab: 'study' | 'practice' | 'parent' | 'offline') => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userStats,
  onUpdateStats,
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted,
}) => {
  const grades: GradeLevel[] = ['P.1', 'P.2', 'P.3', 'P.4', 'P.5', 'P.6', 'P.7'];

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    soundFx.playClick();
    const newGrade = e.target.value as GradeLevel;
    onUpdateStats({ ...userStats, gradeLevel: newGrade });
  };

  const toggleSound = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundFx.setMuted(nextMute);
    if (!nextMute) {
      soundFx.playClick();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand & Class Selector */}
        <div className="flex items-center gap-3">
          <button
            id="nav-brand-logo"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('study');
            }}
            className="flex items-center gap-2 group cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🇺🇬</span>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xl tracking-tight text-slate-900">SOMA</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  NCDC
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-700">Uganda Primary Learning</p>
            </div>
          </button>

          {/* Grade Level Selector */}
          <div className="relative">
            <select
              id="nav-grade-selector"
              value={userStats.gradeLevel}
              onChange={handleGradeChange}
              className="bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs sm:text-sm font-bold py-1.5 px-2.5 sm:px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer appearance-none pr-7"
            >
              {grades.map((g) => (
                <option key={g} value={g}>
                  Class {g}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
          </div>
        </div>

        {/* Gamification Stats: Streak, Gems, Hearts */}
        <div className="flex items-center gap-1.5 sm:gap-4">
          {/* Streak */}
          <div
            id="nav-streak-indicator"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 font-bold text-xs sm:text-sm shadow-2xs"
            title={`${userStats.currentStreak} Days Streak!`}
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{userStats.currentStreak}</span>
            {userStats.streakFreezes > 0 && (
              <span className="hidden md:inline-flex items-center text-[10px] text-sky-600 bg-sky-100 px-1.5 py-0.2 rounded-full font-semibold">
                <ShieldCheck className="w-3 h-3 mr-0.5" /> {userStats.streakFreezes}
              </span>
            )}
          </div>

          {/* Enjuba Sun Gems */}
          <div
            id="nav-gems-indicator"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs sm:text-sm shadow-2xs"
            title={`${userStats.enjubaGems} Enjuba Sun Gems earned`}
          >
            <Sun className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{userStats.enjubaGems}</span>
          </div>

          {/* Hearts / Energy */}
          <div
            id="nav-hearts-indicator"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs sm:text-sm shadow-2xs"
            title={`${userStats.hearts} Hearts remaining`}
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>{userStats.hearts}</span>
          </div>
        </div>

        {/* Actions & Navigation Mode Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Offline / Data-Saver Manager Toggle */}
          <button
            id="nav-offline-btn"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('offline');
            }}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              userStats.isOfflineMode
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Offline & Low Bandwidth Manager"
          >
            {userStats.isOfflineMode ? (
              <WifiOff className="w-4 h-4 text-amber-700" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-600" />
            )}
            <span className="hidden lg:inline">
              {userStats.isOfflineMode ? 'Offline Mode' : 'Online Sync'}
            </span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="nav-sound-toggle"
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer"
            title={isMuted ? 'Unmute game sounds' : 'Mute game sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* View Switcher: Student vs Parent */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              id="nav-tab-student"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('study');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'study' || activeTab === 'practice'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Learn</span>
            </button>

            <button
              id="nav-tab-parent"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('parent');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'parent'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Parent Portal</span>
              <span className="hidden xl:inline-flex text-[9px] bg-amber-400 text-slate-900 px-1 rounded font-black">
                WRAPPED
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
