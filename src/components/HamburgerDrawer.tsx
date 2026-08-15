import React from 'react';
import { UserStats, SubjectId } from '../types';
import { SUBJECTS } from '../data/curriculumData';
import { 
  X, 
  BookOpen, 
  Zap, 
  Users, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Award, 
  Sliders, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';

interface HamburgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  activeTab: 'study' | 'practice' | 'parent' | 'offline';
  setActiveTab: (tab: 'study' | 'practice' | 'parent' | 'offline') => void;
  activeSubject: SubjectId;
  setActiveSubject: (subject: SubjectId) => void;
  onReopenOnboarding: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const HamburgerDrawer: React.FC<HamburgerDrawerProps> = ({
  isOpen,
  onClose,
  userStats,
  onUpdateStats,
  activeTab,
  setActiveTab,
  activeSubject,
  setActiveSubject,
  onReopenOnboarding,
  isMuted,
  setIsMuted,
}) => {
  if (!isOpen) return null;

  const handleSelectTab = (tab: 'study' | 'practice' | 'parent' | 'offline') => {
    soundFx.playClick();
    setActiveTab(tab);
    onClose();
  };

  const handleSelectSubject = (subjId: SubjectId) => {
    soundFx.playClick();
    setActiveSubject(subjId);
    setActiveTab('study');
    onClose();
  };

  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFx.setMuted(nextMuted);
    if (!nextMuted) soundFx.playClick();
  };

  const handleToggleOffline = () => {
    soundFx.playClick();
    onUpdateStats({
      ...userStats,
      isOfflineMode: !userStats.isOfflineMode,
    });
  };

  const handleToggleDataSaver = () => {
    soundFx.playClick();
    onUpdateStats({
      ...userStats,
      isDataSaver: !userStats.isDataSaver,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-in Menu Panel */}
      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col z-10 border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-base shadow-md">
              🇺🇬
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-white">
                Soma Navigation
              </h3>
              <p className="text-[11px] text-slate-300 font-semibold">
                Class {userStats.gradeLevel} • {userStats.userRole === 'parent' ? 'Parent Mode' : 'Student Mode'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Active Persona Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Active Scholar
                </span>
                <h4 className="font-heading font-black text-sm text-slate-900">
                  {userStats.studentName}
                </h4>
                <span className="text-[11px] font-bold text-emerald-700">
                  {userStats.gradeLevel} Candidate • {userStats.currentMastery}% Mastery
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-amber-600 flex items-center gap-1 justify-end">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {userStats.currentStreak} Days
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Daily Streak
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Main Platform Views */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
              Main Areas
            </span>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleSelectTab('study')}
                className={`p-3.5 rounded-2xl border-2 text-left font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'study'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'study' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black">Interactive Curriculum Trail</span>
                    <span className="text-[10px] text-slate-500 font-medium">Teach, Practice & Retain</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleSelectTab('practice')}
                className={`p-3.5 rounded-2xl border-2 text-left font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'practice'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'practice' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black">Speed Practice Arena</span>
                    <span className="text-[10px] text-slate-500 font-medium">Rapid PLE Timed Drills</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleSelectTab('parent')}
                className={`p-3.5 rounded-2xl border-2 text-left font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'parent'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-950 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'parent' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black">Parent Portal & Report Card</span>
                    <span className="text-[10px] text-slate-500 font-medium">PLE Trajectory & Tutor ROI</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleSelectTab('offline')}
                className={`p-3.5 rounded-2xl border-2 text-left font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'offline'
                    ? 'border-blue-500 bg-blue-50 text-blue-950 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'offline' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black">Offline Packs & Low Data</span>
                    <span className="text-[10px] text-slate-500 font-medium">Local Cache & Sync</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Section 2: Subject Selector (P.7 Pilot Focus) */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
              Primary 7 Curriculum Subjects
            </span>

            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map((sub) => {
                const isSelected = activeSubject === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectSubject(sub.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 text-blue-950 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {sub.ncdcCode.replace('NCDC-PRI-', '')}
                      </span>
                      {sub.id === 'sst' && (
                        <span className="text-[9px] font-extrabold text-blue-600">★ Pilot</span>
                      )}
                    </div>
                    <span className="font-heading font-black text-xs block leading-tight">
                      {sub.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Dev Testing & Controls */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
              Preferences & Dev Testing
            </span>

            {/* Reopen Onboarding (Dev testing button) */}
            <button
              id="dev-reopen-onboarding-btn"
              onClick={() => {
                soundFx.playClick();
                onClose();
                onReopenOnboarding();
              }}
              className="w-full p-3 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-amber-700" />
                <div className="text-left">
                  <span className="block font-black">Switch Role / Re-run Onboarding</span>
                  <span className="text-[10px] text-amber-700">Dev test role or class locks</span>
                </div>
              </div>
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            </button>

            {/* Audio Toggle */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                <span>Sound FX & Audio</span>
              </div>
              <button
                onClick={handleToggleSound}
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold cursor-pointer ${
                  isMuted ? 'bg-slate-200 text-slate-600' : 'bg-emerald-500 text-white'
                }`}
              >
                {isMuted ? 'Muted' : 'Enabled'}
              </button>
            </div>

            {/* Offline Simulation Toggle */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                {userStats.isOfflineMode ? <WifiOff className="w-4 h-4 text-amber-600" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
                <span>Offline Simulation</span>
              </div>
              <button
                onClick={handleToggleOffline}
                className={`px-3 py-1 rounded-xl text-[11px] font-extrabold cursor-pointer ${
                  userStats.isOfflineMode ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {userStats.isOfflineMode ? 'Offline' : 'Online'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
