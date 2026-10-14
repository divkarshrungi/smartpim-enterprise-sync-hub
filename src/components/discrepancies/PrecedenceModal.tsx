import React, { useState } from 'react';
import { usePim } from '../../context/PimContext';

export const PrecedenceModal: React.FC = () => {
  const { isPrecedenceModalOpen, setIsPrecedenceModalOpen, addToast } = usePim();

  const [precedenceRules, setPrecedenceRules] = useState([
    { field: 'Price ($)', masterWeight: 'Central PIM Authoritative (100%)', remoteOverride: 'Blocked without change manifest' },
    { field: 'Inventory / Stock', masterWeight: 'Central PIM ERP Truth', remoteOverride: 'Warehouse POS delta allowed (15m buffer)' },
    { field: 'Product Name / Copy', masterWeight: 'Central PIM Canonical', remoteOverride: 'Channel-specific SEO overrides allowed' },
    { field: 'Taxonomy / Category', masterWeight: 'Strict Global Mapping', remoteOverride: 'Auto-mapped to Amazon browse node' },
  ]);

  if (!isPrecedenceModalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#0F172A]/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsPrecedenceModalOpen(false);
      }}
    >
      <div className="bg-white border border-[#CBD5E1] rounded-xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4f46e5]">
              <span className="material-symbols-outlined text-[20px]">policy</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Conflict Resolution Precedence Rules</h2>
              <p className="text-xs text-[#475569]">Determine field-level authority when channel drift is detected</p>
            </div>
          </div>
          <button
            onClick={() => setIsPrecedenceModalOpen(false)}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-[#475569] leading-relaxed">
            By default, <strong>SmartPIM Central Master</strong> is the authoritative golden record. If remote channels report unsanctioned price or stock variances, automatic rollbacks are triggered according to the rules below:
          </p>

          <div className="border border-[#E2E8F0] rounded-lg overflow-hidden divide-y divide-[#E2E8F0]">
            {precedenceRules.map((rule, idx) => (
              <div key={idx} className="p-3.5 bg-white flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-[#0F172A]">{rule.field}</div>
                  <div className="text-[11px] text-[#065F46] font-medium">{rule.masterWeight}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-mono text-[#94A3B8]">Channel Handling</div>
                  <div className="text-xs text-[#475569]">{rule.remoteOverride}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>Zero-Trust Auto-Rollback: Any unapproved price drops below floor price trigger immediate freeze.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs">
          <button
            onClick={() => {
              addToast('Precedence rules reset to default enterprise configuration', 'info');
            }}
            className="text-[#475569] hover:underline cursor-pointer"
          >
            Reset to Standard Schema
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrecedenceModalOpen(false)}
              className="px-3.5 py-1.5 rounded border border-[#CBD5E1] bg-white text-[#0F172A] font-semibold hover:bg-[#F1F5F9] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsPrecedenceModalOpen(false);
                addToast('Precedence manifest saved and pushed to channel adapters', 'success');
              }}
              className="px-4 py-1.5 rounded bg-[#4f46e5] text-white font-semibold hover:bg-indigo-700 cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
