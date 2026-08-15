import React from 'react';
import { CurriculumUnit, LessonNode, SubjectId, UserStats } from '../types';
import { SUBJECTS } from '../data/curriculumData';
import { 
  CheckCircle2, 
  Lock, 
  Star, 
  Sparkles, 
  Flame, 
  Trophy, 
  Zap, 
  Bot, 
  ArrowRight,
  BookOpen,
  Award,
  Compass,
  Check,
  Target
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
  onOpenKigoziChat: () => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  userStats,
  units,
  activeSubject,
  setActiveSubject,
  onSelectLesson,
  onOpenPractice,
  onOpenKigoziChat,
}) => {
  // Filter units for current subject
  const currentUnits = units.filter((u) => u.subjectId === activeSubject);
  const activeSubjectMeta = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];
  const pleProjection = calculatePleProjection(userStats.currentMastery);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
      
      {/* Top Welcome Pill Banner */}
      <div className="mb-6 p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
              Primary 7 Candidate
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              National Curriculum Development Centre (NCDC)
            </span>
          </div>
          <h1 className="font-heading font-black text-xl sm:text-2xl text-slate-900 mt-1">
            Welcome back, {userStats.studentName}!
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Daily Goal: {userStats.dailyGoalMinutes} Mins • Target: Division 1 Distinction in PLE
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenKigoziChat();
            }}
            className="btn-duo-amber px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs"
          >
            <Bot className="w-4 h-4" />
            <span>Kigozi AI Tutor</span>
          </button>
          
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenPractice();
            }}
            className="btn-duo-green px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs"
          >
            <Zap className="w-4 h-4" />
            <span>Speed Drills</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Learning Path (Center) + Widgets (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left/Center: Duolingo-style Learning Path */}
        <div className="lg:col-span-8 space-y-8">
          {currentUnits.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border-2 border-slate-200 shadow-xs space-y-4">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Curriculum Ready for {activeSubjectMeta.name}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Tap below to explore the Primary 7 Social Studies flagship pilot modules!
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
            currentUnits.map((unit) => (
              <div key={unit.id} className="space-y-6">
                
                {/* Unit Header Card */}
                <div
                  className={`rounded-3xl p-6 text-white bg-gradient-to-r ${unit.bannerColor} shadow-md border-2 border-slate-900/10`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-white/20 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          Unit {unit.unitNumber} • Term {unit.term}
                        </span>
                        <span className="text-white/80 text-[11px] font-bold">
                          Primary 7 SST
                        </span>
                      </div>
                      <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
                        {unit.title}
                      </h2>
                      <p className="text-white/90 text-xs sm:text-sm mt-1 max-w-xl font-medium leading-relaxed">
                        {unit.description}
                      </p>
                    </div>

                    <button
                      id={`unit-practice-btn-${unit.id}`}
                      onClick={() => {
                        soundFx.playClick();
                        onOpenPractice();
                      }}
                      className="btn-duo-white px-4 py-2.5 rounded-2xl text-xs font-black text-slate-900 shrink-0 self-start md:self-center shadow-sm"
                    >
                      Unit Timed Drill
                    </button>
                  </div>
                </div>

                {/* Duolingo Stepping Stone Trail */}
                <div className="py-6 flex flex-col items-center space-y-7 relative">
                  {unit.lessons.map((lesson, idx) => {
                    const isCompleted = userStats.completedLessonIds.includes(lesson.id);
                    const isLocked = !isCompleted && idx > 0 && !userStats.completedLessonIds.includes(unit.lessons[idx - 1].id);
                    const isCurrent = !isCompleted && !isLocked;

                    // Curving stepping stone offsets
                    const offsetIndex = idx % 3;
                    const offsetClass =
                      offsetIndex === 0
                        ? 'translate-x-0'
                        : offsetIndex === 1
                        ? '-translate-x-12 sm:-translate-x-16'
                        : 'translate-x-12 sm:translate-x-16';

                    return (
                      <div
                        key={lesson.id}
                        className={`flex flex-col items-center relative transition-transform ${offsetClass}`}
                      >
                        {/* Current Lesson Badge Banner */}
                        {isCurrent && (
                          <div className="mb-2 bg-slate-900 text-white text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-md animate-bounce flex items-center gap-1.5 z-10">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>START HERE</span>
                          </div>
                        )}

                        {/* Interactive Node Button */}
                        <button
                          id={`lesson-node-${lesson.id}`}
                          disabled={isLocked}
                          onClick={() => {
                            soundFx.playClick();
                            onSelectLesson(lesson);
                          }}
                          className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-500 border-4 border-emerald-600 text-white shadow-lg active:translate-y-1'
                              : isCurrent
                              ? 'bg-blue-500 border-4 border-blue-600 text-white shadow-xl shadow-blue-500/30 trail-node-glow-blue animate-duo-pulse active:translate-y-1'
                              : 'bg-slate-200 border-4 border-slate-300 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-8 h-8 stroke-[3]" />
                          ) : isLocked ? (
                            <Lock className="w-7 h-7 stroke-[2.5]" />
                          ) : (
                            <Star className="w-8 h-8 fill-amber-300 text-amber-400 stroke-[2.5]" />
                          )}

                          {/* Mini XP Chip */}
                          <span className="absolute -bottom-2 bg-slate-900 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs border border-slate-700">
                            +{lesson.xpReward} XP
                          </span>
                        </button>

                        {/* Node Label Tooltip */}
                        <div className="mt-4 text-center max-w-xs px-2">
                          <h4 className="font-heading font-black text-xs sm:text-sm text-slate-900 leading-tight">
                            {lesson.title}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                            {lesson.subtitle}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Widgets & Analytics */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Widget 1: Projected PLE Aggregate Trajectory */}
          <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                UNEB PLE Forecast
              </span>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {pleProjection.division}
              </span>
            </div>

            <div className="flex items-end gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex flex-col items-center justify-center font-black shadow-md shrink-0">
                <span className="text-xl font-heading leading-none">Agg</span>
                <span className="text-sm">{pleProjection.aggregate}</span>
              </div>
              <div>
                <h4 className="font-heading font-black text-sm text-slate-900">
                  {userStats.currentMastery}% Current Mastery
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {pleProjection.descriptor}
                </p>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${userStats.currentMastery}%` }}
              />
            </div>
          </div>

          {/* Widget 2: Daily Quests */}
          <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Daily Study Quests
              </span>
              <span className="text-xs font-bold text-amber-600">
                {userStats.dailyGoalMinutes} Mins Daily Goal
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-heading font-black text-xs text-slate-900 block">
                      P.7 SST Teach Slide Mastered
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      +35 XP • +10 Enjuba Gems
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600">Done</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <span className="font-heading font-black text-xs text-slate-900 block">
                      7-Day Study Streak Active
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      +40 XP • Keep it burning!
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-600">{userStats.currentStreak}d</span>
              </div>
            </div>
          </div>

          {/* Widget 3: Kigozi AI Study Buddy Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                🤖
              </div>
              <div>
                <h4 className="font-heading font-black text-base text-white">
                  Teacher Kigozi AI
                </h4>
                <p className="text-[11px] text-amber-300 font-bold">
                  Socratic P.7 Study Companion
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Got stuck on rift valley faulting, Nile river dams, or the 1900 Buganda Agreement? Ask Teacher Kigozi for a gentle hint!
            </p>

            <button
              id="sidebar-ask-kigozi-btn"
              onClick={() => {
                soundFx.playClick();
                onOpenKigoziChat();
              }}
              className="btn-duo-amber w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ask a Question Now</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
