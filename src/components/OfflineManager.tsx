import React, { useState } from 'react';
import { UserStats } from '../types';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  CheckCircle2, 
  RefreshCw, 
  HardDrive, 
  Layers
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
    id: 'P.7-sst',
    name: 'P.7 Social Studies & Civics Full Pack',
    grade: 'P.7',
    sizeMb: 3.5,
    lessonsCount: 14,
    description: 'Physical features of East Africa, River Nile drainage, migrations & civics for PLE.',
  },
  {
    id: 'P.7-science',
    name: 'P.7 Integrated Science Pack',
    grade: 'P.7',
    sizeMb: 3.8,
    lessonsCount: 16,
    description: 'Human circulatory & digestive systems, crop husbandry, energy, sound and vectors.',
  },
  {
    id: 'P.7-math',
    name: 'P.7 Mathematics Full NCDC Pack',
    grade: 'P.7',
    sizeMb: 4.2,
    lessonsCount: 18,
    description: 'Commercial arithmetic, percentages, speed & time, algebra and PLE mock exams.',
  },
  {
    id: 'P.7-english',
    name: 'P.7 English Grammar & Vocabulary',
    grade: 'P.7',
    sizeMb: 2.9,
    lessonsCount: 15,
    description: 'Direct & indirect speech, conditional clauses, formal letters & comprehension.',
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

    // Simulate offline caching into local storage
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
    }, 1000);
  };

  const handleManualSync = () => {
    soundFx.playClick();
    setSyncMessage('Connecting to sync servers...');
    setTimeout(() => {
      clearSyncQueue();
      soundFx.playCorrect();
      setSyncMessage('All local progress synced successfully!');
      setTimeout(() => setSyncMessage(null), 3000);
    }, 900);
  };

  const totalDownloadedMb = AVAILABLE_PACKS.filter((p) =>
    userStats.downloadedPacks.includes(p.id)
  ).reduce((acc, p) => acc + p.sizeMb, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            {userStats.isOfflineMode ? (
              <WifiOff className="w-6 h-6 text-slate-700" />
            ) : (
              <Wifi className="w-6 h-6 text-emerald-600" />
            )}
          </div>
          <div>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900">
              Offline Storage & Low-Bandwidth Delivery
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Study without internet or mobile data dropouts. Cache lessons directly onto your device.
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {/* Offline Mode Switch */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-heading font-black text-sm text-slate-900 block">
                Offline Mode
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                {userStats.isOfflineMode ? 'Running from device cache' : 'Connected to server'}
              </span>
            </div>
            <button
              id="offline-mode-toggle-btn"
              onClick={handleToggleOfflineMode}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                userStats.isOfflineMode ? 'bg-emerald-500' : 'bg-slate-300'
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
              <span className="font-heading font-black text-sm text-slate-900 block">
                Data-Saver (Low-Bandwidth)
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                {userStats.isDataSaver ? 'Compressed 2G/3G assets' : 'Standard graphics enabled'}
              </span>
            </div>
            <button
              id="data-saver-toggle-btn"
              onClick={handleToggleDataSaver}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                userStats.isDataSaver ? 'bg-blue-500' : 'bg-slate-300'
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
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-black text-sm text-slate-900 block">
              Device Storage & Local Sync
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {totalDownloadedMb.toFixed(1)} MB Cached • {syncQueue.length} pending local records
            </span>
          </div>
        </div>

        <button
          id="sync-now-btn"
          onClick={handleManualSync}
          className="btn-duo-white px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Progress Now
        </button>
      </div>

      {syncMessage && (
        <div className="p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-xs font-black text-emerald-900 text-center animate-in fade-in">
          {syncMessage}
        </div>
      )}

      {/* Downloadable NCDC Curriculum Packs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-black text-base text-slate-900">
            NCDC Offline Curriculum Packs
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {userStats.downloadedPacks.length} of {AVAILABLE_PACKS.length} Downloaded
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {AVAILABLE_PACKS.map((pack) => {
            const isDownloaded = userStats.downloadedPacks.includes(pack.id);
            const isCurrentlyDownloading = downloadingPackId === pack.id;

            return (
              <div
                key={pack.id}
                className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs flex flex-col justify-between space-y-3.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="bg-blue-50 text-blue-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-blue-200">
                      {pack.grade} NCDC
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {pack.sizeMb} MB
                    </span>
                  </div>

                  <h4 className="font-heading font-black text-base text-slate-900">
                    {pack.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                    {pack.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    {pack.lessonsCount} Modules
                  </span>

                  {isDownloaded ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Cached
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDownloadPack(pack.id)}
                      disabled={isCurrentlyDownloading}
                      className="btn-duo-green px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
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
