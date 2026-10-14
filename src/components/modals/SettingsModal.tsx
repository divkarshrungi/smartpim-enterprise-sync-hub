import React, { useState } from 'react';
import { usePim } from '../../context/PimContext';

export const SettingsModal: React.FC = () => {
  const { isSettingsModalOpen, setIsSettingsModalOpen, mockMode, setMockMode, addToast } = usePim();

  const [autoRetry, setAutoRetry] = useState(true);
  const [syncInterval, setSyncInterval] = useState('15');
  const [currency, setCurrency] = useState('USD ($)');
  const [alertThreshold, setAlertThreshold] = useState('5');

  if (!isSettingsModalOpen) return null;

  const handleSave = () => {
    setIsSettingsModalOpen(false);
    addToast('PIM system configuration saved', 'success');
  };

  return (
    <div
      className="fixed inset-0 bg-[#0F172A]/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsSettingsModalOpen(false);
      }}
    >
      <div className="bg-white border border-[#CBD5E1] rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0F172A]">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">System Settings &amp; Parameters</h2>
              <p className="text-xs text-[#475569]">SmartPIM operational rules and simulation flags</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Settings Form */}
        <div className="p-6 space-y-4 text-xs">
          {/* Mock Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <div>
              <span className="font-bold text-[#0F172A] block">Simulation Mock Mode</span>
              <span className="text-[#94A3B8] text-[11px]">
                Enables synthetic data drift injector and sandboxed endpoints
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mockMode}
                onChange={(e) => setMockMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4f46e5]"></div>
            </label>
          </div>

          {/* Auto Retry */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <div>
              <span className="font-bold text-[#0F172A] block">Auto-Retry Channel Exceptions</span>
              <span className="text-[#94A3B8] text-[11px]">
                Exponential backoff retry policy for 429 &amp; 500 error responses
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRetry}
                onChange={(e) => setAutoRetry(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4f46e5]"></div>
            </label>
          </div>

          {/* Polling Interval */}
          <div className="space-y-1">
            <label className="font-semibold text-[#0F172A]">Telemetry Polling Interval (Seconds)</label>
            <select
              value={syncInterval}
              onChange={(e) => setSyncInterval(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-[#CBD5E1] bg-white text-xs"
            >
              <option value="5">5 seconds (High frequency)</option>
              <option value="15">15 seconds (Standard)</option>
              <option value="60">60 seconds (Battery saver)</option>
            </select>
          </div>

          {/* Currency */}
          <div className="space-y-1">
            <label className="font-semibold text-[#0F172A]">Default Master Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-[#CBD5E1] bg-white text-xs"
            >
              <option value="USD ($)">USD - US Dollar ($)</option>
              <option value="EUR (€)">EUR - Euro (€)</option>
              <option value="GBP (£)">GBP - British Pound (£)</option>
            </select>
          </div>

          {/* Alert Threshold */}
          <div className="space-y-1">
            <label className="font-semibold text-[#0F172A]">Critical Discrepancy Alert Threshold</label>
            <input
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="w-full h-8 px-2.5 rounded border border-[#CBD5E1] bg-white text-xs font-mono"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end gap-2">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-3.5 py-1.5 rounded border border-[#CBD5E1] bg-white text-[#0F172A] font-semibold hover:bg-[#F1F5F9] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-[#4f46e5] text-white font-semibold hover:bg-indigo-700 cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
