import React, { useState } from 'react';
import { UserStats, Question, SubjectId } from '../types';
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
  Check
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';
import confetti from 'canvas-confetti';

interface PracticeArenaProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onBackToHome: () => void;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  userStats,
  onUpdateStats,
  onBackToHome,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('sst');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  // Extract questions for rapid practice
  const practiceQuestions: Question[] = React.useMemo(() => {
    const questions: Question[] = [];
    CURRICULUM_UNITS.filter((u) => u.subjectId === selectedSubject).forEach((unit) => {
      unit.lessons.forEach((l) => {
        questions.push(...l.questions);
      });
    });
    return questions.slice(0, 5); // 5-question rapid sprint
  }, [selectedSubject]);

  const currentQ = practiceQuestions[currentIndex];

  const handleStartSprint = () => {
    soundFx.playClick();
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
    if (currentIndex < practiceQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsAnswerChecked(false);
      setSelectedOptionId(null);
    } else {
      soundFx.playFanfare();
      confetti({ particleCount: 80, spread: 60 });
      setIsSessionFinished(true);

      // Reward XP and Gems
      const xpWon = 35;
      const gemsWon = 8;
      onUpdateStats({
        ...userStats,
        totalXp: userStats.totalXp + xpWon,
        enjubaGems: userStats.enjubaGems + gemsWon,
        weeklyMinutes: userStats.weeklyMinutes + 10,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-amber-500 rounded-3xl p-6 sm:p-7 text-white shadow-md border-b-4 border-amber-600 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-black/20 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/20">
              PLE RAPID DRILL
            </span>
            <span className="text-white/90 text-xs font-bold">
              Speed & Problem Solving
            </span>
          </div>
          <h1 className="font-heading font-black text-xl sm:text-2xl text-white">
            Timed Practice Drill
          </h1>
          <p className="text-white/90 text-xs mt-1 max-w-lg font-medium">
            5 quick UNEB examination questions to sharpen your recall and speed.
          </p>
        </div>

        <button
          onClick={onBackToHome}
          className="btn-duo-white px-4 py-2 rounded-2xl text-xs font-black shadow-xs cursor-pointer self-start md:self-center whitespace-nowrap"
        >
          ← Return to Trail
        </button>
      </div>

      {!isSessionActive ? (
        /* Subject Picker Card */
        <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-6 sm:p-7 border-2 border-slate-200 dark:border-[#37464f] shadow-xs space-y-5">
          <div>
            <h2 className="font-heading font-black text-base text-slate-900 dark:text-white">
              Select Subject:
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Choose an NCDC core paper to practice
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SUBJECTS.map((sub) => {
              const isSelected = selectedSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedSubject(sub.id);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 shadow-xs'
                      : 'border-slate-200 dark:border-[#37464f] hover:border-slate-300 bg-white dark:bg-[#202f36] text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <SubjectBadge subjectId={sub.id} size="sm" />
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-heading font-black text-xs sm:text-sm block text-slate-900 dark:text-white">
                      {sub.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {sub.ncdcCode}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#202f36] border border-slate-200 dark:border-[#37464f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-900 flex items-center justify-center">
                <Timer className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  5 Questions • Speed Sprint
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  Earn +35 XP and +8 Enjuba Gems
                </span>
              </div>
            </div>

            <button
              id="start-sprint-btn"
              onClick={handleStartSprint}
              className="btn-duo-amber w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black cursor-pointer shadow-sm"
            >
              Start Sprint Now
            </button>
          </div>
        </div>
      ) : isSessionFinished ? (
        /* Sprint Complete Summary */
        <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-8 text-center border-2 border-slate-200 dark:border-[#37464f] shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
              Sprint Complete!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
              You scored <span className="font-black text-amber-600 dark:text-amber-400">{score} of {practiceQuestions.length}</span> correct!
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleStartSprint}
              className="btn-duo-white px-5 py-3 rounded-2xl text-xs font-black cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Another Sprint
            </button>
            <button
              onClick={onBackToHome}
              className="btn-duo-green px-5 py-3 rounded-2xl text-xs font-black cursor-pointer flex items-center gap-2 shadow-sm"
            >
              Return to Trail
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Active Rapid Fire Question */
        <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-[#37464f] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              Question {currentIndex + 1} of {practiceQuestions.length}
            </span>
            <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              {currentQ.ncdcTopic}
            </span>
          </div>

          <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white leading-snug">
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
