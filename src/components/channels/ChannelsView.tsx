import React from 'react';
import { usePim } from '../../context/PimContext';

export const ChannelsView: React.FC = () => {
  const {
    channels,
    latencyMs,
    setLatencyMs,
    telemetryLogs,
    syncEntireChannel,
    triggerDriftSimulation,
    triggerFailureSimulation,
    injectMockResponse,
    setIsSqliteModalOpen,
    setActiveTab,
    addToast,
  } = usePim();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast(`${label} copied to clipboard`, 'success');
    });
  };

  const handleHealthCheckAll = () => {
    addToast('Pinging all channel endpoints... Status: 2/2 Healthy (45ms SLA)', 'success');
  };

  const handleAddChannel = () => {
    addToast('Simulated Channel Wizard: WooCommerce & BigCommerce adapters available', 'info');
  };

  const onlineStore = channels.find((c) => c.code === 'CH-01') || channels[0];
  const marketplace = channels.find((c) => c.code === 'CH-02') || channels[1];

  return (
    <div className="flex-1 overflow-y-auto custom-scroll p-6 lg:p-8 space-y-6 bg-[#F8FAFC]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Connected Sales Channels</h1>
          <p className="text-sm text-[#475569] mt-0.5 max-w-3xl">
            Simulated external endpoints for catalog distribution, inventory replication, and schema mapping
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleHealthCheckAll}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px] text-[#475569]">health_and_safety</span>
            <span>Health Check All</span>
          </button>
          <button
            onClick={handleAddChannel}
            className="flex items-center gap-2 px-4 py-2 bg-[#4f46e5] hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Add Simulated Channel</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Bar (Bento-style row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-[#475569]">Total Connected Channels</div>
            <div className="text-xl text-[#0F172A] mt-1 font-bold">
              2 <span className="text-xs text-[#065F46] font-semibold">(2 active)</span>
            </div>
            <div className="text-[11px] font-mono text-[#94A3B8] mt-0.5">Both operational</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#4f46e5]">
            <span className="material-symbols-outlined text-[22px]">cable</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-[#475569]">Overall Sync Rate</div>
            <div className="text-xl text-[#0F172A] mt-1 font-bold">91.4%</div>
            <div className="text-[11px] font-mono text-[#475569] mt-0.5">279 / 296 SKU records aligned</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">data_check</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-[#475569]">Active Sync Workers</div>
            <div className="text-xl text-[#0F172A] mt-1 font-bold">
              2/2 <span className="text-xs text-[#065F46] font-semibold">running</span>
            </div>
            <div className="text-[11px] font-mono text-[#94A3B8] mt-0.5">Sub-process pooling: idle</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#475569]">
            <span className="material-symbols-outlined text-[22px]">memory</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-[#475569]">Pending Push Queue</div>
            <div className="text-xl text-[#92400E] mt-1 font-bold">12 items</div>
            <div className="text-[11px] font-mono text-[#92400E] mt-0.5">Marketplace batch queued</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">pending_actions</span>
          </div>
        </div>
      </div>

      {/* Channel Detailed Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel 1: Online Store */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            {/* Card Header */}
            <div className="p-6 border-b border-[#E2E8F0] bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
                    <span className="material-symbols-outlined text-[24px]">storefront</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#0F172A]">{onlineStore.name}</h2>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">
                        {onlineStore.code}
                      </span>
                    </div>
                    <p className="text-xs text-[#475569]">{onlineStore.subtitle}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                  <span>{onlineStore.statusText}</span>
                </div>
              </div>

              {/* Endpoint container */}
              <div className="mt-4 p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-[#475569]">
                  <span className="px-1.5 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#0F172A] font-bold text-[10px]">
                    GET/POST
                  </span>
                  <span className="font-mono text-[#0F172A] truncate">{onlineStore.endpoint}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(onlineStore.endpoint, 'Online Store endpoint')}
                  className="p-1 hover:text-[#0F172A] text-[#94A3B8] transition-colors cursor-pointer"
                  title="Copy Endpoint"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="p-6 border-b border-[#E2E8F0]">
              <div className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
                Sync &amp; Catalog Performance
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#F8FAFC] p-3 rounded border border-[#E2E8F0]">
                  <div className="text-[11px] font-mono text-[#475569]">Total Cataloged</div>
                  <div className="text-base text-[#0F172A] mt-1 font-bold">{onlineStore.totalCataloged}</div>
                  <div className="text-[10px] text-[#94A3B8]">products</div>
                </div>
                <div className="bg-[#ECFDF5]/50 p-3 rounded border border-[#A7F3D0]/60">
                  <div className="text-[11px] font-mono text-[#065F46]">Fully Synchronized</div>
                  <div className="text-base text-[#065F46] mt-1 font-bold">
                    {onlineStore.fullySynchronized}
                  </div>
                  <div className="text-[10px] text-[#065F46] font-medium">{onlineStore.accuracyRate} accuracy</div>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded border border-[#E2E8F0]">
                  <div className="text-[11px] font-mono text-[#475569]">Pending Updates</div>
                  <div className="text-base text-[#0F172A] mt-1 font-bold">{onlineStore.pendingUpdates}</div>
                  <div className="text-[10px] text-[#94A3B8]">products</div>
                </div>
                <div className="bg-[#FFF1F2]/50 p-3 rounded border border-[#FECDD3]/60">
                  <div className="text-[11px] font-mono text-[#9F1239]">Failed Dispatches</div>
                  <div className="text-base text-[#9F1239] mt-1 font-bold">
                    {onlineStore.failedDispatches}
                  </div>
                  <div className="text-[10px] text-[#9F1239] font-medium">product</div>
                </div>
              </div>

              {/* Last sync record */}
              <div className="mt-3.5 flex items-center gap-2 text-xs text-[#475569]">
                <span className="material-symbols-outlined text-[16px] text-[#059669]">schedule</span>
                <span>
                  Last Successful Sync:{' '}
                  <strong className="text-[#0F172A] font-semibold font-mono">
                    {onlineStore.lastSyncTime}
                  </strong>{' '}
                  <span className="text-[#94A3B8]">{onlineStore.lastSyncNote}</span>
                </span>
              </div>
            </div>

            {/* Mapped Channel Attributes */}
            <div className="p-6">
              <div className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2.5">
                Channel Attributes Mapped
              </div>
              <div className="flex flex-wrap gap-1.5">
                {onlineStore.mappedAttributes.map((attr, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-[11px] text-[#0F172A] flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                    {attr.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="p-4 bg-[#F8FAFC]/50 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => syncEntireChannel('ch-1')}
                className="px-3 py-1.5 bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold rounded shadow-sm transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span>Sync Entire Channel</span>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className="px-3 py-1.5 bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] text-xs font-semibold rounded shadow-xs transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-[#475569]">filter_list</span>
                <span>View Channel Products</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={triggerDriftSimulation}
                className="px-2.5 py-1.5 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1"
                title="Test Discrepancy Engine"
              >
                <span className="material-symbols-outlined text-[16px]">shuffle</span>
                <span>Simulate Channel Drift</span>
              </button>
            </div>
          </div>
        </div>

        {/* Channel 2: Marketplace */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            {/* Card Header */}
            <div className="p-6 border-b border-[#E2E8F0] bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
                    <span className="material-symbols-outlined text-[24px]">shopping_cart_checkout</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#0F172A]">{marketplace.name}</h2>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">
                        {marketplace.code}
                      </span>
                    </div>
                    <p className="text-xs text-[#475569]">{marketplace.subtitle}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                  <span>{marketplace.statusText}</span>
                </div>
              </div>

              {/* Endpoint container */}
              <div className="mt-4 p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-[#475569]">
                  <span className="px-1.5 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#0F172A] font-bold text-[10px]">
                    GET/POST
                  </span>
                  <span className="font-mono text-[#0F172A] truncate">{marketplace.endpoint}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(marketplace.endpoint, 'Marketplace endpoint')}
                  className="p-1 hover:text-[#0F172A] text-[#94A3B8] transition-colors cursor-pointer"
                  title="Copy Endpoint"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="p-6 border-b border-[#E2E8F0]">
              <div className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
                Sync &amp; Catalog Performance
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#F8FAFC] p-3 rounded border border-[#E2E8F0]">
                  <div className="text-[11px] font-mono text-[#475569]">Total Cataloged</div>
                  <div className="text-base text-[#0F172A] mt-1 font-bold">{marketplace.totalCataloged}</div>
                  <div className="text-[10px] text-[#94A3B8]">products</div>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded border border-[#E2E8F0]">
                  <div className="text-[11px] font-mono text-[#475569]">Fully Synchronized</div>
                  <div className="text-base text-[#0F172A] mt-1 font-bold">
                    {marketplace.fullySynchronized}
                  </div>
                  <div className="text-[10px] text-[#475569]">{marketplace.accuracyRate} accuracy</div>
                </div>
                <div className="bg-[#FFFBEB]/50 p-3 rounded border border-[#FDE68A]/60">
                  <div className="text-[11px] font-mono text-[#92400E]">Pending Updates</div>
                  <div className="text-base text-[#92400E] mt-1 font-bold">
                    {marketplace.pendingUpdates}
                  </div>
                  <div className="text-[10px] text-[#92400E] font-medium">Price &amp; Stock pending</div>
                </div>
                <div className="bg-[#FFF1F2]/50 p-3 rounded border border-[#FECDD3]/60">
                  <div className="text-[11px] font-mono text-[#9F1239]">Failed Discrepancies</div>
                  <div className="text-base text-[#9F1239] mt-1 font-bold">
                    {marketplace.failedDispatches}
                  </div>
                  <div className="text-[10px] text-[#9F1239] font-medium">products</div>
                </div>
              </div>

              {/* Last sync record */}
              <div className="mt-3.5 flex items-center gap-2 text-xs text-[#475569]">
                <span className="material-symbols-outlined text-[16px] text-[#94A3B8]">schedule</span>
                <span>
                  Last Successful Sync:{' '}
                  <strong className="text-[#0F172A] font-semibold font-mono">
                    {marketplace.lastSyncTime}
                  </strong>{' '}
                  <span className="text-[#92400E] font-medium">{marketplace.lastSyncNote}</span>
                </span>
              </div>
            </div>

            {/* Mapped Channel Attributes */}
            <div className="p-6">
              <div className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2.5">
                Channel Attributes Mapped
              </div>
              <div className="flex flex-wrap gap-1.5">
                {marketplace.mappedAttributes.map((attr, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded border font-mono text-[11px] flex items-center gap-1.5 ${
                      attr.hasWarning
                        ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E] font-medium'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        attr.hasWarning ? 'bg-[#D97706]' : 'bg-[#059669]'
                      }`}
                    />
                    {attr.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="p-4 bg-[#F8FAFC]/50 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => syncEntireChannel('ch-2')}
                className="px-3 py-1.5 bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold rounded shadow-sm transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                <span>Resolve &amp; Push All</span>
              </button>
              <button
                onClick={() => setActiveTab('discrepancies')}
                className="px-3 py-1.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-semibold rounded shadow-xs transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>View Discrepancy Queue</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={triggerFailureSimulation}
                className="px-2.5 py-1.5 text-[#9F1239] hover:bg-[#FFF1F2] text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1"
                title="Trigger 500 error mock"
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Simulate Failure Scenario</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics & Simulation Controls Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#475569]">
              <span className="material-symbols-outlined text-[22px]">troubleshoot</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Channel Integration Diagnostics &amp; Simulation Controls
              </h3>
              <p className="text-xs text-[#475569]">
                Inspect simulated latency, HTTP status response codes, and active SQLite replica tables.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#94A3B8]">
              Engine: SQLite Core v3.42 (In-Memory Shadow)
            </span>
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
          </div>
        </div>

        {/* 3-Column Diagnostic Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Col 1: Simulated Latency Sliders & Mock Controls */}
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0F172A]">Simulated Network Latency</span>
              <span className="text-xs font-mono font-bold text-[#4f46e5] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                {latencyMs} ms
              </span>
            </div>
            <div>
              <input
                type="range"
                min="10"
                max="1200"
                value={latencyMs}
                onChange={(e) => setLatencyMs(Number(e.target.value))}
                className="w-full accent-[#4f46e5] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8] mt-1 font-mono">
                <span>10ms (Local)</span>
                <span>300ms (Global)</span>
                <span>1200ms (Throttled)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
              <div className="text-[11px] font-semibold text-[#475569] uppercase">
                Mock Failure Injectors
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => injectMockResponse(200)}
                  className="px-2.5 py-1 text-xs font-mono font-semibold rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] hover:opacity-90 transition-opacity cursor-pointer"
                >
                  200 OK Normal
                </button>
                <button
                  onClick={() => injectMockResponse(429)}
                  className="px-2.5 py-1 text-xs font-mono font-semibold rounded bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] hover:opacity-90 transition-opacity cursor-pointer"
                >
                  429 Rate Limit
                </button>
                <button
                  onClick={() => injectMockResponse(500)}
                  className="px-2.5 py-1 text-xs font-mono font-semibold rounded bg-[#FFF1F2] border border-[#FECDD3] text-[#9F1239] hover:opacity-90 transition-opacity cursor-pointer"
                >
                  500 Gateway Err
                </button>
              </div>
            </div>
          </div>

          {/* Col 2: HTTP Status Telemetry Logs */}
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0F172A]">HTTP Telemetry Stream</span>
              <span className="text-[11px] font-mono text-[#065F46] flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                LIVE STREAM
              </span>
            </div>
            <div className="bg-[#0B0F19] rounded p-3 font-mono text-[11px] text-slate-300 space-y-1.5 h-36 overflow-y-auto custom-scroll border border-slate-800">
              {telemetryLogs.map((entry) => {
                let colorClass = 'text-slate-300';
                if (entry.type === 'success') colorClass = 'text-emerald-400';
                else if (entry.type === 'warning') colorClass = 'text-amber-400';
                else if (entry.type === 'error') colorClass = 'text-rose-400';

                return (
                  <div key={entry.id} className={colorClass}>
                    <span className="text-slate-500 mr-1.5">{entry.time}</span>
                    {entry.message}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Col 3: SQLite Replica State Summary */}
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0F172A]">SQLite Replica State</span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#CBD5E1] text-[#475569]">
                schema_v2
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-[#E2E8F0]">
                <span className="font-mono text-[11px] text-[#0F172A]">channel_storefront_replica</span>
                <span className="text-[11px] font-semibold text-[#475569]">148 rows (2.4 MB)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#E2E8F0]">
                <span className="font-mono text-[11px] text-[#0F172A]">channel_marketplace_replica</span>
                <span className="text-[11px] font-semibold text-[#475569]">148 rows (3.1 MB)</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="font-mono text-[11px] text-[#475569]">sync_transaction_audit</span>
                <span className="text-[11px] font-semibold text-[#94A3B8]">1,492 rows (Active WAL)</span>
              </div>
            </div>
            <button
              onClick={() => setIsSqliteModalOpen(true)}
              className="w-full mt-2 py-1.5 rounded bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[15px] text-[#475569]">database</span>
              <span>Inspect Raw SQLite Tables</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
