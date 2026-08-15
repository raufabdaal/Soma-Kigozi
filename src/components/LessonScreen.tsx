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
  const [checkedBullets, setCheckedBullets] = useState<Record<string, boolean>>({});

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

  // Toggle bullet checklist item
  const toggleCheckBullet = (bulletIndex: number) => {
    soundFx.playClick();
    const key = `${teachSlideIndex}-${bulletIndex}`;
    setCheckedBullets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
  // RICH TEXT FORMATTER (PARSES **BOLD** AND *ITALIC* CLEANLY)
  // -------------------------------------------------------------
  const renderFormattedBody = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2.5 text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={lineIdx} className="h-1" />;
          }

          // Check if line is a bullet item (* or - or •)
          const isBullet = /^[*\-•]\s+/.test(trimmed);
          const isNumbered = /^\d+\.\s+/.test(trimmed);
          const textContent = isBullet 
            ? trimmed.replace(/^[*\-•]\s+/, '') 
            : isNumbered 
            ? trimmed.replace(/^\d+\.\s+/, '') 
            : trimmed;

          // Parse bold and italics inside textContent
          const parseInline = (text: string) => {
            const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
            return parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                const inner = part.slice(2, -2);
                return (
                  <strong key={pIdx} className="font-black text-slate-950">
                    {inner}
                  </strong>
                );
              }
              if (part.startsWith('*') && part.endsWith('*')) {
                const inner = part.slice(1, -1);
                return (
                  <em key={pIdx} className="italic text-slate-800 font-semibold">
                    {inner}
                  </em>
                );
              }
              return part;
            });
          };

          if (isBullet) {
            return (
              <div key={lineIdx} className="flex items-start gap-2.5 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                <div className="flex-1 text-slate-800">{parseInline(textContent)}</div>
              </div>
            );
          }

          if (isNumbered) {
            const numberMatch = trimmed.match(/^(\d+)\.\s+/);
            const num = numberMatch ? numberMatch[1] : '1';
            return (
              <div key={lineIdx} className="flex items-start gap-2.5 pl-1">
                <span className="text-[11px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded mt-0.5 shrink-0">
                  {num}
                </span>
                <div className="flex-1 text-slate-800">{parseInline(textContent)}</div>
              </div>
            );
          }

          return (
            <p key={lineIdx} className="text-slate-800">
              {parseInline(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // -------------------------------------------------------------
  // VISUAL SCHEMATIC RENDERER (CLEAN VECTOR ELEMENTS)
  // -------------------------------------------------------------
  const renderVisualSchematic = (type?: string) => {
    if (type === 'east_africa_boundaries_map') {
      return (
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-blue-950">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              East Africa Boundaries & Coordinates
            </span>
            <span className="text-[10px] bg-blue-200 text-blue-950 font-black px-2 py-0.5 rounded-md">
              4°N - 12°S | 29°E - 41°E
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
            <div className="p-2 rounded-xl bg-white border border-blue-100 text-slate-900 shadow-2xs">
              <span className="block text-blue-600 text-[10px] uppercase font-black">North</span>
              South Sudan & Ethiopia
            </div>
            <div className="p-2 rounded-xl bg-white border border-blue-100 text-slate-900 shadow-2xs">
              <span className="block text-blue-600 text-[10px] uppercase font-black">South</span>
              Zambia, Malawi, Mozambique
            </div>
            <div className="p-2 rounded-xl bg-white border border-blue-100 text-slate-900 shadow-2xs">
              <span className="block text-blue-600 text-[10px] uppercase font-black">East</span>
              Indian Ocean
            </div>
            <div className="p-2 rounded-xl bg-white border border-blue-100 text-slate-900 shadow-2xs">
              <span className="block text-blue-600 text-[10px] uppercase font-black">West</span>
              DRC
            </div>
          </div>
        </div>
      );
    }

    if (type === 'relief_regions_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-emerald-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              The 4 Main Relief Regions of East Africa
            </span>
            <span className="text-[10px] bg-emerald-200 text-emerald-950 font-black px-2 py-0.5 rounded-md">
              Landscape Types
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-semibold">
            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 text-slate-900 shadow-2xs">
              <span className="block text-emerald-700 font-black text-[11px]">1. Coastal Plains</span>
              <span className="text-[10px] text-slate-500">Low flat coastal belt</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 text-slate-900 shadow-2xs">
              <span className="block text-emerald-700 font-black text-[11px]">2. The Plateau</span>
              <span className="text-[10px] text-slate-500">Elevated backbone</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 text-slate-900 shadow-2xs">
              <span className="block text-emerald-700 font-black text-[11px]">3. Rift Valleys</span>
              <span className="text-[10px] text-slate-500">Deep fault troughs</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 text-slate-900 shadow-2xs">
              <span className="block text-emerald-700 font-black text-[11px]">4. Mountains</span>
              <span className="text-[10px] text-slate-500">High volcanic & horst</span>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'mountain_types_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-amber-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Types of Mountains & Major Peaks
            </span>
            <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-md">
              Syllabus Summary
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium">
            <div className="p-2.5 rounded-xl bg-white border border-amber-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-amber-800 text-[11px] block">1. Volcanic Mountains</span>
              <p className="text-[11px] text-slate-600"><strong>Mt. Kilimanjaro:</strong> Uhuru Peak</p>
              <p className="text-[11px] text-slate-600"><strong>Mt. Kenya:</strong> Batian & Nelion</p>
              <p className="text-[11px] text-slate-600"><strong>Mt. Elgon:</strong> Wagagai</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-amber-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-amber-800 text-[11px] block">2. Block (Horst)</span>
              <p className="text-[11px] text-slate-600"><strong>Mt. Rwenzori:</strong> Margherita Peak</p>
              <p className="text-[11px] text-slate-600">Formed by faulting / tension forces. Snow-capped summit.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-amber-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-amber-800 text-[11px] block">3. Fold Mountains</span>
              <p className="text-[11px] text-slate-600"><strong>Cape Ranges</strong> (South Africa)</p>
              <p className="text-[11px] text-slate-600">Formed by compression forces bending rock layers.</p>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'relief_rainfall_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-sky-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Relief (Orographic) Rainfall Mechanics
            </span>
            <span className="text-[10px] bg-sky-200 text-sky-950 font-black px-2 py-0.5 rounded-md">
              Windward vs Leeward
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
            <div className="p-2.5 rounded-xl bg-white border border-sky-100 text-slate-900 shadow-2xs">
              <span className="block text-sky-700 font-black text-[11px]">Windward Side</span>
              <span className="text-[10px] text-slate-600 font-medium">Moist air rises, cools & condenses ➔ Heavy relief rainfall & lush vegetation.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-amber-100 text-slate-900 shadow-2xs">
              <span className="block text-amber-700 font-black text-[11px]">Leeward Side (Rain Shadow)</span>
              <span className="text-[10px] text-slate-600 font-medium">Dry descending winds ➔ Little or no rain (semi-arid grazing land).</span>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'rift_valley_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-indigo-950">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              The Great Rift Valley: Eastern vs Western Arms
            </span>
            <span className="text-[10px] bg-indigo-200 text-indigo-950 font-black px-2 py-0.5 rounded-md">
              Tension Faulting
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
            <div className="p-2.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
              <span className="font-black text-indigo-900 text-[11px] block">Eastern Arm (Kenya)</span>
              <p className="text-[10px] text-slate-600">Lakes Naivasha, Nakuru, Turkana, Magadi (soda ash) & Mt. Longonot.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-indigo-100 shadow-2xs">
              <span className="font-black text-indigo-900 text-[11px] block">Western Arm (Uganda & Tanzania)</span>
              <p className="text-[10px] text-slate-600">Lakes Albert, Edward, George, Tanganyika (deepest) & Lake Katwe (salt).</p>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'plateau_schematic') {
      return (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-amber-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              The East African Plateau (Tableland)
            </span>
            <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-md">
              Economic Activities
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-semibold">
            <div className="p-2 rounded-xl bg-white border border-amber-100 text-slate-900 shadow-2xs">
              <span className="block text-amber-700 font-black text-[11px]">Mixed Farming</span>
              Crops & animals
            </div>
            <div className="p-2 rounded-xl bg-white border border-amber-100 text-slate-900 shadow-2xs">
              <span className="block text-amber-700 font-black text-[11px]">Livestock</span>
              Pastoral cattle
            </div>
            <div className="p-2 rounded-xl bg-white border border-amber-100 text-slate-900 shadow-2xs">
              <span className="block text-amber-700 font-black text-[11px]">Settlements</span>
              Cities & towns
            </div>
            <div className="p-2 rounded-xl bg-white border border-amber-100 text-slate-900 shadow-2xs">
              <span className="block text-amber-700 font-black text-[11px]">Transport</span>
              Roads & railways
            </div>
          </div>
        </div>
      );
    }

    if (type === 'stevenson_screen_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-sky-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Stevenson Screen & Weather Station Architecture
            </span>
            <span className="text-[10px] bg-sky-200 text-sky-950 font-black px-2 py-0.5 rounded-md">
              PLE High-Yield
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium">
            <div className="p-2.5 rounded-xl bg-white border border-sky-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-sky-800 text-[11px] block">1. Painted White</span>
              <p className="text-[11px] text-slate-600">Reflects direct sun rays so the interior does not overheat.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-sky-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-sky-800 text-[11px] block">2. Louvers (Slits)</span>
              <p className="text-[11px] text-slate-600">Allows free circulation and ventilation of air through the box.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-sky-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-sky-800 text-[11px] block">3. Raised on Legs</span>
              <p className="text-[11px] text-slate-600">Prevents terrestrial ground heat from distorting readings.</p>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-sky-100/70 border border-sky-200 text-[11px] text-sky-900 font-bold flex justify-between items-center">
            <span>Inside: Max & Min Thermometer, Hygrometer</span>
            <span className="text-[10px] font-semibold text-slate-600">Outside: Rain Gauge (in open space), Wind Vane, Anemometer</span>
          </div>
        </div>
      );
    }

    if (type === 'climatic_zones_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-emerald-950">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              The 5 Climatic Zones of East Africa
            </span>
            <span className="text-[10px] bg-emerald-200 text-emerald-950 font-black px-2 py-0.5 rounded-md">
              Regional Patterns
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-semibold">
            <div className="p-2 rounded-xl bg-white border border-emerald-100 text-slate-900 shadow-2xs">
              <span className="block text-emerald-700 font-black text-[11px]">1. Equatorial</span>
              <span className="text-[10px] text-slate-500">Lake Victoria Basin (Double Maxima)</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-emerald-100 text-slate-900 shadow-2xs">
              <span className="block text-emerald-700 font-black text-[11px]">2. Tropical</span>
              <span className="text-[10px] text-slate-500">Savannah Plateau (Largest Area)</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-emerald-100 text-slate-900 shadow-2xs">
              <span className="block text-emerald-700 font-black text-[11px]">3. Semi-Arid</span>
              <span className="text-[10px] text-slate-500">Karamoja & Turkana (&lt;500mm)</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-emerald-100 text-slate-900 shadow-2xs">
              <span className="block text-emerald-700 font-black text-[11px]">4. Mountain</span>
              <span className="text-[10px] text-slate-500">Alpine Peaks (Snow & Relief Rain)</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-emerald-100 text-slate-900 shadow-2xs">
              <span className="block text-emerald-700 font-black text-[11px]">5. Maritime</span>
              <span className="text-[10px] text-slate-500">Coastal Strip (Mombasa & Dar)</span>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'vegetation_zones_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-teal-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Types of Natural Vegetation in East Africa
            </span>
            <span className="text-[10px] bg-teal-200 text-teal-950 font-black px-2 py-0.5 rounded-md">
              Flora Zonation
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium">
            <div className="p-2.5 rounded-xl bg-white border border-teal-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-teal-800 text-[11px] block">1. Tropical Rainforests</span>
              <p className="text-[11px] text-slate-600">Evergreen, thick canopy, climbing lianas. (Mabira, Budongo, Bwindi).</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-teal-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-teal-800 text-[11px] block">2. Savannah (Most Common)</span>
              <p className="text-[11px] text-slate-600">Tall/short grass with scattered acacia & baobab trees. Wildlife habitat.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-teal-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-teal-800 text-[11px] block">3. Semi-Arid & Swamps</span>
              <p className="text-[11px] text-slate-600">Thorny scrub (Karamoja), river papyrus reeds, and coastal salty mangroves.</p>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'convectional_rainfall_cycle') {
      return (
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-blue-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              5 Steps of Convectional Rainfall Formation
            </span>
            <span className="text-[10px] bg-blue-200 text-blue-950 font-black px-2 py-0.5 rounded-md">
              Lake Victoria Basin
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-bold">
            <div className="p-2 rounded-xl bg-white border border-blue-100 text-slate-900 shadow-2xs">
              <span className="block text-blue-700 text-[10px] uppercase font-black">Step 1</span>
              Heating of ground
            </div>
            <div className="p-2 rounded-xl bg-white border border-blue-100 text-slate-900 shadow-2xs">
              <span className="block text-blue-700 text-[10px] uppercase font-black">Step 2</span>
              Evaporation of water
            </div>
            <div className="p-2 rounded-xl bg-white border border-blue-100 text-slate-900 shadow-2xs">
              <span className="block text-blue-700 text-[10px] uppercase font-black">Step 3</span>
              Condensation
            </div>
            <div className="p-2 rounded-xl bg-white border border-blue-100 text-slate-900 shadow-2xs">
              <span className="block text-blue-700 text-[10px] uppercase font-black">Step 4</span>
              Cloud formation
            </div>
            <div className="p-2 rounded-xl bg-white border border-blue-100 text-slate-900 shadow-2xs">
              <span className="block text-blue-700 text-[10px] uppercase font-black">Step 5</span>
              Falling of rain
            </div>
          </div>
        </div>
      );
    }

    if (type === 'environmental_conservation_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-amber-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Environmental Destruction vs. Conservation Solutions
            </span>
            <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-md">
              NCDC Action Guide
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
            <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1">
              <span className="font-black text-rose-800 text-[11px] block">Causes of Destruction:</span>
              <p className="text-[11px] text-slate-700">• Deforestation (charcoal & timber)</p>
              <p className="text-[11px] text-slate-700">• Swamp drainage (farming & construction)</p>
              <p className="text-[11px] text-slate-700">• Overgrazing & Bush burning</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
              <span className="font-black text-emerald-800 text-[11px] block">Conservation Measures:</span>
              <p className="text-[11px] text-slate-700">• <strong>Afforestation:</strong> Planting in new areas</p>
              <p className="text-[11px] text-slate-700">• <strong>Reforestation:</strong> Replacing cut trees</p>
              <p className="text-[11px] text-slate-700">• <strong>Solar & Biogas:</strong> Alternative clean energy</p>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'river_terms_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-blue-950">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              Key River & Drainage Terminology
            </span>
            <span className="text-[10px] bg-blue-200 text-blue-950 font-black px-2 py-0.5 rounded-md">
              Hydrology Fundamentals
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
            <div className="p-2 rounded-xl bg-white border border-blue-100 text-slate-900 shadow-2xs">
              <span className="block text-blue-700 font-black text-[11px]">1. Source</span>
              <span className="text-[10px] text-slate-500">Where river begins (lake/spring)</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-blue-100 text-slate-900 shadow-2xs">
              <span className="block text-blue-700 font-black text-[11px]">2. Tributary</span>
              <span className="text-[10px] text-slate-500">Small river feeding into main river</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-blue-100 text-slate-900 shadow-2xs">
              <span className="block text-blue-700 font-black text-[11px]">3. Confluence</span>
              <span className="text-[10px] text-slate-500">Meeting point of two rivers</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-blue-100 text-slate-900 shadow-2xs">
              <span className="block text-blue-700 font-black text-[11px]">4. Delta / Mouth</span>
              <span className="text-[10px] text-slate-500">Silt deposit & river exit into sea</span>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'nile_drainage_system') {
      return (
        <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-cyan-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              The River Nile System & Power Dams
            </span>
            <span className="text-[10px] bg-cyan-200 text-cyan-950 font-black px-2 py-0.5 rounded-md">
              Longest River in the World
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium">
            <div className="p-2.5 rounded-xl bg-white border border-cyan-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-cyan-800 text-[11px] block">White Nile (Uganda)</span>
              <p className="text-[11px] text-slate-600">Source: <strong>Lake Victoria at Jinja</strong>. Flows north through South Sudan.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-cyan-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-cyan-800 text-[11px] block">Blue Nile (Ethiopia)</span>
              <p className="text-[11px] text-slate-600">Source: <strong>Lake Tana</strong>. Carries volcanic silt. Joins White Nile at <strong>Khartoum</strong>.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-cyan-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-cyan-800 text-[11px] block">Hydro-Electric Dams</span>
              <p className="text-[11px] text-slate-600">Nalubaale, Kiira, Bujagali, Isimba & Karuma (Uganda); Aswan High Dam (Egypt).</p>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'types_of_lakes_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-indigo-950">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              Classification of Lakes in East Africa
            </span>
            <span className="text-[10px] bg-indigo-200 text-indigo-950 font-black px-2 py-0.5 rounded-md">
              Formation Modes
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-medium">
            <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-indigo-800 text-[11px] block">1. Depression (Downwarping)</span>
              <p className="text-[11px] text-slate-600"><strong>Lake Victoria</strong> (Wide, shallow, crustal sagging basin), Lake Kyoga.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-indigo-800 text-[11px] block">2. Rift Valley (Fault)</span>
              <p className="text-[11px] text-slate-600"><strong>Lake Tanganyika</strong> (deepest in Africa), Albert, Edward, Turkana.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-indigo-800 text-[11px] block">3. Volcanic Lakes</span>
              <p className="text-[11px] text-slate-600"><strong>Crater:</strong> Lake Katwe (salt mining).<br/><strong>Lava-dammed:</strong> Lake Bunyonyi, Mutanda.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-indigo-800 text-[11px] block">4. Man-made / Ox-Bow</span>
              <p className="text-[11px] text-slate-600"><strong>Reservoirs:</strong> Kindaruma, Kariba, Nasser.<br/><strong>Ox-Bow:</strong> Cut-off river meanders.</p>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'drainage_economic_problems') {
      return (
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-teal-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Economic Benefits vs. Water Body Challenges
            </span>
            <span className="text-[10px] bg-teal-200 text-teal-950 font-black px-2 py-0.5 rounded-md">
              East African Hydrology
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
              <span className="font-black text-emerald-800 text-[11px] block">Economic Benefits:</span>
              <p className="text-[11px] text-slate-700">• Fishing (Tilapia & Nile Perch)</p>
              <p className="text-[11px] text-slate-700">• Hydro-Electric Power (Nalubaale, Karuma)</p>
              <p className="text-[11px] text-slate-700">• Mineral mining (Salt at Katwe, Soda ash at Magadi)</p>
              <p className="text-[11px] text-slate-700">• Water transport & Irrigation</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1">
              <span className="font-black text-rose-800 text-[11px] block">Problems & Hazards:</span>
              <p className="text-[11px] text-slate-700">• <strong>Water weeds:</strong> Water hyacinth chokes ports</p>
              <p className="text-[11px] text-slate-700">• <strong>Water-borne diseases:</strong> Bilharzia, malaria</p>
              <p className="text-[11px] text-slate-700">• <strong>Siltation & Floods:</strong> Bursting river banks</p>
              <p className="text-[11px] text-slate-700">• Drowning accidents from overloaded boats</p>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'population_density_formula') {
      return (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-amber-950">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-600" />
              Calculating Population Density & Census
            </span>
            <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-md">
              Demographic Mathematics
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-amber-200 text-center shadow-2xs">
            <p className="text-xs text-slate-500 font-semibold mb-1">Standard UNEB Formula:</p>
            <div className="inline-block px-4 py-2 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-950 font-black text-sm sm:text-base">
              Population Density = <span className="underline">Total Population</span> ÷ Total Land Area (km²)
            </div>
            <p className="text-[11px] text-slate-600 mt-2">
              <strong>Example:</strong> If a district has 500,000 people and covers 2,000 km²: <br/>
              <span className="text-amber-800 font-bold">500,000 ÷ 2,000 = 250 people per km²</span>
            </p>
          </div>
        </div>
      );
    }

    if (type === 'population_distribution_map') {
      return (
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-indigo-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Population Distribution Patterns in East Africa
            </span>
            <span className="text-[10px] bg-indigo-200 text-indigo-950 font-black px-2 py-0.5 rounded-md">
              High vs. Low Density
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="font-black text-emerald-800 text-[11px] block">Densely Populated Areas:</span>
              <p className="text-[11px] text-slate-700">• <strong>Mt. Elgon & Kigezi Highlands:</strong> Volcanic soils, heavy rain</p>
              <p className="text-[11px] text-slate-700">• <strong>Lake Victoria Basin & Buganda:</strong> Fertile, trade, ports</p>
              <p className="text-[11px] text-slate-700">• <strong>Capital Cities:</strong> Kampala, Nairobi, Dar es Salaam (Jobs & services)</p>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 space-y-1">
              <span className="font-black text-orange-800 text-[11px] block">Sparsely Populated Areas:</span>
              <p className="text-[11px] text-slate-700">• <strong>Karamoja & Turkana:</strong> Semi-arid, prolonged droughts</p>
              <p className="text-[11px] text-slate-700">• <strong>Miombo Woodlands (Tanzania):</strong> Tsetse fly infestation</p>
              <p className="text-[11px] text-slate-700">• <strong>Gazetted Game Parks:</strong> Protected wildlife reserves</p>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'population_growth_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-purple-950">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-purple-600" />
              Population Growth: Drivers & Overpopulation Impact
            </span>
            <span className="text-[10px] bg-purple-200 text-purple-950 font-black px-2 py-0.5 rounded-md">
              Demographic Dynamics
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium">
            <div className="p-2.5 rounded-xl bg-white border border-purple-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-purple-800 text-[11px] block">Growth Drivers</span>
              <p className="text-[11px] text-slate-600">• High Birth Rate (fertility)</p>
              <p className="text-[11px] text-slate-600">• Declining Death Rate (medicine/immunization)</p>
              <p className="text-[11px] text-slate-600">• Net Immigration</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-purple-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-purple-800 text-[11px] block">Advantages (Benefits)</span>
              <p className="text-[11px] text-slate-600">• Large labor force for work</p>
              <p className="text-[11px] text-slate-600">• Big market for goods</p>
              <p className="text-[11px] text-slate-600">• Increased tax base for services</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-purple-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-purple-800 text-[11px] block">Overpopulation Problems</span>
              <p className="text-[11px] text-slate-600">• Land fragmentation & slums</p>
              <p className="text-[11px] text-slate-600">• Pressure on schools & hospitals</p>
              <p className="text-[11px] text-slate-600">• High unemployment & crime</p>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'migration_types_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-cyan-950">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              Types of Human Migration & Solutions
            </span>
            <span className="text-[10px] bg-cyan-200 text-cyan-950 font-black px-2 py-0.5 rounded-md">
              Population Movement
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
            <div className="p-2.5 rounded-xl bg-white border border-cyan-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-cyan-800 text-[11px] block">1. Internal Migration</span>
              <p className="text-[11px] text-slate-600">• <strong>Rural-Urban:</strong> Village to town (jobs, education, modern life)</p>
              <p className="text-[11px] text-slate-600">• <strong>Rural-Rural:</strong> Village to village (fertile land, plantation labor)</p>
              <p className="text-[11px] text-slate-600">• <strong>Urban-Rural:</strong> Returning from town to village</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-cyan-100 text-slate-900 shadow-2xs space-y-1">
              <span className="font-black text-cyan-800 text-[11px] block">2. Solutions to Rural-Urban Rush</span>
              <p className="text-[11px] text-slate-600">• <strong>Rural Electrification:</strong> Powers small village businesses</p>
              <p className="text-[11px] text-slate-600">• <strong>Upcountry Social Services:</strong> Good schools & referral hospitals</p>
              <p className="text-[11px] text-slate-600">• <strong>Decentralization:</strong> Distributing industries & government offices</p>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'map_elements_diagram') {
      return (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-amber-950">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-600" />
              5 Essential Elements of a Good Map
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center text-xs font-bold">
            <div className="p-2 rounded-lg bg-white border border-amber-100 text-slate-900">Title</div>
            <div className="p-2 rounded-lg bg-white border border-amber-100 text-slate-900">Key</div>
            <div className="p-2 rounded-lg bg-white border border-amber-100 text-slate-900">Scale</div>
            <div className="p-2 rounded-lg bg-white border border-amber-100 text-slate-900">Compass</div>
            <div className="p-2 rounded-lg bg-white border border-amber-100 text-slate-900 col-span-2 sm:col-span-1">Frame</div>
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
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
              <span className="text-blue-600 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Concept {teachSlideIndex + 1} of {teachSlides.length}
              </span>
              <span className="text-slate-400 font-bold">
                {lesson.title}
              </span>
            </div>

            <div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 leading-tight">
                {currentSlide.conceptHeading}
              </h1>
              <div className="mt-4">
                {renderFormattedBody(currentSlide.body)}
              </div>
            </div>

            {/* Visual Diagram */}
            {renderVisualSchematic(currentSlide.visualType)}

            {/* Interactive Concept Mastery Checklist */}
            {currentSlide.bullets && currentSlide.bullets.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Key Concepts to Master (Tap to check off)
                  </span>
                  <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                    {currentSlide.bullets.filter((_, idx) => checkedBullets[`${teachSlideIndex}-${idx}`]).length} / {currentSlide.bullets.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {currentSlide.bullets.map((bullet, bIdx) => {
                    const isChecked = checkedBullets[`${teachSlideIndex}-${bIdx}`] || false;
                    return (
                      <button
                        key={bIdx}
                        type="button"
                        onClick={() => toggleCheckBullet(bIdx)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-2xs'
                            : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                            isChecked
                              ? 'bg-emerald-500 border-emerald-600 text-white'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className={`text-xs sm:text-sm flex-1 ${isChecked ? 'text-slate-900 font-bold' : 'text-slate-800 font-semibold'}`}>
                          {bullet}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PLE Exam Tip Box (Clean & Unobtrusive) */}
            {currentSlide.pleExamTip && (
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300/80 flex items-start gap-2.5 shadow-2xs">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                    PLE Examination Tip
                  </span>
                  <p className="text-xs sm:text-sm text-amber-950 font-bold leading-snug">
                    {currentSlide.pleExamTip}
                  </p>
                </div>
              </div>
            )}

            {/* Micro Checkpoint */}
            {currentSlide.quickCheck && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider block">
                  Quick Understanding Check
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
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
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          !teachMicroChecked
                            ? isSelected
                              ? 'border-blue-500 bg-white text-blue-950 shadow-2xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                            : isCorrectOption
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-black'
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
                  <p className="text-xs font-bold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
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
