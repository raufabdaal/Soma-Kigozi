import React from 'react';
import { CurriculumUnit, LessonNode, SubjectId, UserStats } from '../types';
import { SUBJECTS, DAILY_QUESTS } from '../data/curriculumData';
import { CraneMascot } from './CraneMascot';
import { SubjectBadge } from './SubjectBadge';
import { 
  CheckCircle2, 
  Lock, 
  Star, 
  Sparkles, 
  Trophy, 
  Zap, 
  ArrowRight, 
  BookOpen, 
  Gift,
  Compass,
  Award,
  TrendingUp,
  Target,
  Flame
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';
import { calculatePleProjection } from '../services/storageService';

interface StudentHomeProps {
  userStats: UserStats;
  units: CurriculumUnit[];
  activeSubject: SubjectId;
  setActiveSubject: (subject: SubjectId) => void;
  onSelectLesson: (lesson: LessonNode) => void;
  onOpenPractice: () => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  userStats,
  units,
  activeSubject,
  setActiveSubject,
  onSelectLesson,
  onOpenPractice,
}) => {
  const currentUnits = units.filter((u) => u.subjectId === activeSubject);
  const activeSubjectMeta = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];
  const pleProjection = calculatePleProjection(userStats.currentMastery);

  // Dynamic Unit Theme colors based on subject
  const getSubjectUnitTheme = (subjectId: SubjectId) => {
    switch (subjectId) {
      case 'sst':
        return {
          bannerBg: 'bg-[#1cb0f6]',
          bannerBorder: 'border-[#1899d6]',
          activeNodeBg: 'bg-[#1cb0f6]',
          activeNodeBorder: 'border-[#1899d6]',
          activeRing: 'ring-blue-400/30',
        };
      case 'science':
        return {
          bannerBg: 'bg-[#58cc02]',
          bannerBorder: 'border-[#46a302]',
          activeNodeBg: 'bg-[#58cc02]',
          activeNodeBorder: 'border-[#46a302]',
          activeRing: 'ring-emerald-400/30',
        };
      case 'math':
        return {
          bannerBg: 'bg-[#ff9600]',
          bannerBorder: 'border-[#cc7800]',
          activeNodeBg: 'bg-[#ff9600]',
          activeNodeBorder: 'border-[#cc7800]',
          activeRing: 'ring-amber-400/30',
        };
      case 'english':
        return {
          bannerBg: 'bg-[#ff4b4b]',
          bannerBorder: 'border-[#d33131]',
          activeNodeBg: 'bg-[#ff4b4b]',
          activeNodeBorder: 'border-[#d33131]',
          activeRing: 'ring-rose-400/30',
        };
    }
  };

  const currentTheme = getSubjectUnitTheme(activeSubject);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-32">
      
      {/* DESKTOP / TABLET TWO-COLUMN SHELL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CENTER / MAIN COLUMN: THE DUOLINGO WINDING LEARNING PATH */}
        <div className="lg:col-span-7 w-full max-w-lg mx-auto">
          
          {currentUnits.length === 0 ? (
            <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-8 text-center border-2 border-slate-200 dark:border-[#37464f] shadow-xs space-y-4 my-8">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border-2 border-blue-200 dark:border-blue-800">
                <BookOpen className="w-8 h-8 stroke-[2]" />
              </div>
              <div>
                <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                  {activeSubjectMeta.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 font-medium">
                  Explore the Primary 7 flagship pilot curriculum!
                </p>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveSubject('sst');
                }}
                className="btn-duo-blue px-6 py-3 rounded-2xl text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                Switch to P.7 Social Studies
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {currentUnits.map((unit) => {
                const unitLessons = unit.lessons;
                const completedInUnit = unitLessons.filter((l) =>
                  userStats.completedLessonIds.includes(l.id)
                ).length;
                const isUnitCompleted = completedInUnit === unitLessons.length && unitLessons.length > 0;

                return (
                  <section key={unit.id} className="relative">
                    
                    {/* SOLID 3D DUOLINGO UNIT BANNER */}
                    <div
                      className={`rounded-3xl p-5 sm:p-6 text-white ${currentTheme.bannerBg} border-b-4 ${currentTheme.bannerBorder} shadow-sm mb-8 transition-transform select-none`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-black/25 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/20">
                              Unit {unit.unitNumber}
                            </span>
                            <span className="text-white/90 text-xs font-bold">
                              {activeSubjectMeta.name}
                            </span>
                          </div>
                          <h2 className="font-heading font-black text-lg sm:text-xl text-white tracking-tight leading-snug">
                            {unit.title}
                          </h2>
                        </div>

                        <button
                          id={`unit-practice-btn-${unit.id}`}
                          onClick={() => {
                            soundFx.playClick();
                            onOpenPractice();
                          }}
                          className="btn-duo-white p-3 rounded-2xl flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
                          title="Rapid Timed Practice Drill"
                        >
                          <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
                        </button>
                      </div>
                    </div>

                    {/* DUOLINGO WINDING STEPPING STONE NODES */}
                    <div className="flex flex-col items-center space-y-9 relative py-2">
                      
                      {unitLessons.map((lesson, idx) => {
                        const isCompleted = userStats.completedLessonIds.includes(lesson.id);
                        const isPreviousCompleted = idx === 0 || userStats.completedLessonIds.includes(unitLessons[idx - 1].id);
                        const isLocked = !isCompleted && !isPreviousCompleted;
                        const isCurrent = !isCompleted && isPreviousCompleted;

                        // Curving lateral offset pattern (Center -> Left -> Right -> Left -> Right)
                        const offsetPattern = [0, -48, 48, -40, 40];
                        const xOffset = offsetPattern[idx % offsetPattern.length];

                        // Subtle encouragement mascot near the active node
                        const showActiveMascot = isCurrent && idx % 2 === 0;

                        return (
                          <div
                            key={lesson.id}
                            className="w-full flex items-center justify-center relative transition-transform duration-200"
                          >
                            {/* In-trail Mascot Encouragement */}
                            {showActiveMascot && (
                              <div className="absolute -left-4 sm:left-0 top-0 hidden sm:block pointer-events-none select-none z-10">
                                <CraneMascot
                                  mood="studying"
                                  size="sm"
                                  speechText="Akatono katono! Let's start!"
                                />
                              </div>
                            )}

                            {/* Stepping Stone Center Node */}
                            <div
                              className="flex flex-col items-center relative"
                              style={{
                                transform: `translateX(${xOffset}px)`,
                              }}
                            >
                              {/* Pulsing "START" Tooltip above current node */}
                              {isCurrent && (
                                <div className="absolute -top-10 z-20 flex flex-col items-center pointer-events-none animate-pulse">
                                  <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-black uppercase px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-slate-700 dark:border-slate-300">
                                    <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span>START</span>
                                  </div>
                                  <div className="w-2 h-2 bg-slate-900 dark:bg-slate-100 rotate-45 -mt-1" />
                                </div>
                              )}

                              {/* 3D Milestone Node Button */}
                              <button
                                id={`lesson-node-${lesson.id}`}
                                disabled={isLocked}
                                onClick={() => {
                                  soundFx.playClick();
                                  onSelectLesson(lesson);
                                }}
                                className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center relative transition-all select-none cursor-pointer active:translate-y-1 ${
                                  isCompleted
                                    ? 'bg-emerald-500 text-white border-4 border-emerald-600 shadow-md shadow-emerald-500/20'
                                    : isCurrent
                                    ? `${currentTheme.activeNodeBg} text-white border-4 ${currentTheme.activeNodeBorder} shadow-lg ring-6 ${currentTheme.activeRing}`
                                    : 'bg-slate-200 dark:bg-[#202f36] text-slate-400 dark:text-slate-600 border-4 border-slate-300 dark:border-[#37464f] cursor-not-allowed shadow-xs'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-9 h-9 stroke-[3]" />
                                ) : isLocked ? (
                                  <Lock className="w-7 h-7 stroke-[2.5]" />
                                ) : (
                                  <Star className="w-9 h-9 fill-amber-300 text-amber-400 stroke-[2.5]" />
                                )}

                                {/* XP Badge */}
                                <span
                                  className={`absolute -bottom-2 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs border ${
                                    isCompleted
                                      ? 'bg-emerald-700 text-emerald-100 border-emerald-800'
                                      : isCurrent
                                      ? 'bg-slate-900 dark:bg-white text-amber-300 dark:text-slate-900 border-slate-700 dark:border-slate-200'
                                      : 'bg-slate-300 dark:bg-[#37464f] text-slate-600 dark:text-slate-400 border-slate-400 dark:border-slate-500'
                                  }`}
                                >
                                  +{lesson.xpReward} XP
                                </span>
                              </button>

                              {/* Title Under Node */}
                              <div className="mt-3.5 text-center max-w-[160px] px-1">
                                <h4
                                  className={`font-heading font-extrabold text-xs sm:text-sm leading-tight ${
                                    isLocked
                                      ? 'text-slate-400 dark:text-slate-600'
                                      : 'text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  {lesson.title}
                                </h4>
                              </div>
                            </div>

                          </div>
                        );
                      })}

                      {/* Unit Milestone Chest / Trophy Node */}
                      <div className="flex flex-col items-center pt-2">
                        <div
                          className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex flex-col items-center justify-center border-4 transition-all shadow-md ${
                            isUnitCompleted
                              ? 'bg-amber-400 border-amber-500 text-slate-950 shadow-amber-400/30'
                              : 'bg-slate-100 dark:bg-[#1b2a32] border-slate-200 dark:border-[#37464f] text-slate-300 dark:text-slate-600'
                          }`}
                        >
                          {isUnitCompleted ? (
                            <Trophy className="w-8 h-8 stroke-[2.5]" />
                          ) : (
                            <Gift className="w-7 h-7 stroke-[2]" />
                          )}
                        </div>
                        <span className="text-[11px] font-black text-slate-400 dark:text-slate-400 mt-2 uppercase tracking-wider">
                          {isUnitCompleted ? 'Unit Mastered!' : 'Unit Milestone Chest'}
                        </span>
                      </div>

                    </div>
                  </section>
                );
              })}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (DESKTOP & IPAD): DUOLINGO-STYLE SIDEBAR WIDGETS */}
        <aside className="hidden lg:block lg:col-span-5 space-y-6 sticky top-22">
          
          {/* 1. Daily Quests Card */}
          <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-5 border-2 border-slate-200 dark:border-[#37464f] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Daily Quests
                </h3>
              </div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                Resets Midnight
              </span>
            </div>

            <div className="space-y-3">
              {DAILY_QUESTS.map((quest) => {
                const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));
                return (
                  <div
                    key={quest.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-[#202f36] border border-slate-200 dark:border-[#37464f] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      <span>{quest.title}</span>
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-black">
                        +{quest.gemReward} 💎
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. PLE Distinction Predictor Mini-Card */}
          <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-5 border-2 border-slate-200 dark:border-[#37464f] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  PLE Forecast
                </h3>
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                {userStats.currentMastery}% Mastery
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
              <span className="text-xs font-extrabold text-blue-900 dark:text-blue-300 block">
                {pleProjection.division}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {pleProjection.descriptor}
              </p>
            </div>
          </div>

          {/* 3. Mascot Scholar Coach */}
          <div className="p-4 rounded-3xl bg-linear-to-r from-amber-50 to-orange-50 dark:from-[#1b2a32] dark:to-[#202f36] border-2 border-amber-200 dark:border-[#37464f] flex items-center gap-3">
            <CraneMascot mood="cheering" size="sm" />
            <div>
              <span className="font-heading font-black text-xs text-slate-900 dark:text-white block">
                Coaching Tip
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                Study 15 minutes every day to unlock the Aggregate 4 Distinction badge!
              </p>
            </div>
          </div>

        </aside>

      </div>

    </div>
  );
};
