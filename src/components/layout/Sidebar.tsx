import React from 'react';
import { usePim } from '../../context/PimContext';
import { NavTab } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    discrepancies,
    syncLogs,
    mockMode,
    setMockMode,
    triggerDriftSimulation,
    setIsSettingsModalOpen,
  } = usePim();

  const failedLogsCount = syncLogs.filter((l) => l.status.includes('FAILED')).length;

  const navItems: { id: NavTab; label: string; icon: string; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'products', label: 'Products', icon: 'inventory_2' },
    { id: 'channels', label: 'Channels', icon: 'hub' },
    {
      id: 'discrepancies',
      label: 'Discrepancies',
      icon: 'sync_problem',
      badge: discrepancies.length > 0 ? discrepancies.length : undefined,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      id: 'syncLogs',
      label: 'Sync Logs',
      icon: 'history',
      badge: failedLogsCount > 0 ? failedLogsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
  ];

  return (
    <aside className="fixed top-0 bottom-0 left-0 w-64 border-r border-[#1E293B] z-40 bg-[#0B0F19] flex flex-col justify-between h-full p-4 select-none">
      {/* Top Branding & Nav */}
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white shadow-sm border border-[#1E293B] flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              hub
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">SmartPIM</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#534ada] text-white tracking-wide">
                CORE
              </span>
            </div>
            <span className="text-[11px] text-[#94A3B8]">Enterprise Sync Hub</span>
          </div>
        </div>

        {/* Action Button: Simulate Drift */}
        <button
          onClick={triggerDriftSimulation}
          className="w-full py-2 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-white font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all duration-150 active:scale-98 cursor-pointer shadow-sm group"
          title="Inject synthetic channel variance to test discrepancy reconciliation"
        >
          <span className="material-symbols-outlined text-[16px] text-amber-400 group-hover:rotate-12 transition-transform">
            bolt
          </span>
          <span>Simulate Drift</span>
        </button>

        {/* Primary Navigation Links */}
        <nav aria-label="Main Navigation" className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer active:scale-98 ${
                  isActive
                    ? 'bg-[#4f46e5] text-white border-l-2 border-[#c3c0ff] shadow-sm font-semibold'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? 'text-white' : 'text-[#94A3B8]'
                    }`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[11px] font-bold border leading-none ${
                      item.badgeColor || 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Diagnostic & Settings Controls */}
      <div className="flex flex-col gap-1.5 pt-4 border-t border-[#1E293B]">
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors text-sm font-medium cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>Settings</span>
        </button>

        {/* Mock Mode Toggle Indicator */}
        <div
          onClick={() => setMockMode(!mockMode)}
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] text-xs font-medium cursor-pointer hover:bg-slate-900 transition-colors"
          title="Click to toggle Mock Mode"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">terminal</span>
            <span className="text-white text-xs">{mockMode ? 'Mock Mode (Active)' : 'Live Mode'}</span>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              mockMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
        </div>
      </div>
    </aside>
  );
};
