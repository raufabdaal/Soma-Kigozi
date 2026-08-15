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
  BookOpen
} from 'lucide-react';
import { soundFx } from '../services/soundEffects';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  userStats: UserStats;
  onComplete: (updatedStats: UserStats) => void;
  onClose?: () => void;
  isDevReopen?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  userStats,
  onComplete,
  onClose,
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
      activeSubjectId: 'sst', // P.7 Social Studies Pilot
    };

    onComplete(updated);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border-2 border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Progress Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                🇺🇬
              </div>
              <span className="font-heading font-black tracking-tight text-lg text-white">
                SOMA UGANDA
              </span>
            </div>
            {isDevReopen && onClose && (
              <button
                onClick={onClose}
                className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                Close (Dev Mode)
              </button>
            )}
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
            {step === 1 && 'Welcome to Soma'}
            {step === 2 && (selectedRole === 'student' ? 'Personalize Your Study Track' : 'Parent & PLE Target Setup')}
            {step === 3 && 'All Set for PLE Distinction!'}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            {step === 1 && 'Tell us how you are using the platform today to tailor your experience.'}
            {step === 2 && (selectedRole === 'student' ? 'Primary 7 Social Studies pilot with real NCDC content.' : 'Configure tracking, target school, and WhatsApp reports.')}
            {step === 3 && 'Your customized Ugandan curriculum track is ready.'}
          </p>

          {/* Stepper Dots */}
          <div className="flex gap-2 mt-4">
            <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'w-8 bg-emerald-400' : 'w-3 bg-slate-700'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'w-8 bg-emerald-400' : 'w-3 bg-slate-700'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? 'w-8 bg-emerald-400' : 'w-3 bg-slate-700'}`} />
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* ================= STEP 1: ROLE SELECTION ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                Who is learning or monitoring today?
              </span>

              <div className="grid grid-cols-1 gap-3">
                {/* Student Card */}
                <button
                  id="onboarding-select-student"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedRole('student');
                  }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-4 ${
                    selectedRole === 'student'
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    selectedRole === 'student' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-black text-base text-slate-900">
                        I am a Primary Pupil / Student
                      </h3>
                      {selectedRole === 'student' && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Learn through bite-sized interactive lessons, unlock badges, earn Enjuba Gems, and study with Kigozi AI tutor.
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      ★ Primary 7 Pilot Ready
                    </span>
                  </div>
                </button>

                {/* Parent Card */}
                <button
                  id="onboarding-select-parent"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedRole('parent');
                  }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-4 ${
                    selectedRole === 'parent'
                      ? 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    selectedRole === 'parent' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-black text-base text-slate-900">
                        I am a Parent / Guardian
                      </h3>
                      {selectedRole === 'parent' && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Monitor real-time NCDC mastery trajectory, track projected PLE division scores, and print weekly Spotify-style report cards.
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      Tutor ROI & Analytics
                    </span>
                  </div>
                </button>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  id="onboarding-next-btn-1"
                  onClick={handleNextFromRole}
                  className="btn-duo-green px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: STUDENT PROFILE SETUP ================= */}
          {step === 2 && selectedRole === 'student' && (
            <div className="space-y-5">
              {/* Student Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  What is your full name?
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Kato Derrick"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all"
                />
              </div>

              {/* Class Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Select Your Class:
                  </label>
                  <span className="text-[11px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Primary 7 (Flagship Pilot)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['P.4', 'P.5', 'P.6', 'P.7'] as GradeLevel[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setGradeLevel(g);
                      }}
                      className={`py-3 rounded-xl border-2 font-black text-xs transition-all cursor-pointer ${
                        gradeLevel === g
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {g} {g === 'P.7' && '★'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Learning Goal */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Daily Study Goal:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { mins: 5, label: 'Casual' },
                    { mins: 10, label: 'Regular' },
                    { mins: 15, label: 'Serious' },
                    { mins: 20, label: 'PLE Champ' },
                  ].map((item) => (
                    <button
                      key={item.mins}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setDailyMinutes(item.mins);
                      }}
                      className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        dailyMinutes === item.mins
                          ? 'border-amber-500 bg-amber-50 text-amber-950 font-black'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-black block">{item.mins} Mins</span>
                      <span className="text-[10px] text-slate-500 block">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-duo-white px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  id="student-onboarding-finish-btn"
                  onClick={handleFinishOnboarding}
                  className="btn-duo-green px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-2"
                >
                  Start Learning Now
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: PARENT PROFILE SETUP ================= */}
          {step === 2 && selectedRole === 'parent' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Child&apos;s Name:
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Namubiru Sarah"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Target Secondary School (Aspiration):
                </label>
                <select
                  value={targetSchool}
                  onChange={(e) => setTargetSchool(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                >
                  {secondarySchools.map((s) => (
                    <option key={s} value={s}>
                      {s} (Aggregate 4 - 8 Target)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Parent / Guardian WhatsApp for Weekly Reports:
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="+256 700 000 000"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                />
              </div>

              {/* Navigation buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-duo-white px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  id="parent-onboarding-finish-btn"
                  onClick={handleFinishOnboarding}
                  className="btn-duo-blue px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-2"
                >
                  Access Parent Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
