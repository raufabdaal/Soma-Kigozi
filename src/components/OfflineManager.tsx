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
import { AVAILABLE_PACKS } from '../data/curriculumData';
import { soundFx } from '../services/soundEffects';
import { getSyncQueue, clearSyncQueue } from '../services/storageService';

interface OfflineManagerProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({
  userStats,
  onUpdateStats,
}) => {
  const [downloadingPackId, setDownloadingPackId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const syncQueue = getSyncQueue();

  const handleToggleOfflineMode = () => {
    soundFx.playClick();
    onUpdateStats({
      ...userStats,
      isOfflineMode: !userStats.isOfflineMode,
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
      <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-6 sm:p-7 border-2 border-slate-200 dark:border-[#37464f] shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
            {userStats.isOfflineMode ? (
              <WifiOff className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            ) : (
              <Wifi className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
              Offline Storage & Low-Bandwidth Delivery
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
              Study without internet or mobile data dropouts. Cache lessons directly onto your device.
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {/* Offline Mode Switch */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#202f36] border border-slate-200 dark:border-[#37464f] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-heading font-black text-sm text-slate-900 dark:text-white block">
                Offline Mode
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                {userStats.isOfflineMode ? 'Running from device cache' : 'Connected to server'}
              </span>
            </div>
            <button
              id="offline-mode-toggle-btn"
              onClick={handleToggleOfflineMode}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                userStats.isOfflineMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
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
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#202f36] border border-slate-200 dark:border-[#37464f] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-heading font-black text-sm text-slate-900 dark:text-white block">
                Data-Saver (Low-Bandwidth)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                {userStats.isDataSaver ? 'Compressed 2G/3G assets' : 'Standard graphics enabled'}
              </span>
            </div>
            <button
              id="data-saver-toggle-btn"
              onClick={handleToggleDataSaver}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                userStats.isDataSaver ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
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
      <div className="bg-white dark:bg-[#1b2a32] rounded-3xl p-5 sm:p-6 border-2 border-slate-200 dark:border-[#37464f] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-[#202f36] text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-black text-sm text-slate-900 dark:text-white block">
              Device Storage & Local Sync
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-black text-emerald-900 dark:text-emerald-200 text-center animate-in fade-in">
          {syncMessage}
        </div>
      )}

      {/* Downloadable NCDC Curriculum Packs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
            NCDC Offline Curriculum Packs
          </h3>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
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
                className="bg-white dark:bg-[#1b2a32] rounded-3xl p-5 border-2 border-slate-200 dark:border-[#37464f] shadow-xs flex flex-col justify-between space-y-3.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      {pack.grade} NCDC
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {pack.sizeMb} MB
                    </span>
                  </div>

                  <h4 className="font-heading font-black text-base text-slate-900 dark:text-white">
                    {pack.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                    {pack.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-[#202f36] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    {pack.lessonsCount} Modules
                  </span>

                  {isDownloaded ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
