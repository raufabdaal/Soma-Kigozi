import React, { useState } from 'react';
import { UserStats } from '../types';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  CheckCircle2, 
  RefreshCw, 
  HardDrive, 
  Zap, 
  Smartphone, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { getSyncQueue, clearSyncQueue } from '../services/storageService';
import { soundFx } from '../services/soundEffects';

interface OfflineManagerProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

interface CurriculumPack {
  id: string;
  name: string;
  grade: string;
  sizeMb: number;
  lessonsCount: number;
  description: string;
}

const AVAILABLE_PACKS: CurriculumPack[] = [
  {
    id: 'P.6-math',
    name: 'P.6 Mathematics Full NCDC Pack',
    grade: 'P.6',
    sizeMb: 4.2,
    lessonsCount: 18,
    description: 'Commercial arithmetic, fractions, speed & time, geometry and PLE prep mocks.',
  },
  {
    id: 'P.6-science',
    name: 'P.6 Integrated Science Pack',
    grade: 'P.6',
    sizeMb: 3.8,
    lessonsCount: 16,
    description: 'Human digestive & circulatory systems, crop husbandry, malaria and vector control.',
  },
  {
    id: 'P.6-sst',
    name: 'P.6 Social Studies & Civics Pack',
    grade: 'P.6',
    sizeMb: 3.5,
    lessonsCount: 14,
    description: 'Uganda physical features, East African lakes, ethnic migrations & civics.',
  },
  {
    id: 'P.6-english',
    name: 'P.6 English Grammar & Vocabulary',
    grade: 'P.6',
    sizeMb: 2.9,
    lessonsCount: 15,
    description: 'Conjunctions, relative clauses, reported speech & Ugandan cultural folklore.',
  },
  {
    id: 'P.7-ple-sprint',
    name: 'P.7 PLE Mega Examination Simulator',
    grade: 'P.7',
    sizeMb: 5.1,
    lessonsCount: 24,
    description: 'Complete UNEB past paper style question banks with detailed explanations.',
  },
];

export const OfflineManager: React.FC<OfflineManagerProps> = ({
  userStats,
  onUpdateStats,
}) => {
  const [downloadingPackId, setDownloadingPackId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const syncQueue = getSyncQueue();

  const handleToggleOfflineMode = () => {
    soundFx.playClick();
    const nextState = !userStats.isOfflineMode;
    onUpdateStats({
      ...userStats,
      isOfflineMode: nextState,
    });
  };

  const handleToggleDataSaver = () => {
    soundFx.playClick();
    onUpdateStats({
      ...userStats,
      isDataSaver: !userStats.isDataSaver,
    });
  };

  const handleDownloadPack = (packId: string) => {
    soundFx.playClick();
    setDownloadingPackId(packId);

    // Simulate reliable offline caching into local storage
    setTimeout(() => {
      soundFx.playCorrect();
      setDownloadingPackId(null);
      const updatedPacks = userStats.downloadedPacks.includes(packId)
        ? userStats.downloadedPacks
        : [...userStats.downloadedPacks, packId];

      onUpdateStats({
        ...userStats,
        downloadedPacks: updatedPacks,
      });
    }, 1200);
  };

  const handleManualSync = () => {
    soundFx.playClick();
    setSyncMessage('Connecting to Soma sync servers...');
    setTimeout(() => {
      clearSyncQueue();
      soundFx.playCorrect();
      setSyncMessage('All local progress synced successfully!');
      setTimeout(() => setSyncMessage(null), 3000);
    }, 1000);
  };

  const totalDownloadedMb = AVAILABLE_PACKS.filter((p) =>
    userStats.downloadedPacks.includes(p.id)
  ).reduce((acc, p) => acc + p.sizeMb, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            {userStats.isOfflineMode ? (
              <WifiOff className="w-6 h-6" />
            ) : (
              <Wifi className="w-6 h-6 text-emerald-600" />
            )}
          </div>
          <div>
            <h2 className="font-heading font-black text-2xl text-slate-900">
              Offline & Low-Bandwidth Delivery
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Study without internet or mobile data dropouts. Cache lessons directly onto your device.
            </p>
          </div>
        </div>

        {/* Toggles: Offline Simulation & Data-Saver Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Offline Mode Switch */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-heading font-bold text-sm text-slate-900 block">
                Offline Mode
              </span>
              <span className="text-[11px] text-slate-500 block">
                {userStats.isOfflineMode ? 'Running from local cache' : 'Using real-time connection'}
              </span>
            </div>
            <button
              id="offline-mode-toggle-btn"
              onClick={handleToggleOfflineMode}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                userStats.isOfflineMode ? 'bg-amber-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  userStats.isOfflineMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Low-Bandwidth Data-Saver Switch */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-heading font-bold text-sm text-slate-900 block">
                Data-Saver (Low-Bandwidth)
              </span>
              <span className="text-[11px] text-slate-500 block">
                {userStats.isDataSaver ? 'Optimized for 2G/3G networks' : 'Standard graphics enabled'}
              </span>
            </div>
            <button
              id="data-saver-toggle-btn"
              onClick={handleToggleDataSaver}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                userStats.isDataSaver ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  userStats.isDataSaver ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Sync Queue Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-bold text-sm text-slate-900 block">
              Device Storage & Local Sync
            </span>
            <span className="text-xs text-slate-500">
              {totalDownloadedMb.toFixed(1)} MB Cached • {syncQueue.length} unsynced actions
            </span>
          </div>
        </div>

        <button
          id="sync-now-btn"
          onClick={handleManualSync}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Progress Now
        </button>
      </div>

      {syncMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 text-center animate-in fade-in">
          {syncMessage}
        </div>
      )}

      {/* Downloadable NCDC Curriculum Packs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-slate-900">
            NCDC Offline Curriculum Packs
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {userStats.downloadedPacks.length} / {AVAILABLE_PACKS.length} Downloaded
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_PACKS.map((pack) => {
            const isDownloaded = userStats.downloadedPacks.includes(pack.id);
            const isCurrentlyDownloading = downloadingPackId === pack.id;

            return (
              <div
                key={pack.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {pack.grade} NCDC
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {pack.sizeMb} MB
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-base text-slate-900">
                    {pack.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {pack.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600">
                    {pack.lessonsCount} Interactive Modules
                  </span>

                  {isDownloaded ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready Offline
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDownloadPack(pack.id)}
                      disabled={isCurrentlyDownloading}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                    >
                      {isCurrentlyDownloading ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Pack</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
