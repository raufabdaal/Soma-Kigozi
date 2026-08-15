import React, { useState, useEffect } from 'react';
import { 
  LessonNode, 
  Question, 
  MultipleChoiceQuestion, 
  DragDropQuestion, 
  SentenceUnscrambleQuestion, 
  InteractiveDialQuestion, 
  DiagramTapQuestion, 
  UserStats 
} from '../types';
import { 
  X, 
  Heart, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Bot, 
  Trophy, 
  RotateCcw,
  Sun,
  Flame,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx, speakAloud, stopSpeaking } from '../services/soundEffects';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Drag & drop pairing state
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});

  // Sentence unscramble state
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  // Interactive dial state
  const [dialValue, setDialValue] = useState<number>(0);

  // Diagram tap state
  const [tappedHotspotId, setTappedHotspotId] = useState<string | null>(null);

  // Validation state
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);

  // AI Tutor Hint state
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);

  // Finished state
  const [isFinished, setIsFinished] = useState(false);

  const currentQ: Question = lesson.questions[currentIndex];

  // Initialize question state whenever currentIndex changes
  useEffect(() => {
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setSelectedOptionId(null);
    setSelectedLeft(null);
    setMatchedPairs({});
    setTappedHotspotId(null);
    setAiHint(null);
    setShowHintModal(false);

    if (currentQ.type === 'sentence_unscramble') {
      setSelectedWords([]);
      setAvailableWords([...currentQ.scrambledWords]);
    } else if (currentQ.type === 'interactive_dial') {
      setDialValue(currentQ.initialValue);
    }
  }, [currentIndex, currentQ]);

  // Read aloud prompt when requested
  const handleSpeak = (text: string) => {
    soundFx.playClick();
    speakAloud(text);
  };

  // Check Answer logic
  const handleCheckAnswer = () => {
    let correct = false;

    if (currentQ.type === 'multiple_choice') {
      correct = selectedOptionId === currentQ.correctOptionId;
    } else if (currentQ.type === 'drag_drop_match') {
      // Check if all pairs are correctly matched
      const allMatched = currentQ.pairs.every(
        (pair) => matchedPairs[pair.left] === pair.right
      );
      correct = allMatched;
    } else if (currentQ.type === 'sentence_unscramble') {
      const studentSentence = selectedWords.join(' ').trim().toLowerCase();
      const targetSentence = currentQ.correctSentence.trim().toLowerCase();
      correct = studentSentence === targetSentence;
    } else if (currentQ.type === 'interactive_dial') {
      correct = Math.abs(dialValue - currentQ.targetValue) < 0.01;
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

  // Continue to next question or finish
  const handleContinue = () => {
    soundFx.playClick();
    if (currentIndex < lesson.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Lesson Complete!
      soundFx.playFanfare();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setIsFinished(true);
      const calculatedScore = Math.max(
        60,
        Math.round(((lesson.questions.length - mistakesCount) / lesson.questions.length) * 100)
      );
      onCompleteLesson(lesson.id, calculatedScore, lesson.xpReward, lesson.gemsReward);
    }
  };

  // Fetch AI Tutor Hint from server
  const handleGetAiHint = async () => {
    soundFx.playClick();
    setIsLoadingAi(true);
    setShowHintModal(true);

    try {
      const res = await fetch('/api/ai/tutor-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.prompt,
          studentAnswer:
            currentQ.type === 'multiple_choice'
              ? (currentQ as MultipleChoiceQuestion).options.find((o) => o.id === selectedOptionId)?.text
              : currentQ.type === 'interactive_dial'
              ? `${dialValue} ${(currentQ as InteractiveDialQuestion).unit}`
              : currentQ.type === 'sentence_unscramble'
              ? selectedWords.join(' ')
              : 'Unknown',
          subject: lesson.subjectId,
          gradeLevel: lesson.gradeLevel,
          concept: currentQ.ncdcTopic,
        }),
      });

      const data = await res.json();
      if (data.success && data.text) {
        setAiHint(data.text);
      } else {
        setAiHint(data.fallback || currentQ.explanation);
      }
    } catch {
      setAiHint(
        `💡 Study Buddy Hint: ${currentQ.explanation.split('.')[0]}. Think about what the question is asking in real life!`
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Matching logic
  const handleSelectLeft = (leftItem: string) => {
    soundFx.playClick();
    setSelectedLeft(leftItem);
  };

  const handleSelectRight = (rightItem: string) => {
    soundFx.playClick();
    if (selectedLeft) {
      setMatchedPairs((prev) => ({
        ...prev,
        [selectedLeft]: rightItem,
      }));
      setSelectedLeft(null);
    }
  };

  // Sentence unscramble logic
  const handleAddWord = (word: string, index: number) => {
    soundFx.playClick();
    setSelectedWords((prev) => [...prev, word]);
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveWord = (word: string, index: number) => {
    soundFx.playClick();
    setSelectedWords((prev) => prev.filter((_, i) => i !== index));
    setAvailableWords((prev) => [...prev, word]);
  };

  const progressPercent = Math.round(((currentIndex + 1) / lesson.questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-between overflow-y-auto">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            id="lesson-close-btn"
            onClick={() => {
              stopSpeaking();
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Progress Bar */}
          <div className="flex-1 max-w-lg bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Hearts / Energy */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-extrabold text-sm">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>{userStats.hearts}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {isFinished ? (
          /* Lesson Complete Celebration View */
          <div className="bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-200 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
              <Trophy className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Lesson Completed!
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 mt-2">
                Oli Muzira! Excellent Job!
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                You mastered <span className="font-bold text-slate-800">{lesson.title}</span>. Your projected PLE score is climbing!
              </p>
            </div>

            {/* Rewards Card */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <Sun className="w-6 h-6 text-amber-500 fill-amber-400 mx-auto mb-1" />
                <span className="block text-xs font-bold text-slate-600">Enjuba Gems</span>
                <span className="font-heading font-black text-xl text-amber-700">+{lesson.gemsReward}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                <Sparkles className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                <span className="block text-xs font-bold text-slate-600">Total XP</span>
                <span className="font-heading font-black text-xl text-indigo-700">+{lesson.xpReward}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-center">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500 mx-auto mb-1" />
                <span className="block text-xs font-bold text-slate-600">Streak Active</span>
                <span className="font-heading font-black text-xl text-orange-600">{userStats.currentStreak} Days</span>
              </div>
            </div>

            <button
              id="lesson-finish-continue-btn"
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="w-full btn-3d-amber py-3.5 rounded-2xl text-white font-extrabold text-base shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              Continue Journey
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Active Question View */
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
            {/* Prompt Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {currentQ.ncdcTopic}
                </span>

                <div className="flex items-center gap-2">
                  {/* Read Aloud Button */}
                  <button
                    id="question-speak-btn"
                    onClick={() => handleSpeak(currentQ.prompt)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                    title="Listen to question"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Ask Kigozi AI Tutor Hint */}
                  <button
                    id="ask-kigozi-hint-btn"
                    onClick={handleGetAiHint}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask Kigozi</span>
                  </button>
                </div>
              </div>

              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 leading-snug">
                {currentQ.prompt}
              </h2>

              {currentQ.subtext && (
                <p className="text-xs sm:text-sm font-medium text-slate-500">
                  {currentQ.subtext}
                </p>
              )}
            </div>

            {/* Question Type: Multiple Choice */}
            {currentQ.type === 'multiple_choice' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      id={`opt-btn-${opt.id}`}
                      onClick={() => {
                        if (!isAnswerChecked) {
                          soundFx.playClick();
                          setSelectedOptionId(opt.id);
                        }
                      }}
                      disabled={isAnswerChecked}
                      className={`p-4 rounded-2xl border-2 text-left transition-all font-bold cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/80 text-amber-950 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-base">{opt.text}</span>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                      {opt.sublabel && (
                        <p className="text-xs text-slate-500 font-normal mt-1">{opt.sublabel}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Question Type: Drag & Drop / Tap to Pair */}
            {currentQ.type === 'drag_drop_match' && (
              <div className="space-y-4 pt-2">
                <p className="text-xs text-slate-500 font-medium">
                  Tap a concept on the left, then tap its matching definition on the right:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Left items */}
                  <div className="space-y-2.5">
                    {currentQ.pairs.map((pair) => {
                      const isPaired = !!matchedPairs[pair.left];
                      const isCurrentlySelected = selectedLeft === pair.left;
                      return (
                        <button
                          key={pair.id}
                          onClick={() => !isAnswerChecked && handleSelectLeft(pair.left)}
                          disabled={isAnswerChecked}
                          className={`w-full p-3.5 rounded-xl border-2 text-left font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                            isPaired
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                              : isCurrentlySelected
                              ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-300'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                          }`}
                        >
                          {pair.left}
                          {isPaired && <span className="text-[10px] block text-emerald-700">✓ Paired</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right items */}
                  <div className="space-y-2.5">
                    {currentQ.pairs.map((pair) => {
                      const isPaired = Object.values(matchedPairs).includes(pair.right);
                      return (
                        <button
                          key={pair.id}
                          onClick={() => !isAnswerChecked && handleSelectRight(pair.right)}
                          disabled={isAnswerChecked}
                          className={`w-full p-3.5 rounded-xl border-2 text-left font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                            isPaired
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {pair.right}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Question Type: Sentence Unscramble */}
            {currentQ.type === 'sentence_unscramble' && (
              <div className="space-y-6 pt-2">
                {/* Sentence drop tray */}
                <div className="min-h-[72px] p-3 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-wrap gap-2 items-center">
                  {selectedWords.length === 0 ? (
                    <span className="text-slate-400 text-xs sm:text-sm italic mx-auto">
                      Tap words below to arrange the sentence in correct order
                    </span>
                  ) : (
                    selectedWords.map((word, idx) => (
                      <button
                        key={idx}
                        onClick={() => !isAnswerChecked && handleRemoveWord(word, idx)}
                        disabled={isAnswerChecked}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 text-white font-bold text-sm shadow-xs hover:bg-amber-600 cursor-pointer active:scale-95 transition-transform"
                      >
                        {word}
                      </button>
                    ))
                  )}
                </div>

                {/* Available word bank */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {availableWords.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => !isAnswerChecked && handleAddWord(word, idx)}
                      disabled={isAnswerChecked}
                      className="px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 hover:border-amber-400 text-slate-800 font-bold text-sm shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question Type: Interactive Number / Currency Dial */}
            {currentQ.type === 'interactive_dial' && (
              <div className="space-y-6 pt-2 text-center">
                {/* Large Interactive Display */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 max-w-sm mx-auto">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Selected Value
                  </span>
                  <div className="font-heading font-black text-3xl sm:text-4xl text-slate-900 mt-1">
                    {dialValue.toLocaleString()} <span className="text-amber-600 text-2xl">{currentQ.unit}</span>
                  </div>
                </div>

                {/* Slider */}
                <div className="max-w-md mx-auto space-y-2">
                  <input
                    type="range"
                    min={currentQ.min}
                    max={currentQ.max}
                    step={currentQ.step}
                    value={dialValue}
                    onChange={(e) => {
                      if (!isAnswerChecked) {
                        setDialValue(parseFloat(e.target.value));
                      }
                    }}
                    disabled={isAnswerChecked}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>{currentQ.min} {currentQ.unit}</span>
                    <span>{currentQ.max.toLocaleString()} {currentQ.unit}</span>
                  </div>
                </div>

                {/* Quick Step Buttons */}
                <div className="flex items-center justify-center gap-2">
                  {[-currentQ.step * 2, -currentQ.step, currentQ.step, currentQ.step * 2].map((delta, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (!isAnswerChecked) {
                          soundFx.playClick();
                          setDialValue((prev) =>
                            Math.min(currentQ.max, Math.max(currentQ.min, prev + delta))
                          );
                        }
                      }}
                      disabled={isAnswerChecked}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question Type: Diagram Tap & Hotspots */}
            {currentQ.type === 'diagram_tap' && (
              <div className="space-y-4 pt-2">
                <div className="relative w-full max-w-md mx-auto aspect-4/3 bg-gradient-to-b from-sky-50 to-slate-100 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-inner p-4 flex items-center justify-center">
                  {/* Visual SVG Diagram Representation */}
                  {currentQ.diagramType === 'uganda_map' ? (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Outline of Uganda */}
                      <path
                        d="M 20 20 Q 50 10, 80 20 Q 90 50, 80 80 Q 50 90, 20 80 Q 10 50, 20 20 Z"
                        fill="#fef08a"
                        stroke="#ca8a04"
                        strokeWidth="1.5"
                      />
                      {/* Lake Victoria */}
                      <ellipse cx="65" cy="80" rx="18" ry="12" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                      {/* Lake Kyoga */}
                      <path d="M 50 45 Q 60 40, 65 48 Q 55 52, 50 45 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                      {/* Lake Albert */}
                      <ellipse cx="28" cy="45" rx="6" ry="14" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Digestive System abstract silhouette */}
                      <circle cx="50" cy="15" r="7" fill="#fed7aa" stroke="#ea580c" strokeWidth="1" />
                      <line x1="50" y1="22" x2="50" y2="35" stroke="#ea580c" strokeWidth="3" />
                      <ellipse cx="46" cy="42" rx="10" ry="7" fill="#fca5a5" stroke="#e11d48" strokeWidth="1" />
                      <ellipse cx="62" cy="38" rx="8" ry="6" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1" />
                      <path d="M 40 55 Q 50 65, 60 55 Q 50 75, 40 55" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
                    </svg>
                  )}

                  {/* Hotspots */}
                  {currentQ.hotspots.map((spot) => {
                    const isSelected = tappedHotspotId === spot.id;
                    return (
                      <button
                        key={spot.id}
                        id={`hotspot-${spot.id}`}
                        onClick={() => {
                          if (!isAnswerChecked) {
                            soundFx.playClick();
                            setTappedHotspotId(spot.id);
                          }
                        }}
                        disabled={isAnswerChecked}
                        style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-md transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-white ring-4 ring-amber-300 scale-110'
                            : 'bg-white/95 text-slate-800 hover:bg-slate-50 border border-slate-300'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span>{spot.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Tutor Hint Drawer / Modal */}
      {showHintModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900">
                    Kigozi&apos;s Socratic Hint
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    NCDC Study Companion
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowHintModal(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4">
              {isLoadingAi ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-600">
                    Kigozi is thinking of a relatable hint for you...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-slate-800 text-sm leading-relaxed whitespace-pre-line">
                    {aiHint}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSpeak(aiHint || '')}
                      className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      Listen to Hint
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                setShowHintModal(false);
              }}
              className="w-full btn-3d-amber py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer"
            >
              Got it, let me try!
            </button>
          </div>
        </div>
      )}

      {/* Bottom Action / Validation Bar */}
      {!isFinished && (
        <div
          className={`border-t py-4 px-4 sm:px-8 transition-colors duration-200 ${
            isAnswerChecked
              ? isCorrect
                ? 'bg-emerald-100 border-emerald-300'
                : 'bg-rose-100 border-rose-300'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            {isAnswerChecked ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {isCorrect ? <CheckCircle2 className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                </div>
                <div>
                  <h4
                    className={`font-heading font-black text-base ${
                      isCorrect ? 'text-emerald-950' : 'text-rose-950'
                    }`}
                  >
                    {isCorrect ? 'Oli Muzira! Excellent!' : 'Not quite right, scholar.'}
                  </h4>
                  <p
                    className={`text-xs font-medium max-w-md ${
                      isCorrect ? 'text-emerald-900' : 'text-rose-900'
                    }`}
                  >
                    {currentQ.explanation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="hidden sm:block text-xs font-semibold text-slate-600">
                Question {currentIndex + 1} of {lesson.questions.length}
              </div>
            )}

            <div className="w-full sm:w-auto">
              {isAnswerChecked ? (
                <button
                  id="lesson-continue-btn"
                  onClick={handleContinue}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm text-white shadow-md cursor-pointer transition-transform active:scale-95 ${
                    isCorrect ? 'btn-3d-emerald' : 'btn-3d-rose'
                  }`}
                >
                  Continue
                </button>
              ) : (
                <button
                  id="lesson-check-btn"
                  onClick={handleCheckAnswer}
                  className="w-full sm:w-auto btn-3d-amber px-8 py-3.5 rounded-2xl font-extrabold text-sm text-white shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  Check Answer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
