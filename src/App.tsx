import React, { useState } from 'react';
import { UserStats, LessonNode, SubjectId } from './types';
import { CURRICULUM_UNITS } from './data/curriculumData';
import { loadUserStats, saveUserStats } from './services/storageService';
import { Navbar } from './components/Navbar';
import { HamburgerDrawer } from './components/HamburgerDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { StudentHome } from './components/StudentHome';
import { LessonModal } from './components/LessonModal';
import { ParentPortal } from './components/ParentPortal';
import { OfflineManager } from './components/OfflineManager';
import { PracticeArena } from './components/PracticeArena';
import { KigoziAIChat } from './components/KigoziAIChat';

export default function App() {
  const [userStats, setUserStats] = useState<UserStats>(() => loadUserStats());
  const [activeTab, setActiveTab] = useState<'study' | 'practice' | 'parent' | 'offline'>('study');
  const [activeSubject, setActiveSubject] = useState<SubjectId>(userStats.activeSubjectId || 'sst');
  const [activeLesson, setActiveLesson] = useState<LessonNode | null>(null);
  const [showKigoziChat, setShowKigoziChat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Drawer and Onboarding states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!userStats.hasCompletedOnboarding);

  // Sync to local storage whenever userStats updates
  const handleUpdateStats = (newStats: UserStats) => {
    setUserStats(newStats);
    saveUserStats(newStats);
  };

  // Lesson completion handler
  const handleCompleteLesson = (
    lessonId: string,
    score: number,
    xpEarned: number,
    gemsEarned: number
  ) => {
    const isFirstTime = !userStats.completedLessonIds.includes(lessonId);
    const updatedCompletedIds = isFirstTime
      ? [...userStats.completedLessonIds, lessonId]
      : userStats.completedLessonIds;

    const updatedScores = {
      ...userStats.lessonScores,
      [lessonId]: Math.max(score, userStats.lessonScores[lessonId] || 0),
    };

    // Calculate new current mastery
    const allScores: number[] = Object.values(updatedScores);
    const avgMastery = Math.round(
      allScores.reduce((a, b) => a + b, 0) / Math.max(1, allScores.length)
    );

    // Update stats
    const newStats: UserStats = {
      ...userStats,
      completedLessonIds: updatedCompletedIds,
      lessonScores: updatedScores,
      totalXp: userStats.totalXp + xpEarned,
      enjubaGems: userStats.enjubaGems + gemsEarned,
      currentMastery: Math.max(userStats.currentMastery, avgMastery),
      weeklyMinutes: userStats.weeklyMinutes + 15,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    handleUpdateStats(newStats);
  };

  const handleOnboardingComplete = (updatedStats: UserStats) => {
    handleUpdateStats(updatedStats);
    setActiveSubject(updatedStats.activeSubjectId || 'sst');
    if (updatedStats.userRole === 'parent') {
      setActiveTab('parent');
    } else {
      setActiveTab('study');
    }
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] text-slate-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Top Universal Clean Navbar */}
      <Navbar
        userStats={userStats}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        activeTab={activeTab}
        onNavigateHome={() => setActiveTab('study')}
      />

      {/* Hamburger Navigation Drawer */}
      <HamburgerDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userStats={userStats}
        onUpdateStats={handleUpdateStats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
        onReopenOnboarding={() => setShowOnboarding(true)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Main Screen Content */}
      <main className="flex-1">
        {activeTab === 'study' && (
          <StudentHome
            userStats={userStats}
            units={CURRICULUM_UNITS}
            activeSubject={activeSubject}
            setActiveSubject={setActiveSubject}
            onSelectLesson={(lesson) => setActiveLesson(lesson)}
            onOpenPractice={() => setActiveTab('practice')}
            onOpenKigoziChat={() => setShowKigoziChat(true)}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeArena
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            onBackToHome={() => setActiveTab('study')}
          />
        )}

        {activeTab === 'parent' && (
          <ParentPortal
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
          />
        )}

        {activeTab === 'offline' && (
          <OfflineManager
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
          />
        )}
      </main>

      {/* Interactive Lesson Modal (Teach -> Practice -> Retain) */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson}
          userStats={userStats}
          onClose={() => setActiveLesson(null)}
          onCompleteLesson={handleCompleteLesson}
        />
      )}

      {/* Kigozi AI Study Buddy Chat Popup */}
      {showKigoziChat && (
        <KigoziAIChat
          onClose={() => setShowKigoziChat(false)}
          gradeLevel={userStats.gradeLevel}
        />
      )}

      {/* Role & Persona Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          userStats={userStats}
          onComplete={handleOnboardingComplete}
          onClose={() => setShowOnboarding(false)}
          isDevReopen={userStats.hasCompletedOnboarding}
        />
      )}
    </div>
  );
}
