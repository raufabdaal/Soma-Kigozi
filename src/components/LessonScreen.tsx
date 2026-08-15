import React, { useState, useEffect } from 'react';
import { 
  LessonNode, 
  Question, 
  TeachSlide,
  UserStats 
} from '../types';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Trophy, 
  BookOpen, 
  Check, 
  Lightbulb, 
  Compass, 
  MapPin, 
  Award,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../services/soundEffects';

interface LessonScreenProps {
  lesson: LessonNode;
  userStats: UserStats;
  onExit: () => void;
  onCompleteLesson: (lessonId: string, score: number, xpEarned: number, gemsEarned: number) => void;
}

export const LessonScreen: React.FC<LessonScreenProps> = ({
  lesson,
  userStats,
  onExit,
  onCompleteLesson,
}) => {
  const teachSlides: TeachSlide[] = lesson.teachSlides || [];
  const hasTeachPhase = teachSlides.length > 0;

  // Phase: 'teach' -> 'practice' -> 'complete'
  const [phase, setPhase] = useState<'teach' | 'practice' | 'complete'>(
    hasTeachPhase ? 'teach' : 'practice'
  );

  // Teach phase state
  const [teachSlideIndex, setTeachSlideIndex] = useState(0);
  const [teachMicroSelected, setTeachMicroSelected] = useState<number | null>(null);
  const [teachMicroChecked, setTeachMicroChecked] = useState(false);

  // Practice phase state
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  // Validation & Error tracking
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);

  const currentQ: Question | undefined = lesson.questions[questionIndex];
  const currentSlide: TeachSlide | undefined = teachSlides[teachSlideIndex];

  // Reset question state when questionIndex changes
  useEffect(() => {
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setSelectedOptionId(null);
    setSelectedLeft(null);
    setMatchedPairs({});
    setShowHint(false);

    if (currentQ && currentQ.type === 'sentence_unscramble') {
      setSelectedWords([]);
      setAvailableWords([...currentQ.scrambledWords]);
    }
  }, [questionIndex, currentQ]);

  // Reset micro check on teach slide change
  useEffect(() => {
    setTeachMicroSelected(null);
    setTeachMicroChecked(false);
  }, [teachSlideIndex]);

  // -------------------------------------------------------------
  // TEACH PHASE HANDLERS
  // -------------------------------------------------------------
  const handleNextTeachSlide = () => {
    soundFx.playClick();
    if (teachSlideIndex < teachSlides.length - 1) {
      setTeachSlideIndex((prev) => prev + 1);
    } else {
      soundFx.playFanfare();
      setPhase('practice');
    }
  };

  // -------------------------------------------------------------
  // PRACTICE PHASE HANDLERS
  // -------------------------------------------------------------
  const handleCheckAnswer = () => {
    if (!currentQ) return;
    let correct = false;

    if (currentQ.type === 'multiple_choice') {
      correct = selectedOptionId === currentQ.correctOptionId;
    } else if (currentQ.type === 'drag_drop_match') {
      correct = currentQ.pairs.every((pair) => matchedPairs[pair.left] === pair.right);
    } else if (currentQ.type === 'sentence_unscramble') {
      const studentSentence = selectedWords.join(' ').trim().toLowerCase();
      const targetSentence = currentQ.correctSentence.trim().toLowerCase();
      correct = studentSentence === targetSentence;
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      soundFx.playCorrect();
    } else {
      soundFx.playWrong();
      setMistakesCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    soundFx.playClick();
    if (questionIndex < lesson.questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      soundFx.playFanfare();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setPhase('complete');
      const finalScore = Math.max(
        60,
        Math.round(((lesson.questions.length - mistakesCount) / lesson.questions.length) * 100)
      );
      onCompleteLesson(lesson.id, finalScore, lesson.xpReward, lesson.gemsReward);
    }
  };

  // Word unscramble toggle
  const handleSelectWord = (word: string, index: number) => {
    soundFx.playClick();
    setSelectedWords([...selectedWords, word]);
    const nextAvail = [...availableWords];
    nextAvail.splice(index, 1);
    setAvailableWords(nextAvail);
  };

  const handleDeselectWord = (word: string, index: number) => {
    soundFx.playClick();
    const nextSelected = [...selectedWords];
    nextSelected.splice(index, 1);
    setSelectedWords(nextSelected);
    setAvailableWords([...availableWords, word]);
  };

  // Drag drop matching
  const handleSelectPairLeft = (leftText: string) => {
    soundFx.playClick();
    setSelectedLeft(leftText);
  };

  const handleSelectPairRight = (rightText: string) => {
    soundFx.playClick();
    if (selectedLeft) {
      setMatchedPairs({
        ...matchedPairs,
        [selectedLeft]: rightText,
      });
      setSelectedLeft(null);
    }
  };

  // -------------------------------------------------------------
  // VISUAL SCHEMATIC RENDERER (NO EMOJIS, CLEAN VECTOR ELEMENTS)
  // -------------------------------------------------------------
  const renderVisualSchematic = (type?: string) => {
    if (type === 'rift_valley_diagram') {
      return (
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border-2 border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-slate-800">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              Cross-Section: Tectonic Faulting
            </span>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg">
              Western Arm Graben
            </span>
          </div>

          <div className="h-28 relative flex items-end justify-between px-4 py-3 bg-white rounded-2xl border border-slate-200">
            <div className="w-1/4 h-20 bg-emerald-600 rounded-t-xl flex flex-col items-center justify-center text-white text-[11px] font-black shadow-xs">
              <span>Plateau</span>
              <span className="text-[9px] opacity-80">(Escarpment)</span>
            </div>
            
            <div className="text-[11px] font-black text-rose-600 text-center">
              <span>⬇ Tension Fault</span>
            </div>

            <div className="w-2/5 h-10 bg-blue-500 rounded-t-xl flex flex-col items-center justify-center text-white text-[11px] font-black shadow-xs">
              <span>Valley Floor</span>
              <span className="text-[9px] opacity-90">Lake Albert</span>
            </div>

            <div className="text-[11px] font-black text-rose-600 text-center">
              <span>⬇ Tension Fault</span>
            </div>

            <div className="w-1/4 h-24 bg-slate-700 rounded-t-xl flex flex-col items-center justify-center text-white text-[11px] font-black shadow-xs border-t-4 border-slate-200">
              <span>Horst Block</span>
              <span className="text-[9px] text-amber-300">Rwenzori</span>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'nile_drainage_map') {
      return (
        <div className="p-4 sm:p-5 rounded-3xl bg-blue-50/60 border-2 border-blue-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-blue-950">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              River Nile Flow Sequence (6,650 km)
            </span>
            <span className="text-[10px] bg-blue-200 text-blue-950 font-black px-2 py-0.5 rounded-lg">
              Uganda to Mediterranean
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-black">
            <div className="p-2.5 rounded-2xl bg-white border border-blue-200 text-slate-900 shadow-2xs">
              <span className="block text-blue-600 text-[10px]">1. Origin</span>
              Lake Victoria (Jinja)
            </div>
            <div className="p-2.5 rounded-2xl bg-white border border-blue-200 text-slate-900 shadow-2xs">
              <span className="block text-blue-600 text-[10px]">2. Victoria Nile</span>
              Kyoga & Karuma
            </div>
            <div className="p-2.5 rounded-2xl bg-white border border-blue-200 text-slate-900 shadow-2xs">
              <span className="block text-blue-600 text-[10px]">3. Albert Nile</span>
              Pakwach to Nimule
            </div>
            <div className="p-2.5 rounded-2xl bg-white border border-blue-200 text-slate-900 shadow-2xs">
              <span className="block text-blue-600 text-[10px]">4. White Nile</span>
              Mediterranean Sea
            </div>
          </div>
        </div>
      );
    }

    if (type === 'independence_flag') {
      return (
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white border-2 border-slate-800 flex items-center gap-4">
          <div className="w-20 h-14 rounded-xl overflow-hidden border border-white/20 flex flex-col shrink-0 shadow-md">
            <div className="h-1/3 bg-black" />
            <div className="h-1/3 bg-amber-400 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
              </div>
            </div>
            <div className="h-1/3 bg-rose-600" />
          </div>
          <div className="text-xs space-y-0.5">
            <p className="font-heading font-black text-amber-400 text-sm">
              Sovereign National Symbols of Uganda
            </p>
            <p className="text-[11px] text-slate-300">
              <strong className="text-white">Black:</strong> People • <strong className="text-amber-300">Yellow:</strong> Sunshine • <strong className="text-rose-400">Red:</strong> Brotherhood.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] flex flex-col justify-between">
      
      {/* Top Header Bar with Duolingo Progress Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-4">
          <button
            id="lesson-exit-btn"
            onClick={onExit}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Exit Lesson"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Smooth Linear Progress Bar */}
          <div className="flex-1 bg-slate-200 rounded-full h-3.5 overflow-hidden relative">
            {phase === 'teach' && (
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((teachSlideIndex + 1) / Math.max(1, teachSlides.length)) * 100}%` }}
              />
            )}
            {phase === 'practice' && (
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((questionIndex + 1) / Math.max(1, lesson.questions.length)) * 100}%` }}
              />
            )}
            {phase === 'complete' && (
              <div className="bg-emerald-500 h-full w-full rounded-full" />
            )}
          </div>

          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            {phase === 'teach' ? 'Teach' : phase === 'practice' ? 'Practice' : 'Done'}
          </div>
        </div>
      </header>

      {/* Main Lesson Body */}
      <main className="max-w-2xl mx-auto w-full flex-1 px-4 sm:px-6 py-6 flex flex-col justify-center">
        
        {/* ========================================================= */}
        {/* PHASE 1: TEACH & LEARN */}
        {/* ========================================================= */}
        {phase === 'teach' && currentSlide && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600">
              <BookOpen className="w-4 h-4" />
              <span>Concept {teachSlideIndex + 1} of {teachSlides.length}</span>
            </div>

            <div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
                {currentSlide.conceptHeading}
              </h1>
              <p className="text-sm sm:text-base text-slate-700 mt-3 whitespace-pre-line leading-relaxed font-medium">
                {currentSlide.body}
              </p>
            </div>

            {/* Visual Diagram */}
            {renderVisualSchematic(currentSlide.visualType)}

            {/* Key UNEB Facts */}
            {currentSlide.bullets && currentSlide.bullets.length > 0 && (
              <div className="p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Core UNEB Syllabus Points:
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 font-semibold">
                  {currentSlide.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0 stroke-[3]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PLE Exam Tip Box */}
            <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-start gap-3 shadow-xs">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider block">
                  PLE Examination Tip
                </span>
                <p className="text-xs sm:text-sm text-amber-950 font-bold mt-0.5 leading-snug">
                  {currentSlide.pleExamTip}
                </p>
              </div>
            </div>

            {/* Micro Checkpoint */}
            {currentSlide.quickCheck && (
              <div className="p-4 sm:p-5 rounded-3xl bg-blue-50/70 border-2 border-blue-200 space-y-3">
                <span className="text-[11px] font-black uppercase text-blue-900 tracking-wider block">
                  Check Your Understanding
                </span>
                <p className="text-xs sm:text-sm font-black text-slate-900">
                  {currentSlide.quickCheck.prompt}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentSlide.quickCheck.options.map((opt, idx) => {
                    const isSelected = teachMicroSelected === idx;
                    const isCorrectOption = idx === currentSlide.quickCheck?.correctIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          soundFx.playClick();
                          setTeachMicroSelected(idx);
                          setTeachMicroChecked(true);
                          if (isCorrectOption) soundFx.playCorrect();
                          else soundFx.playWrong();
                        }}
                        className={`p-3 rounded-2xl border-2 text-left text-xs font-bold transition-all cursor-pointer ${
                          !teachMicroChecked
                            ? isSelected
                              ? 'border-blue-500 bg-white text-blue-950 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                            : isCorrectOption
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                            : isSelected
                            ? 'border-rose-500 bg-rose-50 text-rose-950'
                            : 'border-slate-200 bg-white text-slate-400'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {teachMicroChecked && (
                  <p className="text-xs font-bold text-slate-700 bg-white p-3 rounded-2xl border border-slate-200">
                    {currentSlide.quickCheck.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 2: GUIDED PRACTICE */}
        {/* ========================================================= */}
        {phase === 'practice' && currentQ && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
                Exercise {questionIndex + 1} of {lesson.questions.length}
              </span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowHint(!showHint);
                }}
                className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
              </button>
            </div>

            {/* Hint Box */}
            {showHint && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-semibold animate-in fade-in duration-150">
                {currentQ.explanation}
              </div>
            )}

            {/* Question Prompt */}
            <div>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 leading-snug">
                {currentQ.prompt}
              </h2>
            </div>

            {/* MULTIPLE CHOICE */}
            {currentQ.type === 'multiple_choice' && (
              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      disabled={isAnswerChecked}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedOptionId(opt.id);
                      }}
                      className={`p-4 rounded-3xl border-3 text-left transition-all font-bold text-xs sm:text-sm cursor-pointer flex items-center justify-between active:scale-99 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <span>{opt.text}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* SENTENCE UNSCRAMBLE */}
            {currentQ.type === 'sentence_unscramble' && (
              <div className="space-y-4">
                <div className="min-h-16 p-4 rounded-3xl border-3 border-dashed border-slate-300 bg-slate-50 flex flex-wrap gap-2.5 items-center">
                  {selectedWords.length === 0 && (
                    <span className="text-xs text-slate-400 font-medium italic">
                      Tap words below in the correct sequence...
                    </span>
                  )}
                  {selectedWords.map((word, idx) => (
                    <button
                      key={idx}
                      disabled={isAnswerChecked}
                      onClick={() => handleDeselectWord(word, idx)}
                      className="btn-duo-green px-3.5 py-2 rounded-2xl text-xs font-black cursor-pointer shadow-xs"
                    >
                      {word}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {availableWords.map((word, idx) => (
                    <button
                      key={idx}
                      disabled={isAnswerChecked}
                      onClick={() => handleSelectWord(word, idx)}
                      className="btn-duo-white px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DRAG DROP PAIRING */}
            {currentQ.type === 'drag_drop_match' && (
              <div className="space-y-3">
                <span className="text-xs text-slate-500 font-bold block">
                  Tap an item on the left, then tap its matching pair on the right:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2.5">
                    {currentQ.pairs.map((p) => {
                      const isMatched = !!matchedPairs[p.left];
                      const isSelected = selectedLeft === p.left;
                      return (
                        <button
                          key={p.id}
                          disabled={isAnswerChecked || isMatched}
                          onClick={() => handleSelectPairLeft(p.left)}
                          className={`w-full p-3 rounded-2xl border-2 text-left text-xs font-bold transition-all cursor-pointer ${
                            isMatched
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-800 opacity-60'
                              : isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          {p.left}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2.5">
                    {currentQ.pairs.map((p) => {
                      const isPaired = Object.values(matchedPairs).includes(p.right);
                      return (
                        <button
                          key={p.id}
                          disabled={isAnswerChecked || isPaired}
                          onClick={() => handleSelectPairRight(p.right)}
                          className={`w-full p-3 rounded-2xl border-2 text-left text-xs font-bold transition-all cursor-pointer ${
                            isPaired
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-800 opacity-60'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          {p.right}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 3: LESSON COMPLETE */}
        {/* ========================================================= */}
        {phase === 'complete' && (
          <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-18 h-18 rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center font-black mx-auto shadow-xl shadow-amber-400/30">
              <Trophy className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <h1 className="font-heading font-black text-3xl text-slate-900">
                Lesson Mastered!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
                Primary 7 Social Studies knowledge secured for UNEB PLE.
              </p>
            </div>

            {/* Rewards Card */}
            <div className="grid grid-cols-2 gap-3.5 max-w-sm mx-auto">
              <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-200 text-center">
                <span className="text-[11px] font-black uppercase text-emerald-800 block">XP Earned</span>
                <span className="font-heading font-black text-2xl text-emerald-950">+{lesson.xpReward}</span>
              </div>
              <div className="p-4 rounded-3xl bg-blue-50 border-2 border-blue-200 text-center">
                <span className="text-[11px] font-black uppercase text-blue-800 block">Enjuba Gems</span>
                <span className="font-heading font-black text-2xl text-blue-950">+{lesson.gemsReward}</span>
              </div>
            </div>

            {/* Retention Memory Card */}
            <div className="p-5 rounded-3xl bg-slate-900 text-white text-left space-y-2 shadow-lg">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                Key UNEB PLE Fact:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed">
                {lesson.teachSlides?.[0]?.pleExamTip || 'Consistent daily revision locks in Division 1 distinction in Primary 7 UNEB national exams.'}
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Sticky Action Bar */}
      <footer className={`border-t-2 px-4 sm:px-6 py-4 transition-colors ${
        phase === 'practice' && isAnswerChecked
          ? isCorrect
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-rose-50 border-rose-200'
          : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-2xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {phase === 'teach' && (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Slide {teachSlideIndex + 1} of {teachSlides.length}
              </span>
              <button
                id="lesson-teach-next-btn"
                onClick={handleNextTeachSlide}
                className="btn-duo-blue px-7 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer shadow-md"
              >
                {teachSlideIndex < teachSlides.length - 1 ? 'Next Concept' : 'Start Practice'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {phase === 'practice' && (
            <>
              {isAnswerChecked ? (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {isCorrect ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 stroke-[2.5]" />
                  ) : (
                    <AlertCircle className="w-7 h-7 text-rose-600 shrink-0 stroke-[2.5]" />
                  )}
                  <div>
                    <h4 className={`font-heading font-black text-sm ${isCorrect ? 'text-emerald-950' : 'text-rose-950'}`}>
                      {isCorrect ? 'Excellent!' : 'Correct Solution:'}
                    </h4>
                    <p className="text-xs text-slate-700 font-medium line-clamp-2">
                      {currentQ?.explanation}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                  Select your answer to proceed
                </span>
              )}

              <div className="w-full sm:w-auto flex justify-end">
                {!isAnswerChecked ? (
                  <button
                    id="lesson-check-answer-btn"
                    disabled={
                      (currentQ?.type === 'multiple_choice' && !selectedOptionId) ||
                      (currentQ?.type === 'sentence_unscramble' && selectedWords.length === 0)
                    }
                    onClick={handleCheckAnswer}
                    className="btn-duo-green w-full sm:w-auto px-8 py-3 rounded-2xl text-xs sm:text-sm font-black cursor-pointer shadow-md"
                  >
                    Check
                  </button>
                ) : (
                  <button
                    id="lesson-next-question-btn"
                    onClick={handleNextQuestion}
                    className={`w-full sm:w-auto px-8 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isCorrect ? 'btn-duo-green' : 'btn-duo-red'
                    }`}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}

          {phase === 'complete' && (
            <button
              id="lesson-complete-continue-btn"
              onClick={onExit}
              className="btn-duo-green w-full py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              Back to Learning Trail
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>
      </footer>

    </div>
  );
};
