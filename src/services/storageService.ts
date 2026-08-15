import { UserStats } from '../types';
import { INITIAL_USER_STATS } from '../data/curriculumData';

const STORAGE_KEY = 'soma_uganda_user_stats_v1';
const SYNC_QUEUE_KEY = 'soma_uganda_sync_queue';

export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') return INITIAL_USER_STATS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading user stats from storage:', e);
  }
  return INITIAL_USER_STATS;
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));

    // If offline or data-saver, queue an update event
    const queue = getSyncQueue();
    queue.push({ timestamp: new Date().toISOString(), action: 'stats_update', mastery: stats.currentMastery });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue.slice(-20)));
  } catch (e) {
    console.error('Error saving user stats:', e);
  }
}

export function getSyncQueue(): Array<{ timestamp: string; action: string; mastery: number }> {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearSyncQueue(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SYNC_QUEUE_KEY);
}

// Calculate projected PLE aggregate based on current mastery %
// Uganda PLE Grading System:
// Aggregate 4 to 12 = Division 1 (Distinction 1 & 2 in all 4 subjects)
// Aggregate 13 to 23 = Division 2
// Aggregate 24 to 29 = Division 3
// Aggregate 30 to 34 = Division 4
export function calculatePleProjection(masteryPercent: number): { aggregate: number; division: string; descriptor: string } {
  if (masteryPercent >= 90) {
    return { aggregate: 4, division: 'Division 1 (Super Distinction)', descriptor: 'Projected 4 Aggregates (D1 in Math, Sci, SST, Eng)' };
  } else if (masteryPercent >= 80) {
    return { aggregate: 6, division: 'Division 1', descriptor: 'Strong Division 1 trajectory (Distinctions)' };
  } else if (masteryPercent >= 70) {
    return { aggregate: 10, division: 'Division 1 / Top Division 2', descriptor: 'High Division 1 potential with consistent practice' };
  } else if (masteryPercent >= 55) {
    return { aggregate: 16, division: 'Division 2', descriptor: 'Solid Division 2, climbing towards Division 1' };
  } else {
    return { aggregate: 26, division: 'Division 3 (Baseline)', descriptor: 'Significant room for rapid improvement' };
  }
}
