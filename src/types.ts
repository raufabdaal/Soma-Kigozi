export type GradeLevel = 'P.1' | 'P.2' | 'P.3' | 'P.4' | 'P.5' | 'P.6' | 'P.7';

export type SubjectId = 'sst' | 'math' | 'science' | 'english';

export type UserRole = 'student' | 'parent';

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  ncdcCode: string;
  iconName: string;
  themeColor: string; // Tailwind color name like 'amber', 'emerald', 'indigo', 'rose'
  badgeLabel?: string;
  description: string;
  pleWeight: string;
}

export type QuestionType =
  | 'multiple_choice'
  | 'drag_drop_match'
  | 'sentence_unscramble'
  | 'interactive_dial'
  | 'diagram_tap';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  subtext?: string;
  explanation: string;
  ncdcTopic: string;
  ugandanContext?: string; // e.g. "Matatu fare Kampala to Jinja"
  audioText?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: {
    id: string;
    text: string;
    icon?: string;
    sublabel?: string;
  }[];
  correctOptionId: string;
}

export interface DragDropQuestion extends BaseQuestion {
  type: 'drag_drop_match';
  pairs: {
    id: string;
    left: string;
    right: string;
  }[];
}

export interface SentenceUnscrambleQuestion extends BaseQuestion {
  type: 'sentence_unscramble';
  scrambledWords: string[];
  correctSentence: string;
}

export interface InteractiveDialQuestion extends BaseQuestion {
  type: 'interactive_dial';
  targetValue: number;
  unit: string; // e.g. "UGX", "%", "kg", "km/h"
  min: number;
  max: number;
  step: number;
  initialValue: number;
}

export interface DiagramTapQuestion extends BaseQuestion {
  type: 'diagram_tap';
  diagramTitle: string;
  diagramType: 'human_heart' | 'digestive_system' | 'plant_parts' | 'uganda_map' | 'water_cycle' | 'east_africa_rift';
  hotspots: {
    id: string;
    label: string;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    description: string;
  }[];
  targetHotspotId: string;
}

export type Question =
  | MultipleChoiceQuestion
  | DragDropQuestion
  | SentenceUnscrambleQuestion
  | InteractiveDialQuestion
  | DiagramTapQuestion;

export interface TeachSlide {
  id: string;
  title: string;
  conceptHeading: string;
  body: string;
  bullets?: string[];
  visualType?: 
    | 'east_africa_boundaries_map'
    | 'relief_regions_diagram'
    | 'mountain_types_diagram'
    | 'relief_rainfall_diagram'
    | 'plateau_schematic'
    | 'rift_valley_diagram' 
    | 'stevenson_screen_diagram'
    | 'climatic_zones_diagram'
    | 'vegetation_zones_diagram'
    | 'convectional_rainfall_cycle'
    | 'environmental_conservation_diagram'
    | 'river_terms_diagram'
    | 'nile_drainage_system'
    | 'types_of_lakes_diagram'
    | 'drainage_economic_problems'
    | 'population_density_formula'
    | 'population_distribution_map'
    | 'population_growth_diagram'
    | 'migration_types_diagram'
    | 'resources_classification_diagram'
    | 'east_africa_agriculture_diagram'
    | 'fishing_and_mining_diagram'
    | 'tourism_energy_trade_diagram'
    | 'map_elements_diagram'
    | 'lat_long_globe'
    | 'time_calc_schematic'
    | 'africa_location_schematic'
    | 'landlocked_ports_corridor'
    | 'nile_drainage_map' 
    | 'bantu_migration_map' 
    | 'independence_flag'
    | 'buganda_agreement'
    | 'eac_map'
    | 'currency_ugx'
    | 'human_heart';
  pleExamTip: string;
  realLifeUgandaExample: string;
  quickCheck?: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface LessonNode {
  id: string;
  unitId: string;
  title: string;
  subtitle: string;
  gradeLevel: GradeLevel;
  subjectId: SubjectId;
  ncdcStrand: string; // e.g. "Numbers & Operations", "Physical Features & Drainage"
  xpReward: number;
  gemsReward: number;
  teachSlides?: TeachSlide[];
  questions: Question[];
  isLocked?: boolean;
  isCompleted?: boolean;
  score?: number; // 0-100
  type: 'lesson' | 'checkpoint' | 'boss_ple' | 'interactive_lab';
}

export interface CurriculumUnit {
  id: string;
  title: string;
  unitNumber: number;
  term: 1 | 2 | 3;
  gradeLevel: GradeLevel;
  subjectId: SubjectId;
  description: string;
  bannerColor: string;
  themeGradient: string;
  accentColor: string;
  lessons: LessonNode[];
}

export interface UserStats {
  hasCompletedOnboarding: boolean;
  userRole: UserRole;
  studentName: string;
  parentName?: string;
  parentPhone?: string;
  targetSecondarySchool?: string;
  dailyGoalMinutes: number;
  gradeLevel: GradeLevel;
  activeSubjectId: SubjectId;
  currentStreak: number;
  highestStreak: number;
  streakFreezes: number;
  lastActiveDate: string; // YYYY-MM-DD
  enjubaGems: number; // currency
  hearts: number; // max 5
  maxHearts: number;
  totalXp: number;
  weeklyMinutes: number;
  baselineScore: number; // starting point (e.g. 42%)
  currentMastery: number; // current calculated average (e.g. 84%)
  projectedPleAggregate: number; // 4 to 36 (4 is perfect distinction 1)
  completedLessonIds: string[];
  lessonScores: Record<string, number>;
  weakTopics: string[];
  strongTopics: string[];
  badges: Badge[];
  downloadedPacks: string[]; // e.g. ["P.7-sst", "P.7-math"]
  isDataSaver: boolean;
  isOfflineMode: boolean;
  parentPin: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  target: number;
  current: number;
  xpReward: number;
  gemReward: number;
  isCompleted: boolean;
  iconName: string;
}
