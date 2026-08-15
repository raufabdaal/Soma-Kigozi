import React, { useState } from 'react';
import { CurriculumUnit, LessonNode, SubjectId, UserStats } from '../types';
import { SUBJECTS } from '../data/curriculumData';
import { 
  Calculator, 
  FlaskConical, 
  Globe2, 
  BookOpenCheck, 
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
  Award
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';

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
  const [selectedUnitTerm, setSelectedUnitTerm] = useState<number>(1);

  const getSubjectIcon = (id: SubjectId) => {
    switch (id) {
      case 'math':
        return <Calculator className="w-5 h-5" />;
      case 'science':
        return <FlaskConical className="w-5 h-5" />;
      case 'sst':
        return <Globe2 className="w-5 h-5" />;
      case 'english':
        return <BookOpenCheck className="w-5 h-5" />;
    }
  };

  // Filter units for current grade and subject
  const currentUnits = units.filter(
    (u) => u.subjectId === activeSubject
  );

  const activeSubjectMeta = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Subject Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {SUBJECTS.map((sub) => {
          const isSelected = sub.id === activeSubject;
          return (
            <button
              key={sub.id}
              id={`subject-tab-${sub.id}`}
              onClick={() => {
                soundFx.playClick();
                setActiveSubject(sub.id);
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-102'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span className={isSelected ? 'text-amber-400' : 'text-slate-400'}>
                {getSubjectIcon(sub.id)}
              </span>
              <span>{sub.name}</span>
              {isSelected && (
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
                  P.6 NCDC
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Learning Path (Center) + Gamified Widgets (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Center: Duolingo/Brilliant-style Learning Trail */}
        <div className="lg:col-span-8 space-y-8">
          {currentUnits.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-lg text-slate-800">
                Curriculum Pack Ready for {activeSubjectMeta.name}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
                This NCDC unit is optimized for offline download and practice. Tap below to begin the foundational modules!
              </p>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveSubject('math');
                }}
                className="btn-3d-amber px-6 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer inline-flex items-center gap-2"
              >
                Switch to P.6 Mathematics
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            currentUnits.map((unit) => (
              <div key={unit.id} className="space-y-6">
                {/* Unit Header Card */}
                <div
                  className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-r ${unit.bannerColor} shadow-md`}
                >
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-white/20 backdrop-blur-xs text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          Term {unit.term} • {unit.gradeLevel}
                        </span>
                        <span className="text-white/80 text-xs font-semibold">
                          {activeSubjectMeta.ncdcCode}
                        </span>
                      </div>
                      <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
                        {unit.title}
                      </h2>
                      <p className="text-white/90 text-sm mt-1 max-w-xl font-medium">
                        {unit.description}
                      </p>
                    </div>

                    <button
                      id={`practice-sprint-btn-${unit.id}`}
                      onClick={() => {
                        soundFx.playClick();
                        onOpenPractice();
                      }}
                      className="bg-white hover:bg-slate-50 text-slate-900 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                    >
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Rapid PLE Drill
                    </button>
                  </div>
                </div>

                {/* Duolingo-style Learning Path Nodes */}
                <div className="relative flex flex-col items-center py-4 space-y-6">
                  {/* Connecting visual spine */}
                  <div className="absolute top-8 bottom-8 w-2 bg-slate-200 rounded-full -z-0" />

                  {unit.lessons.map((lesson, idx) => {
                    const isCompleted = userStats.completedLessonIds.includes(lesson.id);
                    // Next playable lesson is completed or first uncompleted
                    const isUnlocked =
                      idx === 0 ||
                      userStats.completedLessonIds.includes(unit.lessons[idx - 1]?.id);

                    // Alternating curve offset for Duolingo snake effect
                    const offsets = ['translate-x-0', 'translate-x-12', 'translate-x-0', '-translate-x-12'];
                    const offsetClass = offsets[idx % offsets.length];

                    const isBoss = lesson.type === 'boss_ple';

                    return (
                      <div
                        key={lesson.id}
                        className={`relative z-10 flex flex-col items-center group transition-transform ${offsetClass}`}
                      >
                        {/* Node Button */}
                        <button
                          id={`lesson-node-${lesson.id}`}
                          onClick={() => {
                            if (isUnlocked) {
                              soundFx.playClick();
                              onSelectLesson(lesson);
                            }
                          }}
                          disabled={!isUnlocked}
                          className={`relative flex items-center justify-center transition-all ${
                            isBoss
                              ? 'w-20 h-20 rounded-2xl'
                              : 'w-16 h-16 rounded-full'
                          } ${
                            isCompleted
                              ? isBoss
                                ? 'btn-3d-amber ring-4 ring-amber-300/60'
                                : 'btn-3d-emerald ring-4 ring-emerald-300/60'
                              : isUnlocked
                              ? 'btn-3d-indigo animate-bounce ring-4 ring-indigo-300/60'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-inner'
                          }`}
                        >
                          {isCompleted ? (
                            <div className="flex flex-col items-center">
                              {isBoss ? (
                                <Trophy className="w-8 h-8 text-white fill-white" />
                              ) : (
                                <CheckCircle2 className="w-7 h-7 text-white" />
                              )}
                              <div className="flex gap-0.5 mt-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                              </div>
                            </div>
                          ) : isUnlocked ? (
                            <div className="flex flex-col items-center">
                              {isBoss ? (
                                <Trophy className="w-8 h-8 text-white" />
                              ) : (
                                <Star className="w-7 h-7 text-white fill-white" />
                              )}
                              <span className="text-[10px] font-black text-white uppercase mt-0.5">
                                START
                              </span>
                            </div>
                          ) : (
                            <Lock className="w-6 h-6 text-slate-400" />
                          )}
                        </button>

                        {/* Node Label Popover */}
                        <div className="mt-2.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs text-center max-w-[200px]">
                          <p className="font-heading font-extrabold text-xs text-slate-800 leading-tight">
                            {lesson.title}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                            {lesson.subtitle}
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-1 text-[10px] font-bold text-amber-700">
                            <span>+{lesson.xpReward} XP</span>
                            <span>•</span>
                            <span>+{lesson.gemsReward} Gems</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Widgets, Quests, AI Buddy & Streak Freeze */}
        <div className="lg:col-span-4 space-y-6">
          {/* Ask Kigozi AI Tutor Promo Card */}
          <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 rounded-2xl p-5 text-white shadow-md">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="bg-white/25 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  NCDC Study Companion
                </span>
                <h3 className="font-heading font-black text-lg text-white mt-1">
                  Meet Kigozi AI
                </h3>
                <p className="text-white/90 text-xs mt-0.5 leading-relaxed">
                  Stuck on a tricky math or science question? Get Socratic hints in simple Ugandan context.
                </p>
              </div>
            </div>
            <button
              id="kigozi-ai-launcher-btn"
              onClick={() => {
                soundFx.playClick();
                onOpenKigoziChat();
              }}
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-transform active:scale-98 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Ask Kigozi a Question
            </button>
          </div>

          {/* Daily Quests Widget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                Daily Quests
              </h3>
              <span className="text-xs font-semibold text-slate-500">Resets daily</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Complete 2 NCDC Lessons</span>
                  <span className="text-emerald-700">1 / 2</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-1/2 rounded-full" />
                </div>
                <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-500">
                  <span>Reward: +30 XP, +10 Gems</span>
                  <span className="text-slate-400 font-medium">In Progress</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1">
                  <span>Solve 5 Commercial Math Problems</span>
                  <span className="text-amber-700">5 / 5</span>
                </div>
                <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-full rounded-full" />
                </div>
                <div className="flex justify-between items-center mt-1.5 text-[11px] text-amber-800 font-bold">
                  <span>Claimed: +40 XP, +15 Gems</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Badges & Mastery Milestones */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                Uganda Scholar Badges
              </h3>
              <span className="text-xs font-semibold text-indigo-600">
                {userStats.badges.filter((b) => b.isUnlocked).length} / {userStats.badges.length}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              {userStats.badges.slice(0, 3).map((badge) => (
                <div
                  key={badge.id}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    badge.isUnlocked
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200 opacity-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-1 text-amber-600">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-800 line-clamp-1">
                    {badge.title}
                  </span>
                  <span className="text-[9px] text-slate-500 line-clamp-1">
                    {badge.isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
