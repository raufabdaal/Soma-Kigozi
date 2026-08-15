import React from 'react';
import { UserStats } from '../types';
import { 
  Flame, 
  Sparkles, 
  Heart, 
  Menu,
  GraduationCap,
  Users
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';

interface NavbarProps {
  userStats: UserStats;
  onOpenDrawer: () => void;
  activeTab: 'study' | 'practice' | 'parent' | 'offline';
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userStats,
  onOpenDrawer,
  activeTab,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Clean Brand Logo & Locked Pilot Track */}
        <div className="flex items-center gap-3">
          <button
            id="nav-brand-logo"
            onClick={() => {
              soundFx.playClick();
              onNavigateHome();
            }}
            className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm border-2 border-amber-500 group-hover:scale-105 transition-transform">
              🇺🇬
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xl tracking-tight text-slate-900">
                  SOMA
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  NCDC P.7
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 hidden sm:block">
                Ugandan Primary Ecosystem
              </p>
            </div>
          </button>

          {/* Active Context Chip */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            {activeTab === 'parent' ? (
              <>
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Parent Portal View</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>Primary 7 • Social Studies (SST)</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Gamification Badges & Hamburger Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Streak Chip */}
          <div
            id="nav-streak-indicator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 font-extrabold text-xs sm:text-sm shadow-xs select-none"
            title={`${userStats.currentStreak} Day Study Streak`}
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{userStats.currentStreak}</span>
          </div>

          {/* Enjuba Gems Chip */}
          <div
            id="nav-gems-indicator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-900 font-extrabold text-xs sm:text-sm shadow-xs select-none"
            title={`${userStats.enjubaGems} Enjuba Gems`}
          >
            <Sparkles className="w-4 h-4 text-blue-600 fill-blue-400" />
            <span>{userStats.enjubaGems}</span>
          </div>

          {/* Energy Hearts Chip */}
          <div
            id="nav-hearts-indicator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-900 font-extrabold text-xs sm:text-sm shadow-xs select-none"
            title={`${userStats.hearts} of ${userStats.maxHearts} Hearts`}
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>{userStats.hearts}</span>
          </div>

          {/* Hamburger Menu Trigger */}
          <button
            id="nav-hamburger-btn"
            onClick={() => {
              soundFx.playClick();
              onOpenDrawer();
            }}
            className="btn-duo-white p-2.5 rounded-2xl flex items-center justify-center cursor-pointer text-slate-700 hover:text-slate-950"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </header>
  );
};
