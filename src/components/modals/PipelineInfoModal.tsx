import React from 'react';
import { usePim } from '../../context/PimContext';

export const PipelineInfoModal: React.FC = () => {
  const { isPipelineModalOpen, setIsPipelineModalOpen, latencyMs } = usePim();

  if (!isPipelineModalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#0F172A]/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsPipelineModalOpen(false);
      }}
    >
      <div className="bg-white border border-[#CBD5E1] rounded-xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4f46e5]">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">SmartPIM Gateway Pipeline Architecture</h2>
              <p className="text-xs text-[#475569]">Simulated multi-channel replication topology &amp; SLA parameters</p>
            </div>
          </div>
          <button
            onClick={() => setIsPipelineModalOpen(false)}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#94A3B8] font-semibold uppercase">API Gateway Engine</span>
              <div className="font-mono text-xs font-bold text-[#0F172A] mt-0.5">Express + Node Runtime</div>
              <div className="text-[11px] text-[#475569] mt-1">Mounted on Local Port 8084</div>
            </div>
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] text-[#94A3B8] font-semibold uppercase">Storage Subsystem</span>
              <div className="font-mono text-xs font-bold text-[#0F172A] mt-0.5">In-Memory SQLite v3.42</div>
              <div className="text-[11px] text-[#475569] mt-1">WAL mode enabled, zero-lock replication</div>
            </div>
          </div>

          <div className="border border-[#E2E8F0] rounded-lg p-3.5 space-y-2">
            <div className="font-semibold text-[#0F172A]">Channel Adapter Topology</div>
            <div className="space-y-1.5 text-xs text-[#475569]">
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                <span>1. Online Storefront (Shopify REST API Simulation)</span>
                <span className="font-mono text-[#059669] font-bold">24ms latency · 96.6% accuracy</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>2. Marketplace Hub (Amazon / Walmart Feed API Simulation)</span>
                <span className="font-mono text-[#D97706] font-bold">{latencyMs}ms latency · 91.8% accuracy</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Bi-directional webhooks active. Schema verification enforces canonical SKU integrity.</span>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end">
          <button
            onClick={() => setIsPipelineModalOpen(false)}
            className="px-4 py-1.5 rounded bg-[#4f46e5] text-white font-semibold hover:bg-indigo-700 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
