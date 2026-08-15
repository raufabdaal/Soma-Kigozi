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
  Gift
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
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-5 pb-28">
      
      {currentUnits.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border-2 border-slate-200 shadow-xs space-y-4 my-8">
          <BookOpen className="w-14 h-14 text-slate-300 mx-auto stroke-[1.5]" />
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
            className="btn-duo-blue px-6 py-3 rounded-2xl text-xs font-black inline-flex items-center gap-2"
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
                
                {/* Minimal, High-Impact Unit Header Card */}
                <div
                  className={`rounded-3xl p-5 sm:p-6 text-white bg-gradient-to-r ${unit.bannerColor} shadow-md border-2 border-slate-900/10 mb-8`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-white/20 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          Unit {unit.unitNumber}
                        </span>
                        <span className="text-white/80 text-[11px] font-bold">
                          {activeSubjectMeta.name}
                        </span>
                      </div>
                      <h2 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
                        {unit.title}
                      </h2>
                    </div>

                    <button
                      id={`unit-practice-btn-${unit.id}`}
                      onClick={() => {
                        soundFx.playClick();
                        onOpenPractice();
                      }}
                      className="btn-duo-white p-3 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                      title="Timed Practice Drill"
                    >
                      <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
                    </button>
                  </div>
                </div>

                {/* Duolingo Winding Stepping Stone Trail */}
                <div className="flex flex-col items-center space-y-9 relative py-2">
                  
                  {unitLessons.map((lesson, idx) => {
                    const isCompleted = userStats.completedLessonIds.includes(lesson.id);
                    const isPreviousCompleted = idx === 0 || userStats.completedLessonIds.includes(unitLessons[idx - 1].id);
                    const isLocked = !isCompleted && !isPreviousCompleted;
                    const isCurrent = !isCompleted && isPreviousCompleted;

                    // Curving lateral offset pattern (Center -> Left -> Right -> Center)
                    const offsetPattern = [0, -45, 45, -35, 35];
                    const xOffset = offsetPattern[idx % offsetPattern.length];

                    return (
                      <div
                        key={lesson.id}
                        className="flex flex-col items-center relative transition-transform duration-200"
                        style={{
                          transform: `translateX(${xOffset}px)`,
                        }}
                      >
                        {/* Current Active Floating "START" Bubble */}
                        {isCurrent && (
                          <div className="absolute -top-11 z-20 flex flex-col items-center animate-bounce pointer-events-none">
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
                              ? 'bg-emerald-500 text-white border-4 border-emerald-600 shadow-lg shadow-emerald-500/20'
                              : isCurrent
                              ? 'bg-blue-500 text-white border-4 border-blue-600 shadow-xl shadow-blue-500/40 ring-6 ring-blue-400/25 animate-duo-pulse'
                              : 'bg-slate-200 text-slate-400 border-4 border-slate-300 shadow-xs cursor-not-allowed'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-9 h-9 stroke-[3]" />
                          ) : isLocked ? (
                            <Lock className="w-8 h-8 stroke-[2.5]" />
                          ) : (
                            <Star className="w-9 h-9 fill-amber-300 text-amber-400 stroke-[2.5]" />
                          )}

                          {/* XP Badge Pill */}
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

                        {/* Minimal Title Below Node */}
                        <div className="mt-4 text-center max-w-[170px] px-1">
                          <h4 className="font-heading font-extrabold text-xs sm:text-sm text-slate-800 leading-tight">
                            {lesson.title}
                          </h4>
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
