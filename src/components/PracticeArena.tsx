import React, { useState, useMemo } from 'react';
import { UserStats, Question, SubjectId, CurriculumUnit } from '../types';
import { CURRICULUM_UNITS, SUBJECTS } from '../data/curriculumData';
import { SubjectBadge } from './SubjectBadge';
import { 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Timer, 
  ArrowRight,
  Check,
  Heart,
  BookOpen,
  Sparkles,
  Award,
  HelpCircle
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';
import confetti from 'canvas-confetti';

interface PracticeArenaProps {
  activeSubject: SubjectId;
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onBackToHome: () => void;
}

type PracticeMode = 'weakness' | 'topical' | 'sprint' | 'vocab';

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  activeSubject,
  userStats,
  onUpdateStats,
  onBackToHome,
}) => {
  const [activeMode, setActiveMode] = useState<PracticeMode | null>(null);
  const [selectedTopicUnitId, setSelectedTopicUnitId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  const currentSubjectMeta = SUBJECTS.find((s) => s.id === activeSubject) || SUBJECTS[0];
  const subjectUnits: CurriculumUnit[] = useMemo(() => {
    return CURRICULUM_UNITS.filter((u) => u.subjectId === activeSubject);
  }, [activeSubject]);

  // All questions in the active subject
  const allSubjectQuestions: Question[] = useMemo(() => {
    const questions: Question[] = [];
    subjectUnits.forEach((unit) => {
      unit.lessons.forEach((l) => {
        questions.push(...l.questions);
      });
    });
    return questions;
  }, [subjectUnits]);

  // Determine questions based on chosen practice mode
  const currentPracticeQuestions: Question[] = useMemo(() => {
    if (activeMode === 'topical' && selectedTopicUnitId) {
      const unit = subjectUnits.find((u) => u.id === selectedTopicUnitId);
      if (unit) {
        const qList: Question[] = [];
        unit.lessons.forEach((l) => qList.push(...l.questions));
        return qList.slice(0, 5);
      }
    }

    if (activeMode === 'weakness') {
      // Prioritize questions from lessons where score was lowest or not yet 100%
      const lowerScoringLessonIds = Object.entries(userStats.lessonScores)
        .filter(([, sc]) => Number(sc) < 100)
        .map(([id]) => id);

      const weakQuestions: Question[] = [];
      subjectUnits.forEach((unit) => {
        unit.lessons.forEach((l) => {
          if (lowerScoringLessonIds.includes(l.id)) {
            weakQuestions.push(...l.questions);
          }
        });
      });

      if (weakQuestions.length >= 3) {
        return weakQuestions.slice(0, 5);
      }
      // Fallback to general questions if student has no recorded errors yet
      return allSubjectQuestions.slice(0, 5);
    }

    if (activeMode === 'vocab') {
      // Questions focusing on definitions / recall
      return allSubjectQuestions.slice(0, 5);
    }

    // Default 'sprint' mode: rapid 5 questions
    return allSubjectQuestions.slice(0, 5);
  }, [activeMode, selectedTopicUnitId, subjectUnits, userStats.lessonScores, allSubjectQuestions]);

  const currentQ = currentPracticeQuestions[currentIndex];

  const handleStartMode = (mode: PracticeMode, unitId?: string) => {
    soundFx.playClick();
    setActiveMode(mode);
    if (unitId) setSelectedTopicUnitId(unitId);
    setCurrentIndex(0);
    setScore(0);
    setIsAnswerChecked(false);
    setSelectedOptionId(null);
    setIsSessionFinished(false);
    setIsSessionActive(true);
  };

  const handleCheck = () => {
    if (!currentQ || currentQ.type !== 'multiple_choice') {
      setIsCorrect(true);
      setIsAnswerChecked(true);
      setScore((s) => s + 1);
      soundFx.playCorrect();
      return;
    }

    const correct = selectedOptionId === currentQ.correctOptionId;
    setIsCorrect(correct);
    setIsAnswerChecked(true);
    if (correct) {
      soundFx.playCorrect();
      setScore((s) => s + 1);
    } else {
      soundFx.playWrong();
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    if (currentIndex < currentPracticeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsAnswerChecked(false);
      setSelectedOptionId(null);
    } else {
      soundFx.playFanfare();
      confetti({ particleCount: 80, spread: 60 });
      setIsSessionFinished(true);

      // Reward XP, Gems, and Heart refill on weakness review
      const xpWon = 35;
      const gemsWon = 8;
      const heartsWon = activeMode === 'weakness' && userStats.hearts < userStats.maxHearts ? 1 : 0;

      onUpdateStats({
        ...userStats,
        hearts: Math.min(userStats.maxHearts, userStats.hearts + heartsWon),
        totalXp: userStats.totalXp + xpWon,
        enjubaGems: userStats.enjubaGems + gemsWon,
        weeklyMinutes: userStats.weeklyMinutes + 10,
      });
    }
  };

  const handleResetSession = () => {
    setIsSessionActive(false);
    setIsSessionFinished(false);
    setActiveMode(null);
    setSelectedTopicUnitId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      
      {/* Header Banner - Bound strictly to current active subject */}
      <div className="bg-amber-500 rounded-3xl p-6 sm:p-7 text-white shadow-md border-b-4 border-amber-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <SubjectBadge subjectId={activeSubject} size="lg" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-black/20 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/20">
                P.7 {currentSubjectMeta.name}
              </span>
              <span className="text-white/90 text-xs font-bold">
                NCDC Exam Practice Arena
              </span>
            </div>
            <h1 className="font-heading font-black text-xl sm:text-2xl text-white">
              Targeted Practice & Mastery
            </h1>
            <p className="text-white/90 text-xs mt-0.5 font-medium">
              Review tricky concepts, drill specific topics, and polish UNEB exam accuracy.
            </p>
          </div>
        </div>

        <button
          onClick={onBackToHome}
          className="btn-duo-white px-4 py-2 rounded-2xl text-xs font-black shadow-xs cursor-pointer self-start md:self-center whitespace-nowrap"
        >
          ← Return to Trail
        </button>
      </div>

      {!isSessionActive ? (
        /* PRACTICE HUBS FOR CURRENT SUBJECT */
        <div className="space-y-6">
          
          {/* 1. MISTAKE CLINIC / WEAKNESS DRILL (TOP PRIORITY) */}
          <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-6 border-2 border-rose-200 dark:border-rose-900/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6 fill-rose-500 text-rose-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading font-black text-base text-slate-900 dark:text-white">
                      Weak Areas & Mistake Clinic
                    </h2>
                    <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                      Refills +1 Heart ❤️
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Reinforce tricky questions and concepts you missed to boost your PLE score.
                  </p>
                </div>
              </div>

              <button
                id="start-weakness-drill-btn"
                onClick={() => handleStartMode('weakness')}
                className="btn-duo-green px-5 py-3 rounded-2xl text-xs font-black cursor-pointer shadow-sm whitespace-nowrap self-start sm:self-center flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Fix Mistakes Drill
              </button>
            </div>
          </div>

          {/* 2. TOPICAL REVISION (GROUPED BY NCDC SYLLABUS UNITS) */}
          <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-6 border-2 border-slate-200 dark:border-[#37464f] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                  Topic-by-Topic NCDC Revision
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Choose a specific syllabus unit in {currentSubjectMeta.name} to drill:
                </p>
              </div>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-800">
                {subjectUnits.length} Units Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjectUnits.map((unit) => {
                const totalQuestions = unit.lessons.reduce((acc, l) => acc + l.questions.length, 0);

                return (
                  <div
                    key={unit.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#202f36] border border-slate-200 dark:border-[#37464f] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 mb-1">
                        <span>Unit {unit.unitNumber}</span>
                        <span>{totalQuestions} UNEB Questions</span>
                      </div>
                      <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white leading-snug">
                        {unit.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleStartMode('topical', unit.id)}
                      className="btn-duo-blue w-full py-2 rounded-xl text-xs font-black cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Practice Unit {unit.unitNumber}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. UNEB SPEED SPRINT & DEFINITIONS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Speed Sprint Card */}
            <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-5 border-2 border-slate-200 dark:border-[#37464f] shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    UNEB PLE Speed Sprint
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">
                    5 rapid-fire mixed questions from all syllabus topics. Tests exam speed!
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleStartMode('sprint')}
                className="btn-duo-amber w-full py-2.5 rounded-xl text-xs font-black cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                Start Speed Sprint (+35 XP)
              </button>
            </div>

            {/* Core Definitions & Terms */}
            <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-5 border-2 border-slate-200 dark:border-[#37464f] shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    Classroom Definitions & Recall
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">
                    UNEB keyword drills and foundational definitions taught in Ugandan schools.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleStartMode('vocab')}
                className="btn-duo-dark w-full py-2.5 rounded-xl text-xs font-black cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Drill Key Definitions
              </button>
            </div>

          </div>

        </div>
      ) : isSessionFinished ? (
        /* SPRINT / PRACTICE COMPLETE SUMMARY */
        <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-8 text-center border-2 border-slate-200 dark:border-[#37464f] shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              Practice Drill Complete
            </span>
            <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-2">
              Great Effort, Scholar!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
              You scored <span className="font-black text-amber-600 dark:text-amber-400">{score} of {currentPracticeQuestions.length}</span> correct on {currentSubjectMeta.name}!
            </p>
          </div>

          <div className="grid grid-cols-2 max-w-xs mx-auto gap-3 text-center">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-[#202f36] border border-amber-200 dark:border-[#37464f]">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">XP Earned</span>
              <span className="font-heading font-black text-lg text-amber-600 dark:text-amber-400">+35 XP</span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-[#202f36] border border-blue-200 dark:border-[#37464f]">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Gems Won</span>
              <span className="font-heading font-black text-lg text-blue-600 dark:text-blue-400">+8 💎</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={handleResetSession}
              className="btn-duo-white px-5 py-3 rounded-2xl text-xs font-black cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Practice Another Topic
            </button>
            <button
              onClick={onBackToHome}
              className="btn-duo-green px-5 py-3 rounded-2xl text-xs font-black cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              Return to Learn Trail
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE PRACTICE QUESTION SESSION */
        <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-[#37464f] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">
                Question {currentIndex + 1} of {currentPracticeQuestions.length}
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#202f36] text-slate-600 dark:text-slate-300">
                {activeMode === 'weakness' ? 'Mistake Clinic' : activeMode === 'topical' ? 'Topical' : 'Speed Drill'}
              </span>
            </div>
            <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              {currentQ.ncdcTopic}
            </span>
          </div>

          <h3 className="font-heading font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">
            {currentQ.prompt}
          </h3>

          {currentQ.type === 'multiple_choice' ? (
            <div className="grid grid-cols-1 gap-2.5">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => !isAnswerChecked && setSelectedOptionId(opt.id)}
                    disabled={isAnswerChecked}
                    className={`p-4 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 shadow-xs'
                        : 'border-slate-200 dark:border-[#37464f] hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-[#202f36] text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{opt.text}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#202f36] text-slate-700 dark:text-slate-300 text-xs font-medium">
              <p>{currentQ.explanation}</p>
            </div>
          )}

          {isAnswerChecked && (
            <div
              className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${
                isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <div className="text-xs">
                <span className="font-black block text-sm">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{currentQ.explanation}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            {isAnswerChecked ? (
              <button
                onClick={handleNext}
                className="btn-duo-green w-full sm:w-auto px-7 py-3 rounded-2xl text-xs font-black cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                Next Question
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCheck}
                disabled={!selectedOptionId && currentQ.type === 'multiple_choice'}
                className="btn-duo-amber w-full sm:w-auto px-7 py-3 rounded-2xl text-xs font-black cursor-pointer shadow-sm disabled:opacity-50"
              >
                Check Answer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
