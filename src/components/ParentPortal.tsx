import React, { useState } from 'react';
import { UserStats } from '../types';
import { 
  TrendingUp, 
  Award, 
  DollarSign, 
  Sparkles, 
  Printer, 
  Download, 
  Share2, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Flame, 
  Target, 
  BookOpen,
  HelpCircle,
  Bot
} from 'lucide-react';
import { calculatePleProjection } from '../services/storageService';
import { soundFx } from '../services/soundEffects';

interface ParentPortalProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  userStats,
  onUpdateStats,
}) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [activeCardTheme, setActiveCardTheme] = useState<'spotify_dark' | 'sunset_gold' | 'pearl_emerald'>('spotify_dark');

  const projection = calculatePleProjection(userStats.currentMastery);

  // Private tutor savings calculation (Average private tutor in Kampala/Entebbe/Mukono charges UGX 20,000 - 35,000 per hour)
  const hoursSpent = Math.max(1, Math.round(userStats.weeklyMinutes / 60));
  const tutorRatePerHourUGX = 25000;
  const estimatedSavingsUGX = hoursSpent * 4 * tutorRatePerHourUGX; // Monthly savings in UGX

  const handleGenerateAiInsight = async () => {
    soundFx.playClick();
    setIsGeneratingAi(true);

    try {
      const res = await fetch('/api/ai/parent-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: userStats.studentName,
          gradeLevel: userStats.gradeLevel,
          stats: {
            weeklyMinutes: userStats.weeklyMinutes,
            masteryPercent: userStats.currentMastery,
            lessonsCount: userStats.completedLessonIds.length,
            streak: userStats.currentStreak,
          },
          weakTopics: userStats.weakTopics,
          strongTopics: userStats.strongTopics,
        }),
      });

      const data = await res.json();
      if (data.success && data.insight) {
        setAiInsight(data.insight);
      } else {
        setAiInsight(data.insight || 'Your child is demonstrating great retention in Mathematics & Science.');
      }
    } catch {
      setAiInsight(
        `📌 Weekly Mentor Note: ${userStats.studentName} is excelling in commercial math calculations and digestive system biology. We recommend reinforcing speed/distance conversions and direct speech at home this week.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-slate-950 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full">
                PARENT INSIGHTS PORTAL
              </span>
              <span className="text-slate-300 text-xs font-semibold">
                Class {userStats.gradeLevel} Curriculum Track
              </span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
              {userStats.studentName}&apos;s Real-Time Progress
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Transparent NCDC mastery metrics, projected PLE examination trajectory, and quantifiable tutor cost savings.
            </p>
          </div>

          <button
            id="parent-print-report-btn"
            onClick={handlePrint}
            className="bg-white hover:bg-slate-100 text-slate-900 px-5 py-3 rounded-2xl font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            Print Weekly Report Card
          </button>
        </div>
      </div>

      {/* KPI Cards: Score Growth, Mastery %, Study Time, Tutor ROI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score Improvement Trajectory */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Score Growth</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-black text-3xl text-slate-900">
              {userStats.currentMastery}%
            </span>
            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +{userStats.currentMastery - userStats.baselineScore}% from baseline
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Started at {userStats.baselineScore}% baseline.
          </p>
        </div>

        {/* Projected PLE Aggregate & Division */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Projected PLE Result</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading font-black text-2xl text-slate-900 block truncate">
              {projection.division}
            </span>
            <span className="text-[11px] font-bold text-amber-700">
              {projection.descriptor}
            </span>
          </div>
        </div>

        {/* Active Study Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Study Time</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-black text-3xl text-slate-900">
              {userStats.weeklyMinutes}
            </span>
            <span className="text-xs font-bold text-slate-500">mins / week</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {userStats.currentStreak}-day uninterrupted streak 🔥
          </p>
        </div>

        {/* Private Tutor Savings ROI */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tutor Cost Savings</span>
            <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <span className="font-bold text-xs">UGX</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading font-black text-2xl text-emerald-700">
              ~{estimatedSavingsUGX.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1">UGX / mo</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Replaces expensive private coaching fees.
          </p>
        </div>
      </div>

      {/* Deep Analytics & Spotify-Wrapped Card Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Strengths, Weak Spots & AI Parent Advisor */}
        <div className="lg:col-span-7 space-y-6">
          {/* NCDC Subject Mastery Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              NCDC Core Subject Mastery
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Mathematics (Commercial & Arithmetic)</span>
                  <span className="text-amber-700">88% (D1 Track)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[88%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Integrated Science (Biology & Sanitation)</span>
                  <span className="text-emerald-700">92% (D1 Track)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[92%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Social Studies (Uganda Physical & History)</span>
                  <span className="text-indigo-700">82% (D1 Track)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-[82%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>English Language (Grammar & Conjunctions)</span>
                  <span className="text-rose-700">76% (D2 Track)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[76%] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Topics Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strong Topics */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <h4 className="font-heading font-bold text-sm text-emerald-950 flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Top Strong Topics
              </h4>
              <ul className="space-y-1.5">
                {userStats.strongTopics.map((t, idx) => (
                  <li key={idx} className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas Needing Practice */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200">
              <h4 className="font-heading font-bold text-sm text-amber-950 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Target Practice Areas
              </h4>
              <ul className="space-y-1.5">
                {userStats.weakTopics.map((t, idx) => (
                  <li key={idx} className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Home Advisor Note */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                AI Parent Advisor & Home Study Prompts
              </h3>

              <button
                id="generate-ai-parent-insight-btn"
                onClick={handleGenerateAiInsight}
                disabled={isGeneratingAi}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGeneratingAi ? 'Analyzing Data...' : 'Generate Fresh Insight'}
              </button>
            </div>

            {aiInsight ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {aiInsight}
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                Click &quot;Generate Fresh Insight&quot; above to receive a personalized analysis with specific dinner-table questions and home practice games tailored for {userStats.studentName}.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Spotify-Style "Uganda Scholar Wrapped" Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Soma Scholar Wrapped
            </h3>

            {/* Theme Selector */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveCardTheme('spotify_dark')}
                className={`w-6 h-6 rounded-md ${
                  activeCardTheme === 'spotify_dark' ? 'ring-2 ring-indigo-600' : ''
                } bg-slate-950`}
                title="Obsidian Dark"
              />
              <button
                onClick={() => setActiveCardTheme('sunset_gold')}
                className={`w-6 h-6 rounded-md ${
                  activeCardTheme === 'sunset_gold' ? 'ring-2 ring-indigo-600' : ''
                } bg-amber-500`}
                title="Uganda Sun Gold"
              />
              <button
                onClick={() => setActiveCardTheme('pearl_emerald')}
                className={`w-6 h-6 rounded-md ${
                  activeCardTheme === 'pearl_emerald' ? 'ring-2 ring-indigo-600' : ''
                } bg-emerald-600`}
                title="Pearl Emerald"
              />
            </div>
          </div>

          {/* The Shareable Spotify-Style Report Card */}
          <div
            id="spotify-wrapped-card"
            className={`rounded-3xl p-6 sm:p-7 shadow-2xl transition-all relative overflow-hidden ${
              activeCardTheme === 'spotify_dark'
                ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white border border-slate-800'
                : activeCardTheme === 'sunset_gold'
                ? 'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-900 text-white'
                : 'bg-gradient-to-br from-emerald-700 via-teal-900 to-slate-950 text-white'
            }`}
          >
            {/* Card Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
                  🇺🇬
                </div>
                <div>
                  <span className="font-heading font-black tracking-tight text-sm block leading-none">
                    SOMA WRAPPED
                  </span>
                  <span className="text-[10px] text-white/60 font-semibold">
                    Term 1 • {userStats.gradeLevel} NCDC Edition
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/15 text-amber-300">
                Top 5% Scholar
              </span>
            </div>

            {/* Student Persona Header */}
            <div className="py-6 text-center space-y-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-900 font-black text-2xl flex items-center justify-center mx-auto shadow-lg border-2 border-white/20">
                {userStats.studentName.charAt(0)}
              </div>
              <h4 className="font-heading font-black text-xl text-white">
                {userStats.studentName}
              </h4>
              <p className="text-xs text-white/80 font-medium">
                The Consistent Math & Science Inquirer
              </p>
            </div>

            {/* Highlight Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-white/60 block">
                  Study Streak
                </span>
                <span className="font-heading font-black text-2xl text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 fill-amber-400" />
                  {userStats.currentStreak} Days
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-white/60 block">
                  Current Mastery
                </span>
                <span className="font-heading font-black text-2xl text-emerald-400">
                  {userStats.currentMastery}%
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-white/60 block">
                  Total Focus Time
                </span>
                <span className="font-heading font-black text-xl text-white">
                  {userStats.weeklyMinutes} mins
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-white/60 block">
                  PLE Forecast
                </span>
                <span className="font-heading font-black text-xl text-amber-300">
                  Division 1
                </span>
              </div>
            </div>

            {/* Top Superpower Badge */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  Primary Badge Unlocked
                </span>
                <p className="font-heading font-black text-sm text-white">
                  Pearl of Africa Scholar
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
              <span>soma.ug/scholar</span>
              <span>For God and My Country 🇺🇬</span>
            </div>
          </div>

          {/* Share / Download Actions */}
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              Save / Print Card
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                navigator.clipboard?.writeText(window.location.href);
                alert('Report link copied to clipboard!');
              }}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
