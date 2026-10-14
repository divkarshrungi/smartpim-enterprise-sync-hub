import React, { useState } from 'react';
import { usePim } from '../../context/PimContext';
import { SyncLogItem } from '../../types';

export const SyncLogsView: React.FC = () => {
  const {
    syncLogs,
    retrySyncLog,
    retryAllFailedLogs,
    clearNonErrorLogs,
    setInspectingLog,
    addToast,
    searchQuery,
    setSearchQuery,
  } = usePim();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'failed' | 'success' | 'resolved'>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);

  const failedCount = syncLogs.filter((l) => l.status.includes('FAILED')).length;
  const successCount = syncLogs.filter((l) => l.status.includes('SUCCESS')).length;

  const filteredLogs = syncLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === '' ||
      log.id.toLowerCase().includes(q) ||
      log.sku.toLowerCase().includes(q) ||
      log.productName.toLowerCase().includes(q) ||
      log.errorTitle.toLowerCase().includes(q);

    let matchesStatus = true;
    if (activeTabFilter === 'failed') {
      matchesStatus = log.status.includes('FAILED');
    } else if (activeTabFilter === 'success') {
      matchesStatus = log.status.includes('SUCCESS');
    } else if (activeTabFilter === 'resolved') {
      matchesStatus = log.errorTrace.includes('resolved') || log.status.includes('SUCCESS');
    }

    const matchesChannel =
      channelFilter === 'all' || log.targetChannel.toLowerCase() === channelFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesChannel;
  });

  const handleRetrySingle = (log: SyncLogItem) => {
    setRetryingLogId(log.id);
    setTimeout(() => {
      retrySyncLog(log.id);
      setRetryingLogId(null);
    }, 750);
  };

  const handleExport = (format: 'CSV' | 'JSON') => {
    setIsExportOpen(false);
    if (format === 'JSON') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(syncLogs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `smartpim_audit_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast('Full payload JSON archive exported', 'success');
    } else {
      const headers = ['Timestamp', 'Log ID', 'SKU', 'Product Name', 'Target Channel', 'Operation', 'Status', 'Code', 'Error Details'];
      const rows = syncLogs.map((l) => [
        `"${l.timestampDate} ${l.timestampTime}"`,
        l.id,
        l.sku,
        `"${l.productName.replace(/"/g, '""')}"`,
        l.targetChannel,
        l.operationType,
        l.status,
        l.statusCode,
        `"${l.errorTitle.replace(/"/g, '""')}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `smartpim_audit_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Audit log CSV exported', 'success');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scroll p-6 lg:p-8 space-y-6 bg-[#F8FAFC]">
      {/* Page Header & Breadcrumb Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mb-1">
            <span>Integration Hub</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Diagnostics</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#0F172A] font-semibold">Audit Trail</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Synchronization Logs &amp; Audit Trail
          </h1>
          <p className="text-xs text-[#475569] mt-0.5">
            Chronological record of all central database dispatches, automated channel reconciliation, and API retries
          </p>
        </div>

        {/* Actions: Export, Clear, Retry All Failed */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F172A] bg-white border border-[#CBD5E1] rounded-lg hover:bg-[#F1F5F9] shadow-xs active:scale-98 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#475569]">download</span>
              <span>Export Audit Log (JSON/CSV)</span>
              <span className="material-symbols-outlined text-[16px] text-[#94A3B8]">arrow_drop_down</span>
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-[#CBD5E1] rounded-lg shadow-xl z-30 py-1">
                <button
                  onClick={() => handleExport('CSV')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#0F172A] hover:bg-[#F1F5F9] text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#475569]">table_view</span>
                  <span>Export Standard CSV</span>
                </button>
                <button
                  onClick={() => handleExport('JSON')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#0F172A] hover:bg-[#F1F5F9] text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#475569]">data_object</span>
                  <span>Export Full Payload JSON</span>
                </button>
              </div>
            )}
          </div>

          {/* Clear Non-Error Logs */}
          <button
            onClick={clearNonErrorLogs}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#475569] bg-white border border-[#CBD5E1] rounded-lg hover:bg-[#F1F5F9] hover:text-[#0F172A] shadow-xs active:scale-98 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            <span>Clear Non-Error Logs</span>
          </button>

          {/* Retry All Failed */}
          <button
            onClick={retryAllFailedLogs}
            disabled={failedCount === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#E11D48] hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">replay</span>
            <span>Retry All Failed ({failedCount})</span>
          </button>
        </div>
      </div>

      {/* Metric KPI Strip (4 Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Operations (24h) */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#475569] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Total Operations (24h)</span>
            <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#0F172A]">
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172A] font-mono">428</span>
            <span className="text-xs text-[#94A3B8]">sync events</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#475569]">
            <span className="material-symbols-outlined text-[14px] text-[#059669]">trending_up</span>
            <span className="font-semibold text-[#065F46]">+14.2%</span>
            <span className="text-[#94A3B8]">vs previous 24h</span>
          </div>
        </div>

        {/* 2. Successful Pushes */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#475569] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Successful Pushes</span>
            <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#065F46] font-mono">
              {412 + (syncLogs.length - failedCount)}
            </span>
            <span className="text-xs text-[#94A3B8]">events</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-[#475569] font-medium">96.3% success rate</span>
            <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#059669] h-1.5 rounded-full" style={{ width: '96.3%' }} />
            </div>
          </div>
        </div>

        {/* 3. Failed Operations */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#475569] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Failed Operations</span>
            <div className="w-7 h-7 rounded-lg bg-[#FFF1F2] flex items-center justify-center text-[#E11D48]">
              <span className="material-symbols-outlined text-[16px]">error</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#9F1239] font-mono">{16 + failedCount}</span>
            <span className="text-xs text-[#94A3B8]">events</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]">
              {failedCount} unresolved
            </span>
            <span className="text-[#94A3B8]">11 retried &amp; cleared</span>
          </div>
        </div>

        {/* 4. Average Latency */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#475569] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Average Latency</span>
            <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#0F172A]">
              <span className="material-symbols-outlined text-[16px]">speed</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172A] font-mono">
              64<span className="text-xs font-normal text-[#94A3B8]">ms</span>
            </span>
            <span className="text-xs text-[#94A3B8]">SQLite mock</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#475569]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#059669]" />
            <span>P95: 118ms</span>
            <span className="text-[#94A3B8]">| P99: 240ms</span>
          </div>
        </div>
      </section>

      {/* Filter & Search Toolbar */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] overflow-x-auto">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                activeTabFilter === 'all'
                  ? 'text-[#0F172A] bg-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
              }`}
            >
              All Logs (428)
            </button>
            <button
              onClick={() => setActiveTabFilter('failed')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                activeTabFilter === 'failed'
                  ? 'text-[#0F172A] bg-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                Failed Only ({failedCount})
              </span>
            </button>
            <button
              onClick={() => setActiveTabFilter('success')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                activeTabFilter === 'success'
                  ? 'text-[#0F172A] bg-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                Successful ({successCount})
              </span>
            </button>
            <button
              onClick={() => setActiveTabFilter('resolved')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                activeTabFilter === 'resolved'
                  ? 'text-[#0F172A] bg-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
              }`}
            >
              Retried &amp; Resolved (11)
            </button>
          </div>

          {/* Channel Filter & Time Range & Reset */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label htmlFor="channelFilterSelect" className="text-xs text-[#475569] hidden sm:inline">Channel:</label>
              <select
                id="channelFilterSelect"
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="text-xs bg-white border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-[#0F172A] focus:outline-none focus:border-[#4f46e5]"
              >
                <option value="all">All Channels</option>
                <option value="Online Store">Online Store</option>
                <option value="Marketplace">Marketplace</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="timeRangeSelect" className="text-xs text-[#475569] hidden sm:inline">Range:</label>
              <select
                id="timeRangeSelect"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-xs bg-white border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-[#0F172A] focus:outline-none focus:border-[#4f46e5]"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <button
              onClick={() => {
                setActiveTabFilter('all');
                setChannelFilter('all');
                setTimeRange('24h');
                setSearchQuery('');
                addToast('Logs filter reset to default', 'info');
              }}
              className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
            </button>
          </div>
        </div>
      </section>

      {/* Sync Logs Data Table */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] h-10 select-none text-[11px] font-semibold text-[#475569] uppercase tracking-wider">
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-3 py-2">Log ID</th>
                <th className="px-4 py-2">Product Name &amp; SKU</th>
                <th className="px-3 py-2">Target Channel</th>
                <th className="px-3 py-2">Operation Type</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-4 py-2">Error Details / Response Code</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {filteredLogs.map((log) => {
                const isFailed = log.status.includes('FAILED');
                const isRetrying = retryingLogId === log.id;

                return (
                  <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="px-4 py-3 text-[#94A3B8] font-mono whitespace-nowrap">
                      {log.timestampTime}
                      <span className="block text-[10px] text-[#94A3B8]/70">{log.timestampDate}</span>
                    </td>
                    <td className="px-3 py-3 font-mono font-semibold text-[#0F172A] whitespace-nowrap">
                      #{log.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#0F172A]">{log.productName}</div>
                      <div className="text-[11px] text-[#94A3B8] font-mono">{log.sku}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                          log.targetChannel === 'Marketplace'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {log.targetChannel === 'Marketplace' ? 'shopping_cart' : 'storefront'}
                        </span>
                        {log.targetChannel}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="font-medium text-[#475569]">{log.operationType}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                          isFailed
                            ? 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]'
                            : 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isFailed ? 'bg-[#E11D48]' : 'bg-[#059669]'
                          }`}
                        />
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div
                        className={`text-xs font-medium truncate ${
                          isFailed ? 'text-[#9F1239]' : 'text-[#475569]'
                        }`}
                        title={log.errorTitle}
                      >
                        {log.errorTitle}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] font-mono">{log.errorTrace}</div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingLog(log)}
                          className="p-1.5 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded border border-[#CBD5E1] transition-colors cursor-pointer"
                          title="Inspect Payload"
                        >
                          <span className="material-symbols-outlined text-[16px]">code</span>
                        </button>
                        {isFailed ? (
                          <button
                            onClick={() => handleRetrySingle(log)}
                            disabled={isRetrying}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-indigo-700 rounded active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-60"
                          >
                            <span
                              className={`material-symbols-outlined text-[14px] ${
                                isRetrying ? 'animate-spin' : ''
                              }`}
                            >
                              replay
                            </span>
                            <span>{isRetrying ? 'Retrying...' : 'Retry Sync'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setInspectingLog(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0F172A] bg-white border border-[#CBD5E1] rounded hover:bg-[#F1F5F9] active:scale-95 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px] text-[#94A3B8]">
                              visibility
                            </span>
                            <span>View Payload</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#475569]">
          <div className="flex items-center gap-2">
            <span>
              Showing <span className="font-semibold text-[#0F172A]">{filteredLogs.length}</span> of{' '}
              <span className="font-semibold text-[#0F172A]">428</span> entries
            </span>
            <span className="text-[#CBD5E1]">|</span>
            <span className="text-[#94A3B8]">Auto-refresh: 15s</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="px-2 py-1 rounded border border-[#CBD5E1] bg-white text-[#94A3B8] cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-2.5 py-1 rounded border border-[#4f46e5] bg-[#4f46e5] text-white font-semibold">
              1
            </button>
            <button className="px-2.5 py-1 rounded border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#0F172A]">
              2
            </button>
            <button className="px-2.5 py-1 rounded border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#0F172A]">
              3
            </button>
            <span className="px-1 text-[#94A3B8]">...</span>
            <button className="px-2.5 py-1 rounded border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#0F172A]">
              72
            </button>
            <button className="px-2 py-1 rounded border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#0F172A]">
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
