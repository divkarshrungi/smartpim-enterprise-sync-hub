import React, { useState } from 'react';
import { usePim } from '../../context/PimContext';
import { DiscrepancyItem } from '../../types';

export const DiscrepanciesView: React.FC = () => {
  const {
    discrepancies,
    resolveDiscrepancy,
    resolveAllSafeDiscrepancies,
    scanAllForDrift,
    setIsPrecedenceModalOpen,
    searchQuery,
    setSearchQuery,
    addToast,
  } = usePim();

  const [channelFilter, setChannelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Filter items
  const filtered = discrepancies.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === '' ||
      item.sku.toLowerCase().includes(q) ||
      item.productName.toLowerCase().includes(q) ||
      item.fieldName.toLowerCase().includes(q);

    const matchesChannel =
      channelFilter === 'all' ||
      (channelFilter === 'online' && item.channel === 'Online Store') ||
      (channelFilter === 'marketplace' && item.channel === 'Marketplace');

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'price' && item.fieldName === 'Price') ||
      (typeFilter === 'stock' && item.fieldName === 'Stock Count') ||
      (typeFilter === 'divergence' &&
        (item.fieldName === 'Product Name' || item.fieldName === 'Color Attribute')) ||
      (typeFilter === 'category' && item.fieldName === 'Category');

    const matchesSeverity =
      severityFilter === 'all' ||
      (severityFilter === 'high' && item.severity === 'High') ||
      (severityFilter === 'medium' && item.severity === 'Medium') ||
      (severityFilter === 'low' && item.severity === 'Low');

    return matchesSearch && matchesChannel && matchesType && matchesSeverity;
  });

  const handleSyncRow = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      resolveDiscrepancy(id);
      setSyncingId(null);
    }, 700);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkPush = () => {
    if (selectedIds.length === 0) {
      addToast('Please select discrepancies to push', 'warning');
      return;
    }
    selectedIds.forEach((id) => resolveDiscrepancy(id));
    setSelectedIds([]);
    addToast(`Pushed ${selectedIds.length} master values to remote replicas`, 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scroll px-8 py-6 space-y-6 bg-[#F8FAFC]">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Discrepancy Detection &amp; Resolution
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]">
              {discrepancies.length} Out-of-Sync
            </span>
          </div>
          <p className="text-sm text-[#475569] mt-0.5">
            Field-level comparison between Central PIM master records and distributed channel states
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={scanAllForDrift}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9] text-xs font-semibold transition-all duration-150 active:scale-98 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#475569]">radar</span>
            <span>Scan All For Drift</span>
          </button>
          <button
            onClick={resolveAllSafeDiscrepancies}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4f46e5] text-white hover:bg-indigo-700 text-xs font-semibold transition-all duration-150 active:scale-98 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
            <span>Resolve All Safe Discrepancies</span>
          </button>
        </div>
      </div>

      {/* Summary Visual Diff Banner (Bento Style) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Live Drift Status & Comparison Card */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4f46e5]">compare_arrows</span>
              <h2 className="text-base font-bold text-[#0F172A]">Master vs Channel Diff Inspection</h2>
            </div>
            <span className="text-xs text-[#94A3B8]">Last automatic schema sweep: 4 mins ago</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {/* Left: Expected Master Record */}
            <div className="p-3.5 rounded-lg bg-[#ECFDF5]/50 border border-[#A7F3D0]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#065F46] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#059669]" />
                  Central PIM Master (Golden Source)
                </span>
                <span className="text-[10px] font-mono text-[#065F46]/80 font-bold">AUTHORITATIVE</span>
              </div>
              <p className="text-xs text-[#475569]">
                Master records verified with strict validation schema. Zero uncommitted draft edits.
              </p>
              <div className="mt-3 pt-3 border-t border-[#A7F3D0]/60 flex items-center justify-between text-xs">
                <span className="text-[#475569]">Total Master SKUs:</span>
                <span className="font-bold text-[#0F172A] font-mono">14,820</span>
              </div>
            </div>

            {/* Right: Actual Divergent Remote Status */}
            <div className="p-3.5 rounded-lg bg-[#FFFBEB]/60 border border-[#FDE68A]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#92400E] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                  Active Channel Drift State
                </span>
                <span className="text-[10px] font-mono text-[#92400E]/80 font-bold">DESYNCHRONIZED</span>
              </div>
              <p className="text-xs text-[#475569]">
                Marketplace and Online Store nodes exhibiting conflicting inventory and pricing attributes.
              </p>
              <div className="mt-3 pt-3 border-t border-[#FDE68A]/60 flex items-center justify-between text-xs">
                <span className="text-[#475569]">Financial Exposure:</span>
                <span className="font-bold text-[#9F1239] font-mono">-$1,450.00 / day</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#475569]">
              High discrepancy clusters detected in <strong>Price ($)</strong> and <strong>Stock Count</strong>.
            </span>
            <button
              onClick={resolveAllSafeDiscrepancies}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#3525cd] hover:underline cursor-pointer"
            >
              <span>One-Click Push to Channel</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Metric KPI Cards (4 Cards) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
            <span className="text-xs text-[#475569] font-semibold">Critical Drift Risk</span>
            <div className="my-1.5">
              <span className="text-2xl font-bold text-[#9F1239]">3</span>
              <span className="text-xs text-[#94A3B8] ml-1">financial items</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#9F1239]">
              <span className="material-symbols-outlined text-[14px]">error</span>
              Requires immediate sync
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
            <span className="text-xs text-[#475569] font-semibold">Auto-Resolvable</span>
            <div className="my-1.5">
              <span className="text-2xl font-bold text-[#0F172A]">8</span>
              <span className="text-xs text-[#94A3B8] ml-1">safe mappings</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#065F46]">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              No downstream lock
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
            <span className="text-xs text-[#475569] font-semibold">Marketplace Divergence</span>
            <div className="my-1.5">
              <span className="text-2xl font-bold text-[#0F172A]">72%</span>
              <span className="text-xs text-[#94A3B8] ml-1">of all drift</span>
            </div>
            <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#4f46e5] h-full w-[72%]" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
            <span className="text-xs text-[#475569] font-semibold">Sync Latency SLA</span>
            <div className="my-1.5">
              <span className="text-2xl font-bold text-[#059669]">99.8%</span>
            </div>
            <span className="text-[11px] text-[#94A3B8]">Targeted &lt; 30s convergence</span>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search by Product Name or SKU */}
          <div className="lg:col-span-4 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#94A3B8]">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Product Name or SKU..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15"
            />
          </div>

          {/* Channel Filter */}
          <div className="lg:col-span-3">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#4f46e5]"
            >
              <option value="all">Channel: All Channels ({discrepancies.length})</option>
              <option value="online">Online Store</option>
              <option value="marketplace">Marketplace</option>
            </select>
          </div>

          {/* Discrepancy Type Filter */}
          <div className="lg:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#4f46e5]"
            >
              <option value="all">Type: All Discrepancy Types</option>
              <option value="price">Price Mismatch</option>
              <option value="stock">Stock Drift</option>
              <option value="divergence">Title/Description Divergence</option>
              <option value="category">Category</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="lg:col-span-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#4f46e5]"
            >
              <option value="all">Severity: All</option>
              <option value="high">High / Financial</option>
              <option value="medium">Medium / Availability</option>
              <option value="low">Low / Metadata</option>
            </select>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs text-[#475569]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#94A3B8]">Active Filter Presets:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F1F5F9] text-[#0F172A] font-medium text-xs border border-[#CBD5E1]">
              {severityFilter === 'all' ? 'All Severity Tiers' : `${severityFilter.toUpperCase()} Severity`}
              <button onClick={() => setSeverityFilter('all')} className="hover:text-rose-500">
                ✕
              </button>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F1F5F9] text-[#0F172A] font-medium text-xs border border-[#CBD5E1]">
              Active Drift Only
              <span className="text-[#94A3B8]">●</span>
            </span>
            <button
              onClick={() => {
                setChannelFilter('all');
                setTypeFilter('all');
                setSeverityFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-[#3525cd] font-semibold hover:underline ml-1 cursor-pointer"
            >
              Reset All
            </button>
          </div>
          <span className="font-mono text-xs">
            Showing <strong>{filtered.length}</strong> prioritized discrepancies
          </span>
        </div>
      </section>

      {/* Detailed Discrepancy Comparison Table */}
      <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#475569] h-10 tracking-wider select-none uppercase">
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-[#CBD5E1] text-[#4f46e5] focus:ring-[#4f46e5]/20 h-4 w-4"
                  />
                </th>
                <th className="py-2.5 px-4 font-semibold">Product Name &amp; SKU</th>
                <th className="py-2.5 px-3 font-semibold">Channel</th>
                <th className="py-2.5 px-3 font-semibold">Field Name</th>
                <th className="py-2.5 px-4 font-semibold">Central PIM Master (Source)</th>
                <th className="py-2.5 px-4 font-semibold">Current Channel Value (Divergent)</th>
                <th className="py-2.5 px-3 font-semibold">Drift Age</th>
                <th className="py-2.5 px-3 font-semibold">Impact</th>
                <th className="py-2.5 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-3xl text-emerald-500 block mb-2">
                      verified
                    </span>
                    <span className="font-semibold text-slate-800">All Master Fields Synchronized</span>
                    <p className="text-xs text-slate-400 mt-1">
                      No active attribute discrepancies detected between Central PIM and connected channels.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const isSyncing = syncingId === item.id;
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#F1F5F9] transition-colors group ${
                        idx % 2 === 1 ? 'bg-[#F8FAFC]/50' : 'bg-white'
                      } ${isSelected ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedIds((prev) => prev.filter((i) => i !== item.id));
                            } else {
                              setSelectedIds((prev) => [...prev, item.id]);
                            }
                          }}
                          className="rounded border-[#CBD5E1] text-[#4f46e5] focus:ring-[#4f46e5]/20 h-4 w-4"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#0F172A] leading-snug group-hover:text-[#3525cd] transition-colors">
                            {item.productName}
                          </span>
                          <span className="text-[11px] text-[#94A3B8] font-mono mt-0.5">{item.sku}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F1F5F9] text-[#0F172A] text-xs font-medium border border-[#CBD5E1]">
                          <span className="material-symbols-outlined text-[14px] text-[#475569]">
                            {item.channel === 'Online Store' ? 'shopping_bag' : 'storefront'}
                          </span>
                          {item.channel}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
                          {item.fieldName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] font-bold font-mono text-xs">
                          <span className="material-symbols-outlined text-[14px] text-[#059669]">check</span>
                          {item.pimMasterValue}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="inline-flex items-center gap-2 text-[#9F1239] font-semibold font-mono text-xs">
                            <span className="line-through text-[#94A3B8]">{item.channelValue}</span>
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#FFF1F2] border border-[#FECDD3] font-bold">
                              {item.deltaText}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#9F1239] mt-0.5 font-medium">{item.riskText}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#94A3B8] text-xs font-mono whitespace-nowrap">
                        {item.driftAge}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.severity === 'High'
                              ? 'bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]'
                              : item.severity === 'Medium'
                              ? 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]'
                              : 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.severity === 'High'
                                ? 'bg-[#E11D48]'
                                : item.severity === 'Medium'
                                ? 'bg-[#D97706]'
                                : 'bg-[#94A3B8]'
                            }`}
                          />
                          {item.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleSyncRow(item.id)}
                            disabled={isSyncing}
                            className="px-3 py-1.5 rounded-lg bg-[#4f46e5] text-white hover:bg-indigo-700 text-xs font-semibold transition-all active:scale-98 shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-1"
                          >
                            <span
                              className={`material-symbols-outlined text-[14px] ${
                                isSyncing ? 'animate-spin' : ''
                              }`}
                            >
                              sync
                            </span>
                            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Bulk Execution Bar */}
        <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAllRows"
              checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-[#CBD5E1] text-[#4f46e5] focus:ring-[#4f46e5]/20"
            />
            <label htmlFor="selectAllRows" className="text-[#475569] cursor-pointer">
              Select all {filtered.length} pending discrepancies
            </label>
            <span className="text-[#94A3B8]">|</span>
            <button
              onClick={handleBulkPush}
              className="text-[#3525cd] hover:underline font-semibold cursor-pointer"
            >
              Bulk Push Master State
            </button>
          </div>
          <div className="flex items-center gap-3 text-[#94A3B8]">
            <span>Page 1 of 1</span>
          </div>
        </div>
      </section>

      {/* Discrepancy Rule Explanation Drawer Preview */}
      <section className="p-4 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-white border border-[#CBD5E1] text-[#3525cd]">
            <span className="material-symbols-outlined text-[22px]">policy</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Conflict Resolution Precedence Rules</h3>
            <p className="text-xs text-[#475569] mt-0.5">
              SmartPIM automatically locks Central PIM master fields as authoritative. Automatic rollbacks
              occur if remote marketplace updates overwrite validated pricing without an approved change manifest.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsPrecedenceModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] text-xs font-semibold whitespace-nowrap active:scale-98 transition-all cursor-pointer shadow-xs"
        >
          Configure Precedence
        </button>
      </section>
    </div>
  );
};
