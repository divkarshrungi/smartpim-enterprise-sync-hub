import React, { useState } from 'react';
import { usePim } from '../../context/PimContext';

export const PayloadInspectorModal: React.FC = () => {
  const { inspectingLog, setInspectingLog, retrySyncLog, addToast } = usePim();
  const [isRetrying, setIsRetrying] = useState(false);

  if (!inspectingLog) return null;

  const handleClose = () => {
    setInspectingLog(null);
  };

  const handleCopyPayload = () => {
    const jsonStr = JSON.stringify(inspectingLog.payload, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      addToast('JSON payload copied to clipboard', 'success');
    });
  };

  const handleInstantReSync = () => {
    setIsRetrying(true);
    setTimeout(() => {
      retrySyncLog(inspectingLog.id);
      setIsRetrying(false);
      handleClose();
    }, 800);
  };

  const isFailed = inspectingLog.status.includes('FAILED');

  return (
    <div
      className="fixed inset-0 bg-[#0F172A]/40 z-50 flex justify-end transition-opacity duration-300 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-xl h-full bg-white border-l border-[#CBD5E1] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4f46e5]">
              <span className="material-symbols-outlined text-base">data_object</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#0F172A]">Log Details &amp; Payload Inspector</h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    isFailed
                      ? 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]'
                      : 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                  }`}
                >
                  {inspectingLog.status}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Transaction ID:{' '}
                <span className="font-mono text-[#0F172A] font-semibold">#{inspectingLog.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-5 bg-[#F8FAFC]">
          {/* Quick Meta Details Grid */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Entity SKU</span>
              <span className="font-mono font-semibold text-[#0F172A]">{inspectingLog.sku}</span>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Channel</span>
              <span className="font-medium text-[#0F172A]">{inspectingLog.targetChannel}</span>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Dispatch Time</span>
              <span className="font-mono text-[#475569]">
                2025-05-18 {inspectingLog.timestampTime} UTC
              </span>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Attempts</span>
              <span className={`font-mono font-bold ${isFailed ? 'text-[#9F1239]' : 'text-[#065F46]'}`}>
                {inspectingLog.attempts}
              </span>
            </div>
          </div>

          {/* Upstream Failure Details (Contextual) */}
          {isFailed && (
            <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-lg p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#9F1239]">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>Upstream API Exception Details</span>
              </div>
              <p className="text-[#9F1239] leading-relaxed">
                {inspectingLog.errorTitle} (HTTP {inspectingLog.statusCode})
              </p>
              <div className="text-[11px] font-mono text-[#9F1239]/80">{inspectingLog.errorTrace}</div>
            </div>
          )}

          {/* Outbound JSON Request Payload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#94A3B8]">send</span>
                <span>Outbound JSON Request Payload</span>
              </label>
              <button
                onClick={handleCopyPayload}
                className="text-[11px] text-[#3525cd] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                <span>Copy JSON</span>
              </button>
            </div>
            <pre className="bg-[#0B0F19] text-emerald-400 p-3 rounded-lg font-mono text-xs overflow-x-auto custom-scroll border border-slate-800 leading-relaxed max-h-52">
              {JSON.stringify(inspectingLog.payload, null, 2)}
            </pre>
          </div>

          {/* Response Trace & Headers */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#94A3B8]">call_received</span>
              <span>Simulated Response Headers &amp; Trace</span>
            </label>
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-3 font-mono text-xs space-y-1 text-[#475569] overflow-x-auto">
              <div>
                <span className="text-[#94A3B8]">HTTP/1.1</span>{' '}
                <span className={`font-bold ${isFailed ? 'text-[#9F1239]' : 'text-[#065F46]'}`}>
                  {inspectingLog.statusCode} {isFailed ? 'Internal Error / Exception' : 'OK Parity'}
                </span>
              </div>
              <div>
                <span className="text-[#94A3B8]">Content-Type:</span> application/json; charset=utf-8
              </div>
              <div>
                <span className="text-[#94A3B8]">X-Trace-ID:</span>{' '}
                {inspectingLog.responseTraceId || 'tr-auto-9821-4fa1'}
              </div>
              <div>
                <span className="text-[#94A3B8]">X-RateLimit-Remaining:</span> 489
              </div>
              {inspectingLog.retryAfterSec && (
                <div>
                  <span className="text-[#94A3B8]">Retry-After:</span> {inspectingLog.retryAfterSec}s
                </div>
              )}
            </div>
          </div>

          {/* Retry Audit History Timeline */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#94A3B8]">history_toggle_off</span>
              <span>Dispatcher Retry History</span>
            </label>
            <div className="border-l-2 border-[#CBD5E1] ml-3 pl-4 space-y-3 text-xs">
              <div className="relative">
                <span
                  className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                    isFailed ? 'bg-[#E11D48]' : 'bg-[#059669]'
                  }`}
                />
                <div className="font-semibold text-[#0F172A]">
                  Attempt {isFailed ? '3 (Exception Encountered)' : '1 (Direct Parity)'}
                </div>
                <div className="text-[#94A3B8] text-[11px] font-mono">
                  {inspectingLog.timestampTime} - {inspectingLog.errorTitle}
                </div>
              </div>
              {isFailed && (
                <>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#D97706] ring-4 ring-white" />
                    <div className="font-semibold text-[#0F172A]">Attempt 2 (Backoff 4s)</div>
                    <div className="text-[#94A3B8] text-[11px] font-mono">14:42:10 - Handshake interrupted</div>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#D97706] ring-4 ring-white" />
                    <div className="font-semibold text-[#0F172A]">Attempt 1 (Initial Dispatch)</div>
                    <div className="text-[#94A3B8] text-[11px] font-mono">14:42:04 - Connection reset by peer</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#E2E8F0] bg-white flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] rounded border border-[#CBD5E1] hover:bg-[#F1F5F9] cursor-pointer"
          >
            Close Inspector
          </button>
          {isFailed && (
            <button
              onClick={handleInstantReSync}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-indigo-700 rounded active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-60"
            >
              <span className={`material-symbols-outlined text-[16px] ${isRetrying ? 'animate-spin' : ''}`}>
                replay
              </span>
              <span>{isRetrying ? 'Executing...' : 'Execute Instant Re-Sync'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
