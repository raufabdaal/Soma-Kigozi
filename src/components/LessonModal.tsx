import React, { useState, useEffect } from 'react';
import { 
  LessonNode, 
  Question, 
  TeachSlide,
  UserStats 
} from '../types';
import { 
  X, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Bot, 
  Trophy, 
  RotateCcw,
  Flame,
  HelpCircle,
  BookOpen,
  Check,
  Lightbulb,
  Compass,
  MapPin,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx, speakAloud } from '../services/soundEffects';

interface LessonModalProps {
  lesson: LessonNode;
  userStats: UserStats;
  onClose: () => void;
  onCompleteLesson: (lessonId: string, score: number, xpEarned: number, gemsEarned: number) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  userStats,
  onClose,
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
  const [tappedHotspotId, setTappedHotspotId] = useState<string | null>(null);

  // Validation & Error tracking
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);

  // AI Tutor Hint state
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);

  const currentQ: Question | undefined = lesson.questions[questionIndex];
  const currentSlide: TeachSlide | undefined = teachSlides[teachSlideIndex];

  // Reset question state when questionIndex changes
  useEffect(() => {
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setSelectedOptionId(null);
    setSelectedLeft(null);
    setMatchedPairs({});
    setTappedHotspotId(null);
    setAiHint(null);
    setShowHintModal(false);

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
      // Transition from Teach to Guided Practice
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
    } else if (currentQ.type === 'diagram_tap') {
      correct = tappedHotspotId === currentQ.targetHotspotId;
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
      // Complete lesson!
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

  // Request AI Tutor hint
  const handleAskAiHint = async () => {
    if (!currentQ) return;
    setIsLoadingAi(true);
    setShowHintModal(true);
    try {
      const response = await fetch('/api/ask-kigozi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `In P.7 SST: "${currentQ.prompt}". What Socratic hint helps the student understand?`,
          gradeLevel: 'P.7',
          subject: 'sst',
          studentName: userStats.studentName,
        }),
      });
      const data = await response.json();
      setAiHint(data.reply || currentQ.explanation);
    } catch {
      setAiHint(currentQ.explanation);
    } finally {
      setIsLoadingAi(false);
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
  // RENDER VISUAL SCHEMATICS FOR TEACH SLIDES
  // -------------------------------------------------------------
  const renderVisualSchematic = (type?: string) => {
    if (type === 'rift_valley_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-gradient-to-b from-sky-50 to-amber-50/50 border-2 border-slate-200">
          <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              Cross-Section: Tectonic Faulting & Escarpments
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
              Western Arm Graben
            </span>
          </div>

          <div className="h-28 relative flex items-end justify-between px-4 py-2 bg-white rounded-xl border border-slate-200">
            {/* Left Plateau / Escarpment */}
            <div className="w-1/4 h-20 bg-emerald-600 rounded-t-lg relative flex flex-col items-center justify-center text-white text-[10px] font-black shadow-xs">
              <span>Plateau</span>
              <span className="text-[8px] opacity-80">(Fort Portal)</span>
            </div>
            
            {/* Fault Line Arrow */}
            <div className="text-[10px] font-black text-rose-600 text-center animate-bounce">
              <span>⬇ Fault</span>
            </div>

            {/* Sunken Valley Floor (Graben) with Lake */}
            <div className="w-2/5 h-10 bg-blue-500 rounded-t-lg relative flex flex-col items-center justify-center text-white text-[10px] font-black shadow-xs">
              <span>Rift Graben</span>
              <span className="text-[8px] opacity-90">Lake Albert / Edward</span>
            </div>

            {/* Fault Line Arrow */}
            <div className="text-[10px] font-black text-rose-600 text-center animate-bounce">
              <span>⬇ Fault</span>
            </div>

            {/* Right Horst Mountain */}
            <div className="w-1/4 h-24 bg-slate-700 rounded-t-lg relative flex flex-col items-center justify-center text-white text-[10px] font-black shadow-xs border-t-4 border-slate-100">
              <span>Horst Block</span>
              <span className="text-[8px] text-amber-300">Rwenzori (5,109m)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 font-semibold mt-2 text-center">
            Tensional forces pulled the crust outward, dropping the valley graben between parallel fault lines.
          </p>
        </div>
      );
    }

    if (type === 'nile_drainage_map') {
      return (
        <div className="p-4 rounded-2xl bg-sky-50/70 border-2 border-sky-200">
          <div className="flex items-center justify-between text-xs font-black text-sky-900 mb-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-600" />
              Nile River Flow Path (Jinja to Egypt)
            </span>
            <span className="text-[10px] bg-sky-200 text-sky-950 font-black px-2 py-0.5 rounded">
              6,650 km Total
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-black">
            <div className="p-2 rounded-xl bg-white border border-sky-200 text-slate-900 shadow-2xs">
              <span className="block text-sky-600 text-[9px]">1. Origin</span>
              Lake Victoria (Jinja)
            </div>
            <div className="p-2 rounded-xl bg-white border border-sky-200 text-slate-900 shadow-2xs">
              <span className="block text-sky-600 text-[9px]">2. Victoria Nile</span>
              Kyoga & Karuma
            </div>
            <div className="p-2 rounded-xl bg-white border border-sky-200 text-slate-900 shadow-2xs">
              <span className="block text-sky-600 text-[9px]">3. Albert Nile</span>
              Pakwach to Nimule
            </div>
            <div className="p-2 rounded-xl bg-white border border-sky-200 text-slate-900 shadow-2xs">
              <span className="block text-sky-600 text-[9px]">4. White Nile</span>
              Khartoum to Delta
            </div>
          </div>
        </div>
      );
    }

    if (type === 'independence_flag') {
      return (
        <div className="p-4 rounded-2xl bg-slate-900 text-white border-2 border-slate-800 flex items-center gap-4">
          <div className="w-24 h-16 rounded-xl overflow-hidden border-2 border-white/30 flex flex-col shrink-0 shadow-md">
            <div className="h-1/3 bg-black flex items-center justify-center" />
            <div className="h-1/3 bg-amber-400 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[7px] text-slate-950 font-black">
                🦩
              </div>
            </div>
            <div className="h-1/3 bg-rose-600 flex items-center justify-center" />
          </div>
          <div className="text-xs space-y-0.5">
            <p className="font-heading font-black text-amber-400 text-sm">
              Sovereign Symbols of Uganda
            </p>
            <p className="text-[11px] text-slate-300">
              <strong className="text-white">Black:</strong> African Heritage • <strong className="text-amber-300">Yellow:</strong> Tropical Sunshine • <strong className="text-rose-400">Red:</strong> Brotherhood.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b-2 border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3 flex-1 pr-4">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Phase Badge */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                phase === 'teach' 
                  ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}>
                {phase === 'teach' ? 'Step 1: Teach & Learn' : phase === 'practice' ? 'Step 2: Guided Practice' : 'Mastery Achieved'}
              </span>
              <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 truncate">
                {lesson.title}
              </span>
            </div>
          </div>

          {/* Hearts counter */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-black text-xs">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>{userStats.hearts}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2">
          {phase === 'teach' && (
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${((teachSlideIndex + 1) / Math.max(1, teachSlides.length)) * 100}%` }}
            />
          )}
          {phase === 'practice' && (
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${((questionIndex + 1) / Math.max(1, lesson.questions.length)) * 100}%` }}
            />
          )}
          {phase === 'complete' && (
            <div className="bg-emerald-500 h-full w-full" />
          )}
        </div>

        {/* ========================================================= */}
        {/* PHASE 1: TEACH & LEARN (CONCEPT FIRST) */}
        {/* ========================================================= */}
        {phase === 'teach' && currentSlide && (
          <div className="p-5 sm:p-7 space-y-5 overflow-y-auto flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Concept {teachSlideIndex + 1} of {teachSlides.length}
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Primary 7 NCDC Social Studies
              </span>
            </div>

            <div>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 leading-tight">
                {currentSlide.conceptHeading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 mt-2 whitespace-pre-line leading-relaxed font-medium">
                {currentSlide.body}
              </p>
            </div>

            {/* Visual Schematic Diagram */}
            {renderVisualSchematic(currentSlide.visualType)}

            {/* Key Bullets */}
            {currentSlide.bullets && currentSlide.bullets.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Core UNEB High-Frequency Facts:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-800 font-semibold">
                  {currentSlide.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0 stroke-[3]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PLE Exam Tip Box */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black uppercase text-amber-900 tracking-wide block">
                  PLE Distinction Exam Tip
                </span>
                <p className="text-xs text-amber-950 font-bold mt-0.5 leading-snug">
                  {currentSlide.pleExamTip}
                </p>
              </div>
            </div>

            {/* Interactive Micro-Check (Ensure Retention) */}
            {currentSlide.quickCheck && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border-2 border-blue-200 space-y-3">
                <span className="text-[10px] font-black uppercase text-blue-800 tracking-wide block">
                  Micro-Checkpoint: Test Your Understanding
                </span>
                <p className="text-xs font-black text-slate-900">
                  {currentSlide.quickCheck.prompt}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                        className={`p-3 rounded-xl border-2 text-left text-xs font-bold transition-all cursor-pointer ${
                          !teachMicroChecked
                            ? isSelected
                              ? 'border-blue-500 bg-white shadow-xs text-blue-950'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
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
                  <p className="text-[11px] font-bold text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                    💡 {currentSlide.quickCheck.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 2: GUIDED INTERACTIVE PRACTICE */}
        {/* ========================================================= */}
        {phase === 'practice' && currentQ && (
          <div className="p-5 sm:p-7 space-y-5 overflow-y-auto flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
                Exercise {questionIndex + 1} of {lesson.questions.length} • {currentQ.ncdcTopic}
              </span>
              <button
                onClick={handleAskAiHint}
                className="text-xs font-black text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                Ask Kigozi Hint
              </button>
            </div>

            {/* Prompt */}
            <div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-slate-900 leading-snug">
                {currentQ.prompt}
              </h3>
              {currentQ.ugandanContext && (
                <span className="inline-block mt-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  🇺🇬 {currentQ.ugandanContext}
                </span>
              )}
            </div>

            {/* MULTIPLE CHOICE */}
            {currentQ.type === 'multiple_choice' && (
              <div className="grid grid-cols-1 gap-2.5">
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
                      className={`p-4 rounded-2xl border-2 text-left transition-all font-bold text-xs sm:text-sm cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div>
                        <span>{opt.text}</span>
                        {opt.sublabel && isAnswerChecked && (
                          <span className="block text-[11px] font-semibold text-emerald-700 mt-0.5">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* SENTENCE UNSCRAMBLE */}
            {currentQ.type === 'sentence_unscramble' && (
              <div className="space-y-4">
                {/* Target drop line */}
                <div className="min-h-16 p-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-wrap gap-2 items-center">
                  {selectedWords.length === 0 && (
                    <span className="text-xs text-slate-400 font-medium italic">
                      Tap words below to construct the sentence...
                    </span>
                  )}
                  {selectedWords.map((word, idx) => (
                    <button
                      key={idx}
                      disabled={isAnswerChecked}
                      onClick={() => handleDeselectWord(word, idx)}
                      className="btn-duo-green px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer shadow-xs"
                    >
                      {word}
                    </button>
                  ))}
                </div>

                {/* Available word pool */}
                <div className="flex flex-wrap gap-2">
                  {availableWords.map((word, idx) => (
                    <button
                      key={idx}
                      disabled={isAnswerChecked}
                      onClick={() => handleSelectWord(word, idx)}
                      className="btn-duo-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
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
                  <div className="space-y-2">
                    {currentQ.pairs.map((p) => {
                      const isMatched = !!matchedPairs[p.left];
                      const isSelected = selectedLeft === p.left;
                      return (
                        <button
                          key={p.id}
                          disabled={isAnswerChecked || isMatched}
                          onClick={() => handleSelectPairLeft(p.left)}
                          className={`w-full p-3 rounded-xl border-2 text-left text-xs font-bold transition-all cursor-pointer ${
                            isMatched
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-800 opacity-60'
                              : isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          {p.left}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    {currentQ.pairs.map((p) => {
                      const isPaired = Object.values(matchedPairs).includes(p.right);
                      return (
                        <button
                          key={p.id}
                          disabled={isAnswerChecked || isPaired}
                          onClick={() => handleSelectPairRight(p.right)}
                          className={`w-full p-3 rounded-xl border-2 text-left text-xs font-bold transition-all cursor-pointer ${
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
        {/* PHASE 3: LESSON COMPLETE & RETENTION CARD */}
        {/* ========================================================= */}
        {phase === 'complete' && (
          <div className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto flex-1">
            <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-amber-400/30">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900">
                Lesson Mastered!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                You just locked in high-yield Primary 7 Social Studies knowledge.
              </p>
            </div>

            {/* Score & Rewards Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center">
                <span className="text-[10px] font-black uppercase text-emerald-800 block">XP Earned</span>
                <span className="font-heading font-black text-xl text-emerald-900">+{lesson.xpReward}</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 text-center">
                <span className="text-[10px] font-black uppercase text-blue-800 block">Enjuba Gems</span>
                <span className="font-heading font-black text-xl text-blue-900">+{lesson.gemsReward}</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-center">
                <span className="text-[10px] font-black uppercase text-amber-800 block">Streak</span>
                <span className="font-heading font-black text-xl text-amber-900">{userStats.currentStreak + 1} Days</span>
              </div>
            </div>

            {/* Key PLE Retention Takeaway */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white text-left space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Key Memory Retention Fact for PLE:
              </span>
              <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                {lesson.teachSlides?.[0]?.pleExamTip || 'Consistent practice guarantees Aggregate 4 distinction in Primary 7 UNEB national exams.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="btn-duo-green w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2"
              >
                Return to Curriculum Trail
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BOTTOM ACTION BAR */}
        {/* ========================================================= */}
        {phase === 'teach' && (
          <div className="p-4 sm:p-5 border-t-2 border-slate-100 bg-white flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Slide {teachSlideIndex + 1} of {teachSlides.length}
            </span>
            <button
              onClick={handleNextTeachSlide}
              className="btn-duo-blue px-8 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2"
            >
              {teachSlideIndex < teachSlides.length - 1 ? 'Next Slide' : 'Start Practice'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {phase === 'practice' && (
          <div className={`p-4 sm:p-5 border-t-2 flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isAnswerChecked
              ? isCorrect
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-rose-50 border-rose-200'
              : 'bg-white border-slate-100'
          }`}>
            {isAnswerChecked ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isCorrect ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-7 h-7 text-rose-600 shrink-0" />
                )}
                <div>
                  <h4 className={`font-heading font-black text-sm ${isCorrect ? 'text-emerald-950' : 'text-rose-950'}`}>
                    {isCorrect ? 'Superb! Distinction Standard' : 'Not quite right yet'}
                  </h4>
                  <p className="text-[11px] text-slate-700 font-medium">
                    {currentQ?.explanation}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-400">
                Select your answer to verify
              </span>
            )}

            <div className="w-full sm:w-auto flex justify-end">
              {!isAnswerChecked ? (
                <button
                  disabled={
                    (currentQ?.type === 'multiple_choice' && !selectedOptionId) ||
                    (currentQ?.type === 'sentence_unscramble' && selectedWords.length === 0)
                  }
                  onClick={handleCheckAnswer}
                  className="btn-duo-green w-full sm:w-auto px-8 py-3 rounded-2xl text-xs sm:text-sm font-black"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className={`w-full sm:w-auto px-8 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 ${
                    isCorrect ? 'btn-duo-green' : 'btn-duo-red'
                  }`}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
