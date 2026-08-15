import React, { useState } from 'react';
import { UserStats, UserRole, GradeLevel } from '../types';
import { 
  GraduationCap, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Flame, 
  Award, 
  School,
  Clock,
  BookOpen,
  Compass,
  ArrowLeft
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';
import confetti from 'canvas-confetti';

interface OnboardingScreenProps {
  userStats: UserStats;
  onComplete: (updatedStats: UserStats) => void;
  onBackToApp?: () => void;
  isDevReopen?: boolean;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  userStats,
  onComplete,
  onBackToApp,
  isDevReopen = false,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>(userStats.userRole || 'student');
  
  // Student form state
  const [studentName, setStudentName] = useState(userStats.studentName || 'Kato Brian');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(userStats.gradeLevel || 'P.7');
  const [dailyMinutes, setDailyMinutes] = useState(userStats.dailyGoalMinutes || 15);
  const [baselineScore, setBaselineScore] = useState(userStats.baselineScore || 45);

  // Parent form state
  const [parentName, setParentName] = useState(userStats.parentName || 'Mr. & Mrs. Mukasa');
  const [parentPhone, setParentPhone] = useState(userStats.parentPhone || '+256 701 234 567');
  const [targetSchool, setTargetSchool] = useState(userStats.targetSecondarySchool || "King's College Budo");

  const secondarySchools = [
    "King's College Budo",
    "Mt. St. Mary's Namagunga",
    "Gayaza High School",
    "St. Mary's Kitende",
    "Namilyango College",
    "Uganda Martyrs SS Namugongo",
    "Kigezi High School",
    "Ndejje Senior Secondary School",
  ];

  const handleNextFromRole = () => {
    soundFx.playClick();
    setStep(2);
  };

  const handleFinishOnboarding = () => {
    soundFx.playFanfare();
    confetti({ particleCount: 90, spread: 70 });

    const updated: UserStats = {
      ...userStats,
      hasCompletedOnboarding: true,
      userRole: selectedRole,
      studentName: studentName.trim() || 'Kato Brian',
      gradeLevel: gradeLevel,
      dailyGoalMinutes: dailyMinutes,
      baselineScore: baselineScore,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      targetSecondarySchool: targetSchool,
      activeSubjectId: 'sst', // P.7 Social Studies Flagship Pilot
    };

    onComplete(updated);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] flex flex-col justify-between py-6 px-4 sm:px-6">
      
      {/* Top Header & Progress */}
      <div className="max-w-xl mx-auto w-full">
        <div className="flex items-center justify-between gap-4 mb-4">
          {step > 1 ? (
            <button
              onClick={() => {
                soundFx.playClick();
                setStep((prev) => (prev - 1) as 1 | 2);
              }}
              className="p-2 rounded-2xl hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : isDevReopen && onBackToApp ? (
            <button
              onClick={onBackToApp}
              className="p-2 rounded-2xl hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer text-xs font-black"
            >
              Cancel
            </button>
          ) : (
            <div className="w-8" />
          )}

          {/* Stepper Dots */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-8 bg-blue-500'
                    : step > s
                    ? 'w-2.5 bg-emerald-500'
                    : 'w-2.5 bg-slate-300'
                }`}
              />
            ))}
          </div>

          <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Step {step} of 3
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-xl mx-auto w-full my-auto py-4">
        
        {/* STEP 1: Select User Role */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                Primary Education Uganda
              </span>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900">
                Who is using the app?
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto font-medium">
                Personalized for Ugandan Primary Candidates (PLE) & Guardians
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student Role Card */}
              <button
                id="role-select-student-btn"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedRole('student');
                }}
                className={`p-6 rounded-3xl border-3 text-left transition-all cursor-pointer flex flex-col justify-between h-56 ${
                  selectedRole === 'student'
                    ? 'border-blue-500 bg-blue-50/70 shadow-lg shadow-blue-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md">
                  <GraduationCap className="w-6 h-6 stroke-[2.5]" />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-black text-lg text-slate-900">
                      I am a Student
                    </h3>
                    {selectedRole === 'student' && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                    Interactive NCDC learning trail, speed drills, XP, and gems.
                  </p>
                </div>
              </button>

              {/* Parent Role Card */}
              <button
                id="role-select-parent-btn"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedRole('parent');
                }}
                className={`p-6 rounded-3xl border-3 text-left transition-all cursor-pointer flex flex-col justify-between h-56 ${
                  selectedRole === 'parent'
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 stroke-[2.5]" />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-black text-lg text-slate-900">
                      I am a Parent
                    </h3>
                    {selectedRole === 'parent' && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                    Track child&apos;s PLE aggregate projection, study minutes, & tutor savings.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Configure Class / Details */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <h2 className="font-heading font-black text-2xl text-slate-900">
                {selectedRole === 'student' ? 'Student Profile' : 'Parent & Child Setup'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {selectedRole === 'student'
                  ? 'Set your target primary grade & candidate details'
                  : 'Set your child’s candidate info and dream secondary school'}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Candidate / Pupil Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Kato Brian"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Primary Class Level
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {(['P.1', 'P.2', 'P.3', 'P.4', 'P.5', 'P.6', 'P.7'] as GradeLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setGradeLevel(lvl);
                      }}
                      className={`py-2.5 rounded-xl font-heading font-black text-xs transition-all cursor-pointer ${
                        gradeLevel === lvl
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                {gradeLevel === 'P.7' && (
                  <span className="text-[11px] font-bold text-emerald-600 mt-1.5 block">
                    ★ Primary 7 Flagship Pilot (NCDC Full Syllabus Active)
                  </span>
                )}
              </div>

              {selectedRole === 'parent' && (
                <>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="e.g. Mr. Mukasa"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Target Dream Secondary School
                    </label>
                    <select
                      value={targetSchool}
                      onChange={(e) => setTargetSchool(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      {secondarySchools.map((sch) => (
                        <option key={sch} value={sch}>
                          {sch}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Study Goals & Calibration */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <h2 className="font-heading font-black text-2xl text-slate-900">
                Daily Study Habit
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Consistent 10-15 minutes daily guarantees Division 1 in UNEB PLE
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Daily Study Goal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[5, 10, 15, 20].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setDailyMinutes(mins);
                      }}
                      className={`p-3 rounded-2xl text-center border-2 transition-all cursor-pointer ${
                        dailyMinutes === mins
                          ? 'border-amber-500 bg-amber-50 text-amber-950 font-black shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-bold'
                      }`}
                    >
                      <span className="font-heading text-lg block">{mins}m</span>
                      <span className="text-[10px] opacity-75">per day</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Current Baseline Score Estimate
                  </label>
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {baselineScore}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={baselineScore}
                  onChange={(e) => setBaselineScore(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                  <span>Needs Support (30%)</span>
                  <span>Average (55%)</span>
                  <span>Distinction (80%+)</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="max-w-xl mx-auto w-full pt-4">
        {step === 1 && (
          <button
            id="onboarding-step1-next-btn"
            onClick={handleNextFromRole}
            className="btn-duo-blue w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {step === 2 && (
          <button
            id="onboarding-step2-next-btn"
            onClick={() => {
              soundFx.playClick();
              setStep(3);
            }}
            className="btn-duo-blue w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            Set Study Goals
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {step === 3 && (
          <button
            id="onboarding-finish-btn"
            onClick={handleFinishOnboarding}
            className="btn-duo-green w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            Start Learning Trail
            <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
};
