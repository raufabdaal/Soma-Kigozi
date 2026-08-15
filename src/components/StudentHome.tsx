import React from 'react';
import { CurriculumUnit, LessonNode, SubjectId, UserStats } from '../types';
import { SUBJECTS } from '../data/curriculumData';
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
  GraduationCap,
  Award,
  Globe,
  MapPin
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';

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
  // Filter units for current subject
  const currentUnits = units.filter((u) => u.subjectId === activeSubject);
  const activeSubjectMeta = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-6 pb-32">
      
      {currentUnits.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border-2 border-slate-200 shadow-xs space-y-4 my-8">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border-2 border-blue-200">
            <BookOpen className="w-8 h-8 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-heading font-black text-xl text-slate-900">
              {activeSubjectMeta.name}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">
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
        <div className="space-y-14">
          {currentUnits.map((unit) => {
            const unitLessons = unit.lessons;
            const completedInUnit = unitLessons.filter((l) =>
              userStats.completedLessonIds.includes(l.id)
            ).length;
            const isUnitCompleted = completedInUnit === unitLessons.length && unitLessons.length > 0;

            return (
              <section key={unit.id} className="relative">
                
                {/* Solid, Premium Duolingo 3D Unit Banner */}
                <div
                  className="rounded-3xl p-5 sm:p-6 text-white bg-[#1cb0f6] border-b-4 border-[#0284c7] shadow-sm mb-10 transition-transform"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-black/20 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/20">
                          Unit {unit.unitNumber}
                        </span>
                        <span className="text-white/90 text-xs font-bold">
                          {activeSubjectMeta.name}
                        </span>
                      </div>
                      <h2 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight leading-snug">
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
                      title="Timed Practice Drill"
                    >
                      <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
                    </button>
                  </div>
                </div>

                {/* Duolingo Winding Stepping Stone Trail with Side Vignettes */}
                <div className="flex flex-col items-center space-y-10 relative py-2">
                  
                  {unitLessons.map((lesson, idx) => {
                    const isCompleted = userStats.completedLessonIds.includes(lesson.id);
                    const isPreviousCompleted = idx === 0 || userStats.completedLessonIds.includes(unitLessons[idx - 1].id);
                    const isLocked = !isCompleted && !isPreviousCompleted;
                    const isCurrent = !isCompleted && isPreviousCompleted;

                    // Curving lateral offset pattern (Center -> Left -> Right -> Left -> Right)
                    const offsetPattern = [0, -50, 50, -40, 40];
                    const xOffset = offsetPattern[idx % offsetPattern.length];

                    // Subtle side decorative illustration character/vignette in the whitespace
                    const showScholarVignette = idx === 0;
                    const showCompassVignette = idx === 2;
                    const showTrophyVignette = idx === 4;

                    return (
                      <div
                        key={lesson.id}
                        className="w-full flex items-center justify-center relative transition-transform duration-200"
                      >
                        {/* Left Whitespace Vignette: Scholar Reading */}
                        {showScholarVignette && (
                          <div className="absolute left-2 sm:left-4 top-0 hidden sm:flex flex-col items-center opacity-85 pointer-events-none select-none">
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200/80 flex items-center justify-center shadow-xs">
                              <GraduationCap className="w-7 h-7 text-amber-600 stroke-[2]" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                              P.7 Scholar
                            </span>
                          </div>
                        )}

                        {/* Right Whitespace Vignette: Explorer Compass */}
                        {showCompassVignette && (
                          <div className="absolute right-2 sm:right-4 top-0 hidden sm:flex flex-col items-center opacity-85 pointer-events-none select-none">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-200/80 flex items-center justify-center shadow-xs">
                              <Compass className="w-7 h-7 text-blue-600 stroke-[2]" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                              East Africa
                            </span>
                          </div>
                        )}

                        {/* Left Whitespace Vignette: UNEB Distinction Badge */}
                        {showTrophyVignette && (
                          <div className="absolute left-2 sm:left-4 top-0 hidden sm:flex flex-col items-center opacity-85 pointer-events-none select-none">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-200/80 flex items-center justify-center shadow-xs">
                              <Award className="w-7 h-7 text-emerald-600 stroke-[2]" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                              Aggregate 4
                            </span>
                          </div>
                        )}

                        {/* Stepping Stone Center Node */}
                        <div
                          className="flex flex-col items-center relative"
                          style={{
                            transform: `translateX(${xOffset}px)`,
                          }}
                        >
                          {/* Sleek, Non-Jittery Pulsing "START" Indicator */}
                          {isCurrent && (
                            <div className="absolute -top-10 z-20 flex flex-col items-center pointer-events-none animate-pulse">
                              <div className="bg-slate-900 text-white text-[11px] font-black uppercase px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 border border-slate-700">
                                <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span>START</span>
                              </div>
                              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                            </div>
                          )}

                          {/* Chunky 3D Milestone Node Button */}
                          <button
                            id={`lesson-node-${lesson.id}`}
                            disabled={isLocked}
                            onClick={() => {
                              soundFx.playClick();
                              onSelectLesson(lesson);
                            }}
                            className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center relative transition-transform select-none cursor-pointer active:translate-y-1 ${
                              isCompleted
                                ? 'bg-emerald-500 text-white border-4 border-emerald-600 shadow-md shadow-emerald-500/20'
                                : isCurrent
                                ? 'bg-blue-500 text-white border-4 border-blue-600 shadow-lg shadow-blue-500/40 ring-6 ring-blue-400/25'
                                : 'bg-slate-200 text-slate-400 border-4 border-slate-300 shadow-2xs cursor-not-allowed'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-9 h-9 stroke-[3]" />
                            ) : isLocked ? (
                              <Lock className="w-8 h-8 stroke-[2.5]" />
                            ) : (
                              <Star className="w-9 h-9 fill-amber-300 text-amber-400 stroke-[2.5]" />
                            )}

                            {/* XP Reward Badge */}
                            <span
                              className={`absolute -bottom-2.5 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs border ${
                                isCompleted
                                  ? 'bg-emerald-700 text-emerald-100 border-emerald-800'
                                  : isCurrent
                                  ? 'bg-slate-900 text-amber-300 border-slate-700'
                                  : 'bg-slate-300 text-slate-600 border-slate-400'
                              }`}
                            >
                              +{lesson.xpReward} XP
                            </span>
                          </button>

                          {/* Title Below Node */}
                          <div className="mt-4 text-center max-w-[170px] px-1">
                            <h4
                              className={`font-heading font-extrabold text-xs sm:text-sm leading-tight ${
                                isLocked ? 'text-slate-400' : 'text-slate-800'
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
                  <div className="flex flex-col items-center pt-3">
                    <div
                      className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex flex-col items-center justify-center border-4 transition-all shadow-md ${
                        isUnitCompleted
                          ? 'bg-amber-400 border-amber-500 text-slate-950 shadow-amber-400/30'
                          : 'bg-slate-100 border-slate-200 text-slate-300'
                      }`}
                    >
                      {isUnitCompleted ? (
                        <Trophy className="w-8 h-8 stroke-[2.5]" />
                      ) : (
                        <Gift className="w-7 h-7 stroke-[2]" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
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
  );
};
