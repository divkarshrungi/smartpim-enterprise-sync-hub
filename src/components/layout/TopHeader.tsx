import React, { useState } from 'react';
import { usePim } from '../../context/PimContext';

export const TopHeader: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    syncAllChannels,
    isSyncingAll,
    channels,
    addToast,
    setIsPipelineModalOpen,
  } = usePim();

  const [showNotifications, setShowNotifications] = useState(false);

  const notificationsList = [
    { id: 1, title: 'Price drift detected', channel: 'Marketplace', time: '14m ago', type: 'warning' },
    { id: 2, title: 'Stock count conflict', channel: 'Online Store', time: '42m ago', type: 'warning' },
    { id: 3, title: 'Webhook dispatch timeout', channel: 'Online Store', time: '1h ago', type: 'error' },
  ];

  const allChannelsHealthy = channels.every((c) => c.status === 'healthy');

  return (
    <header className="sticky top-0 right-0 z-30 h-16 w-full flex items-center justify-between px-6 bg-white border-b border-[#E2E8F0] shadow-sm flex-shrink-0">
      {/* Left: Global Catalog Search */}
      <div className="flex items-center w-80 md:w-96 relative">
        <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#94A3B8] text-[18px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Global catalog quick search..."
          className="w-full h-9 pl-9 pr-3 rounded border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-normal text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2 text-[#94A3B8] hover:text-[#0F172A] text-xs"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Right Action Hub */}
      <div className="flex items-center gap-3">
        {/* Status Indicator Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-semibold uppercase tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
          <span>{allChannelsHealthy ? 'Channels Online (All Parity)' : 'Channels Online'}</span>
        </div>

        {/* Sync All Primary Button */}
        <button
          onClick={syncAllChannels}
          disabled={isSyncingAll}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#4f46e5] hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-xs transition-all active:scale-98 shadow-sm cursor-pointer"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${isSyncingAll ? 'animate-spin' : ''}`}
          >
            sync
          </span>
          <span>{isSyncingAll ? 'Syncing...' : 'Sync All'}</span>
        </button>

        {/* Divider line */}
        <div className="h-6 w-[1px] bg-[#E2E8F0] mx-1" />

        {/* Utility Icon Actions */}
        <div className="flex items-center gap-0.5 relative">
          {/* Refresh */}
          <button
            onClick={() => {
              addToast('Channel metrics refreshed from active replica', 'info');
            }}
            className="p-2 rounded text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            title="Refresh Status"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E11D48]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#CBD5E1] rounded-lg shadow-xl z-50 p-3 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                  <span className="text-xs font-bold text-[#0F172A]">Sync Notifications</span>
                  <span className="text-[10px] text-[#94A3B8]">3 unread</span>
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scroll">
                  {notificationsList.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded bg-[#F8FAFC] hover:bg-[#F1F5F9] text-xs space-y-0.5 border border-[#E2E8F0] cursor-pointer"
                    >
                      <div className="flex items-center justify-between font-semibold text-[#0F172A]">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-[#94A3B8] font-mono">{n.time}</span>
                      </div>
                      <div className="text-[11px] text-[#475569]">Target: {n.channel}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    addToast('All notifications marked as read', 'info');
                  }}
                  className="w-full text-center text-[11px] text-[#4f46e5] font-semibold hover:underline pt-1"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>

          {/* Documentation / Pipeline Info */}
          <button
            onClick={() => setIsPipelineModalOpen(true)}
            className="p-2 rounded text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            title="Help & Gateway Pipeline Info"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>
        </div>

        {/* Administrator Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-1 ring-slate-300">
            AD
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-xs font-semibold text-[#0F172A] leading-tight">Admin Ops</span>
            <span className="text-[10px] text-[#94A3B8] leading-none">Engineering Lead</span>
          </div>
        </div>
      </div>
    </header>
  );
};
