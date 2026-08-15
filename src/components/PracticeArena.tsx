import React, { useState } from 'react';
import { UserStats, Question, SubjectId } from '../types';
import { CURRICULUM_UNITS, SUBJECTS } from '../data/curriculumData';
import { 
  Zap, 
  Flame, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Timer, 
  Sparkles, 
  ArrowRight,
  BookOpen
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
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('math');
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
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              PLE Rapid Fire Sprint
            </span>
            <span className="text-white/80 text-xs font-semibold">
              Daily NCDC Mastery Boost
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl">
            Speed Training & Mock Drills
          </h1>
          <p className="text-white/90 text-sm mt-1 max-w-lg leading-relaxed">
            Strengthen your memory and quick problem-solving skills with timed NCDC question sets.
          </p>
        </div>

        <button
          onClick={onBackToHome}
          className="bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          ← Return to Curriculum Map
        </button>
      </div>

      {!isSessionActive ? (
        /* Subject Picker and Start Sprint Card */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <h2 className="font-heading font-bold text-lg text-slate-900">
            Select Subject for Rapid Sprint:
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SUBJECTS.map((sub) => {
              const isSelected = selectedSubject === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedSubject(sub.id);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/80 text-amber-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <span className="text-xs uppercase block text-slate-400 mb-1">
                    {sub.ncdcCode}
                  </span>
                  <span className="text-sm block">{sub.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Sprint Details
                </span>
                <span className="text-[11px] text-slate-500">
                  5 Questions • +35 XP • +8 Enjuba Gems
                </span>
              </div>
            </div>

            <button
              id="start-sprint-btn"
              onClick={handleStartSprint}
              className="btn-3d-amber px-6 py-2.5 rounded-xl text-white font-extrabold text-xs sm:text-sm cursor-pointer"
            >
              Start Sprint Now
            </button>
          </div>
        </div>
      ) : isSessionFinished ? (
        /* Sprint Complete Summary */
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="font-heading font-black text-2xl text-slate-900">
              Sprint Finished!
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              You scored <span className="font-bold text-amber-700">{score} / {practiceQuestions.length}</span> correct!
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleStartSprint}
              className="btn-3d-slate px-5 py-2.5 rounded-xl text-slate-800 font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Try Another Sprint
            </button>
            <button
              onClick={onBackToHome}
              className="btn-3d-amber px-5 py-2.5 rounded-xl text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              Return Home
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Active Rapid Fire Question */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              Question {currentIndex + 1} of {practiceQuestions.length}
            </span>
            <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {currentQ.ncdcTopic}
            </span>
          </div>

          <h3 className="font-heading font-black text-xl text-slate-900 leading-snug">
            {currentQ.prompt}
          </h3>

          {currentQ.type === 'multiple_choice' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => !isAnswerChecked && setSelectedOptionId(opt.id)}
                    disabled={isAnswerChecked}
                    className={`p-4 rounded-xl border-2 text-left font-bold text-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-950'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 text-slate-700 text-sm">
              <p className="font-semibold">{currentQ.explanation}</p>
            </div>
          )}

          {isAnswerChecked && (
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div className="text-xs">
                <span className="font-bold block">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
                <span>{currentQ.explanation}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            {isAnswerChecked ? (
              <button
                onClick={handleNext}
                className="btn-3d-emerald px-6 py-2.5 rounded-xl text-white font-extrabold text-xs sm:text-sm cursor-pointer"
              >
                Next Question →
              </button>
            ) : (
              <button
                onClick={handleCheck}
                disabled={!selectedOptionId && currentQ.type === 'multiple_choice'}
                className="btn-3d-amber px-6 py-2.5 rounded-xl text-white font-extrabold text-xs sm:text-sm cursor-pointer disabled:opacity-50"
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
