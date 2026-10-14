import React, { useState } from 'react';
import { usePim } from '../../context/PimContext';
import { Product } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    products,
    channels,
    discrepancies,
    syncLogs,
    latencyMs,
    syncSingleProduct,
    syncAllChannels,
    syncEntireChannel,
    isSyncingAll,
    setActiveTab,
    setIsPipelineModalOpen,
    setInspectingProductDetails,
    addToast,
    searchQuery,
  } = usePim();

  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Compute metrics
  const totalProducts = products.length;
  const synchronizedCount = products.filter(
    (p) =>
      p.channelPresence.onlineStore.status === 'synced' &&
      p.channelPresence.marketplace.status === 'synced'
  ).length;
  const syncRate = totalProducts > 0 ? ((synchronizedCount / totalProducts) * 100).toFixed(1) : '100.0';
  const failedSyncsCount = syncLogs.filter((l) => l.status.includes('FAILED')).length;

  const onlineStoreChannel = channels.find((c) => c.code === 'CH-01') || channels[0];
  const marketplaceChannel = channels.find((c) => c.code === 'CH-02') || channels[1];

  // Filter products for recent table
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const exportCSV = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Price', 'Stock', 'Online Store', 'Marketplace'];
    const rows = filteredProducts.map((p) => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.price.toFixed(2),
      p.stock,
      p.channelPresence.onlineStore.status,
      p.channelPresence.marketplace.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartpim_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Catalog exported to CSV successfully', 'success');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Notification Alert Banner */}
      <div className="bg-[#eff4ff] border-b border-[#E2E8F0] px-8 py-2.5 flex items-center justify-between text-xs text-[#475569] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#3525cd] text-base">dns</span>
          <span>
            <strong className="font-semibold text-[#0F172A]">Simulated Channels Active:</strong> Local
            SQLite Database synchronized via high-speed Express Gateway API.
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="text-[#94A3B8]">
            Port: 8084 | Latency: {latencyMs}ms
          </span>
          <button
            onClick={() => setIsPipelineModalOpen(true)}
            className="text-[#3525cd] hover:underline font-semibold cursor-pointer"
          >
            View Pipeline Info
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scroll p-6 lg:p-8 space-y-6">
        {/* Hero Section Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Integration Dashboard</h1>
            <p className="text-sm text-[#475569] mt-0.5">
              Real-time overview of central catalog synchronization with simulated channels
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="text-xs text-[#94A3B8] flex items-center gap-1.5 font-mono">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span>Last checked: 2 mins ago</span>
            </span>
            <button
              onClick={syncAllChannels}
              disabled={isSyncingAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4f46e5] text-white hover:bg-indigo-700 transition-colors text-xs font-semibold shadow-sm active:scale-98 cursor-pointer disabled:opacity-60"
            >
              <span className={`material-symbols-outlined text-[18px] ${isSyncingAll ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>{isSyncingAll ? 'Syncing...' : 'Sync All Channels'}</span>
            </button>
          </div>
        </section>

        {/* Top Metric Summary Cards Grid (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Products */}
          <div
            onClick={() => setActiveTab('products')}
            className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm hover:border-[#CBD5E1] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#475569] font-semibold">
                Total Products
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#475569]">
                <span className="material-symbols-outlined text-[18px]">inventory</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0F172A] tabular-nums">{totalProducts}</span>
              <span className="text-xs text-[#475569]">products</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#475569]">
              <span className="material-symbols-outlined text-[16px] text-[#94A3B8]">trending_flat</span>
              <span>+12 this week (neutral trend)</span>
            </div>
          </div>

          {/* Card 2: Synchronized */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm hover:border-[#CBD5E1] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#475569] font-semibold">
                Synchronized
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0F172A] tabular-nums">{synchronizedCount}</span>
              <span className="text-xs text-[#065F46] font-semibold bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full">
                {syncRate}% rate
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#065F46]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span>Optimal synchronization state</span>
            </div>
          </div>

          {/* Card 3: Discrepancies */}
          <div
            onClick={() => setActiveTab('discrepancies')}
            className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm hover:border-[#CBD5E1] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#475569] font-semibold">
                Discrepancies
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] flex items-center justify-center text-[#D97706]">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0F172A] tabular-nums">{discrepancies.length}</span>
              <span className="text-xs text-[#92400E] font-semibold bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 rounded-full">
                {discrepancies.length > 0 ? 'Requires Review' : 'All Clear'}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#92400E]">
              <span className="material-symbols-outlined text-[16px]">difference</span>
              <span>Price &amp; stock variance detected</span>
            </div>
          </div>

          {/* Card 4: Failed Syncs */}
          <div
            onClick={() => setActiveTab('syncLogs')}
            className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm hover:border-[#CBD5E1] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#475569] font-semibold">
                Failed Syncs
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FFF1F2] flex items-center justify-center text-[#E11D48]">
                <span className="material-symbols-outlined text-[18px]">error_outline</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#0F172A] tabular-nums">{failedSyncsCount}</span>
              <span className="text-xs text-[#9F1239] font-semibold bg-[#FFF1F2] border border-[#FECDD3] px-2 py-0.5 rounded-full">
                {failedSyncsCount > 0 ? 'Needs Retry' : 'Resolved'}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#9F1239]">
              <span className="material-symbols-outlined text-[16px]">sync_problem</span>
              <span>Webhook timeout on channel adapter</span>
            </div>
          </div>
        </section>

        {/* Middle Section: Channel Status Cards (2 side-by-side) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel 1: Online Store */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#059669] border border-[#A7F3D0] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">storefront</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">{onlineStoreChannel.name}</h3>
                    <p className="text-xs text-[#94A3B8]">{onlineStoreChannel.subtitle}</p>
                  </div>
                </div>
                {/* Status Pill */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]">
                  <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                  <span>{onlineStoreChannel.statusText}</span>
                </span>
              </div>

              {/* Metrics Matrix */}
              <div className="grid grid-cols-3 gap-4 my-5 py-3 px-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <div>
                  <span className="text-[11px] font-semibold text-[#94A3B8] uppercase">Synchronized</span>
                  <p className="text-lg font-bold text-[#0F172A] mt-0.5 tabular-nums">
                    {onlineStoreChannel.fullySynchronized}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#94A3B8] uppercase">Pending</span>
                  <p className="text-lg font-bold text-[#475569] mt-0.5 tabular-nums">
                    {onlineStoreChannel.pendingUpdates}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#94A3B8] uppercase">Failed</span>
                  <p className="text-lg font-bold text-[#9F1239] mt-0.5 tabular-nums">
                    {onlineStoreChannel.failedDispatches}
                  </p>
                </div>
              </div>

              {/* Health & Latency Info */}
              <div className="flex items-center justify-between text-xs text-[#475569] px-1 mb-4">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#059669]">speed</span>
                  <span>
                    Average Response Latency:{' '}
                    <strong className="text-[#0F172A] font-semibold font-mono">
                      {onlineStoreChannel.latencyMs}ms
                    </strong>
                  </span>
                </span>
                <span className="text-[11px] font-mono text-[#94A3B8]">Endpoint: api.sim-shopify.local</span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] mt-2">
              <button
                onClick={() => setActiveTab('channels')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#0F172A] px-3 py-1.5 rounded-lg border border-[#CBD5E1] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Configure</span>
              </button>
              <button
                onClick={() => syncEntireChannel('ch-1')}
                className="inline-flex items-center gap-2 text-xs font-semibold bg-[#4f46e5] text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm active:scale-98 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span>Trigger Store Sync</span>
              </button>
            </div>
          </div>

          {/* Channel 2: Marketplace */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#D97706] border border-[#FDE68A] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">{marketplaceChannel.name}</h3>
                    <p className="text-xs text-[#94A3B8]">{marketplaceChannel.subtitle}</p>
                  </div>
                </div>
                {/* Status Pill */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                  <span>{marketplaceChannel.statusText}</span>
                </span>
              </div>

              {/* Metrics Matrix */}
              <div className="grid grid-cols-3 gap-4 my-5 py-3 px-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <div>
                  <span className="text-[11px] font-semibold text-[#94A3B8] uppercase">Synchronized</span>
                  <p className="text-lg font-bold text-[#0F172A] mt-0.5 tabular-nums">
                    {marketplaceChannel.fullySynchronized}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#94A3B8] uppercase">Discrepancies</span>
                  <p className="text-lg font-bold text-[#92400E] mt-0.5 tabular-nums">
                    {discrepancies.filter((d) => d.channel === 'Marketplace').length || marketplaceChannel.pendingUpdates}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#94A3B8] uppercase">Failed</span>
                  <p className="text-lg font-bold text-[#9F1239] mt-0.5 tabular-nums">
                    {marketplaceChannel.failedDispatches}
                  </p>
                </div>
              </div>

              {/* Health & Latency Info */}
              <div className="flex items-center justify-between text-xs text-[#475569] px-1 mb-4">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#D97706]">speed</span>
                  <span>
                    Average Response Latency:{' '}
                    <strong className="text-[#0F172A] font-semibold font-mono">
                      {marketplaceChannel.latencyMs}ms
                    </strong>
                  </span>
                </span>
                <span className="text-[11px] font-mono text-[#94A3B8]">Endpoint: hub.market-sim.local</span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] mt-2">
              <button
                onClick={() => setActiveTab('channels')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569] hover:text-[#0F172A] px-3 py-1.5 rounded-lg border border-[#CBD5E1] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Channel Settings</span>
              </button>
              <button
                onClick={() => setActiveTab('discrepancies')}
                className="inline-flex items-center gap-2 text-xs font-semibold bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] px-4 py-1.5 rounded-lg hover:bg-amber-100 transition-colors shadow-sm active:scale-98 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#D97706]">rule</span>
                <span>Resolve Mismatches</span>
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Section: Recently Updated Products Data Table */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          {/* Table Header Panel */}
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Recently Updated Products</h2>
              <p className="text-xs text-[#475569]">Catalog entities monitored across active integration feeds</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-white border border-[#CBD5E1] rounded-lg px-2.5 py-1.5 text-[#475569] focus:outline-none focus:border-[#4f46e5]"
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Computers">Computers</option>
                <option value="Wearables">Wearables</option>
                <option value="Accessories">Accessories</option>
                <option value="Displays">Displays</option>
              </select>
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#475569] hover:text-[#0F172A] text-xs font-semibold cursor-pointer shadow-xs hover:bg-[#F8FAFC]"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Scrollable Table */}
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] h-10 select-none text-[11px] font-semibold text-[#475569] uppercase tracking-wider">
                  <th className="py-2.5 px-4">SKU</th>
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">PIM Price</th>
                  <th className="py-2.5 px-4">Stock</th>
                  <th className="py-2.5 px-4">Online Store Status</th>
                  <th className="py-2.5 px-4">Marketplace Status</th>
                  <th className="py-2.5 px-4">Last Modified</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {filteredProducts.slice(0, 6).map((product) => {
                  const onlineSynced = product.channelPresence.onlineStore.status === 'synced';
                  const onlineFailed = product.channelPresence.onlineStore.status === 'failed';
                  const marketSynced = product.channelPresence.marketplace.status === 'synced';
                  const marketDiscrepancy = product.channelPresence.marketplace.status === 'discrepancy';
                  const marketPending = product.channelPresence.marketplace.status === 'pending';

                  return (
                    <tr key={product.id} className="hover:bg-[#F8FAFC] transition-colors group">
                      <td className="py-3 px-4 font-mono font-medium text-[#3525cd] whitespace-nowrap">
                        {product.sku}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl}
                            alt={product.imageAlt}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // Fallback container
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                            className="w-9 h-9 rounded object-cover border border-[#E2E8F0] bg-slate-100 flex-shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-[#0F172A] leading-snug line-clamp-1 max-w-xs">
                              {product.name}
                            </div>
                            <div className="text-[11px] text-[#94A3B8] font-mono">
                              Master ID: {product.masterId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#475569]">{product.category}</td>
                      <td className="py-3 px-4 font-semibold text-[#0F172A] tabular-nums font-mono">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-[#0F172A] tabular-nums font-mono">{product.stock}</td>

                      {/* Online Store Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {onlineSynced && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                            <span>Synchronized</span>
                          </span>
                        )}
                        {onlineFailed && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF1F2] border border-[#FECDD3] text-[#9F1239]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
                            <span>Failed Sync</span>
                          </span>
                        )}
                        {!onlineSynced && !onlineFailed && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                            <span>Discrepancy</span>
                          </span>
                        )}
                      </td>

                      {/* Marketplace Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {marketSynced && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                            <span>Synchronized</span>
                          </span>
                        )}
                        {marketDiscrepancy && (
                          <div
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]"
                            title={product.channelPresence.marketplace.statusLabel}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                            <span>{product.channelPresence.marketplace.statusLabel || 'Price Drift'}</span>
                          </div>
                        )}
                        {marketPending && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F1F5F9] border border-[#CBD5E1] text-[#475569]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] animate-pulse" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[#94A3B8] font-mono text-[11px] whitespace-nowrap">
                        {product.lastModified}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {onlineFailed ? (
                            <button
                              onClick={() => syncSingleProduct(product.sku, 'Online Store')}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-[#FFF1F2] text-[#9F1239] hover:bg-rose-100 border border-[#FECDD3] transition-colors cursor-pointer"
                            >
                              Retry
                            </button>
                          ) : (
                            <button
                              onClick={() => syncSingleProduct(product.sku)}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-[#F1F5F9] hover:bg-[#CBD5E1] text-[#0F172A] border border-[#E2E8F0] transition-colors cursor-pointer"
                            >
                              Sync
                            </button>
                          )}
                          <button
                            onClick={() => setInspectingProductDetails(product)}
                            className="px-2 py-1 text-xs text-[#475569] hover:text-[#0F172A] rounded hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="px-6 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#475569]">
            <div>
              Showing <strong className="text-[#0F172A] font-semibold">1</strong> to{' '}
              <strong className="text-[#0F172A] font-semibold">
                {Math.min(6, filteredProducts.length)}
              </strong>{' '}
              of <strong className="text-[#0F172A] font-semibold">{totalProducts}</strong> products
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="px-2.5 py-1 rounded border border-[#E2E8F0] bg-white text-[#94A3B8] opacity-50 cursor-not-allowed"
              >
                Previous
              </button>
              <button className="px-2.5 py-1 rounded border border-[#4f46e5] bg-[#4f46e5] text-white font-semibold">
                1
              </button>
              <button className="px-2.5 py-1 rounded border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[#0F172A]">
                2
              </button>
              <button className="px-2.5 py-1 rounded border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[#0F172A]">
                3
              </button>
              <span className="px-1 text-[#94A3B8]">...</span>
              <button className="px-2.5 py-1 rounded border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[#0F172A]">
                25
              </button>
              <button className="px-2.5 py-1 rounded border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[#0F172A]">
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
