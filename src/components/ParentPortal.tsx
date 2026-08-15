import React, { useState } from 'react';
import { UserStats } from '../types';
import { 
  TrendingUp, 
  Award, 
  DollarSign, 
  Printer, 
  Download, 
  Share2, 
  CheckCircle, 
  Flame, 
  Trophy, 
  GraduationCap
} from 'lucide-react';
import { calculatePleProjection } from '../services/storageService';
import { soundFx } from '../services/soundEffects';

interface ParentPortalProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  userStats,
}) => {
  const [activeCardTheme, setActiveCardTheme] = useState<'slate' | 'navy' | 'emerald'>('slate');

  const projection = calculatePleProjection(userStats.currentMastery);

  // Private tutor savings calculation (Average private tutor in Kampala/Entebbe charges UGX 25,000/hr)
  const hoursSpent = Math.max(1, Math.round(userStats.weeklyMinutes / 60));
  const tutorRatePerHourUGX = 25000;
  const estimatedSavingsUGX = hoursSpent * 4 * tutorRatePerHourUGX;

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      
      {/* Header Card */}
      <div className="bg-slate-900 dark:bg-[#1b2a32] rounded-3xl p-6 sm:p-7 text-white shadow-md border-b-4 border-slate-950 dark:border-[#37464f] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              PROGRESS & INSIGHTS
            </span>
            <span className="text-slate-300 text-xs font-semibold">
              Class {userStats.gradeLevel} Curriculum Track
            </span>
          </div>
          <h1 className="font-heading font-black text-xl sm:text-2xl text-white">
            {userStats.studentName}&apos;s Progress Summary
          </h1>
          <p className="text-slate-300 text-xs mt-1 font-medium">
            NCDC mastery metrics, UNEB PLE examination forecast, and study milestones.
          </p>
        </div>

        <button
          id="parent-print-report-btn"
          onClick={handlePrint}
          className="bg-white hover:bg-slate-100 text-slate-900 px-4 py-2.5 rounded-2xl font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 whitespace-nowrap self-start md:self-center"
        >
          <Printer className="w-4 h-4 text-blue-600" />
          Print Report Card
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-4 border-2 border-slate-200 dark:border-[#37464f] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Mastery</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-heading font-black text-2xl text-slate-900 dark:text-white">
              {userStats.currentMastery}%
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            +{userStats.currentMastery - userStats.baselineScore}% vs baseline
          </span>
        </div>

        <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-4 border-2 border-slate-200 dark:border-[#37464f] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">PLE Forecast</span>
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="font-heading font-black text-xl text-blue-900 dark:text-blue-300 block">
              {projection.division}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            Agg: {projection.aggregate}
          </span>
        </div>

        <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-4 border-2 border-slate-200 dark:border-[#37464f] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="mt-2">
            <span className="font-heading font-black text-2xl text-slate-900 dark:text-white">
              {userStats.currentStreak} Days
            </span>
          </div>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
            Active streak
          </span>
        </div>

        <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-4 border-2 border-slate-200 dark:border-[#37464f] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Tutor Savings</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="font-heading font-black text-lg text-emerald-900 dark:text-emerald-300 truncate">
              UGX {(estimatedSavingsUGX / 1000).toLocaleString()}k
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            Monthly value
          </span>
        </div>
      </div>

      {/* Target Dream Secondary School Aspirations */}
      <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-5 sm:p-6 border-2 border-slate-200 dark:border-[#37464f] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
              Dream Secondary School Goal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Target: {userStats.targetSecondarySchool || "King's College Budo"} (Cut-off: Aggregate 4-5)
            </p>
          </div>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            On Track
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#202f36] border border-slate-200 dark:border-[#37464f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-900 flex items-center justify-center font-heading font-black text-sm">
              <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <span className="font-heading font-black text-sm text-slate-900 dark:text-white block">
                Primary Leaving Examinations (PLE) Readiness
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {userStats.completedLessonIds.length} Curriculum Units Mastered • {userStats.totalXp} Total XP Earned
              </span>
            </div>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      {/* Printable Report Card Preview */}
      <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-5 sm:p-6 border-2 border-slate-200 dark:border-[#37464f] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
            Shareable Scholar Card
          </h3>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#202f36] p-1 rounded-xl">
            {(['slate', 'navy', 'emerald'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveCardTheme(t)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer ${
                  activeCardTheme === t
                    ? 'bg-white dark:bg-[#1b2a32] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Card Component */}
        <div
          className={`rounded-3xl p-6 text-white shadow-xl transition-all ${
            activeCardTheme === 'slate'
              ? 'bg-slate-900 border-2 border-slate-800'
              : activeCardTheme === 'navy'
              ? 'bg-blue-900 border-2 border-blue-800'
              : 'bg-emerald-900 border-2 border-emerald-800'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="font-heading font-black text-sm tracking-wider uppercase text-amber-300">
                OFFICIAL SCHOLAR REPORT
              </span>
              <p className="text-[10px] text-white/70 font-semibold">
                Primary 7 NCDC Official Track
              </p>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white">
              Division 1 Projected
            </span>
          </div>

          <div className="py-5 text-center space-y-1.5">
            <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center mx-auto shadow-md">
              <GraduationCap className="w-7 h-7 text-slate-950" />
            </div>
            <h4 className="font-heading font-black text-lg text-white">
              {userStats.studentName}
            </h4>
            <p className="text-xs text-white/80 font-medium">
              Target: {userStats.targetSecondarySchool || "King's College Budo"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-[9px] uppercase font-bold text-white/60 block">Mastery</span>
              <span className="font-heading font-black text-base text-emerald-400">{userStats.currentMastery}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-[9px] uppercase font-bold text-white/60 block">Streak</span>
              <span className="font-heading font-black text-base text-amber-400">{userStats.currentStreak}d</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-[9px] uppercase font-bold text-white/60 block">Forecast</span>
              <span className="font-heading font-black text-base text-amber-300">Agg {projection.aggregate}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 btn-duo-dark rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            Save / Print Card
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              navigator.clipboard?.writeText(window.location.href);
            }}
            className="px-5 py-3 btn-duo-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

    </div>
  );
};
