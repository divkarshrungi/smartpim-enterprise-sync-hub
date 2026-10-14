import React from 'react';
import { PimProvider, usePim } from './context/PimContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { ToastContainer } from './components/layout/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { ChannelsView } from './components/channels/ChannelsView';
import { DiscrepanciesView } from './components/discrepancies/DiscrepanciesView';
import { SyncLogsView } from './components/sync-logs/SyncLogsView';
import { ProductDrawer } from './components/products/ProductDrawer';
import { PayloadInspectorModal } from './components/sync-logs/PayloadInspectorModal';
import { RawSqliteModal } from './components/channels/RawSqliteModal';
import { PrecedenceModal } from './components/discrepancies/PrecedenceModal';
import { PipelineInfoModal } from './components/modals/PipelineInfoModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ProductDetailModal } from './components/modals/ProductDetailModal';

const AppContent: React.FC = () => {
  const { activeTab } = usePim();

  return (
    <div className="h-full flex overflow-hidden bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      {/* 1. Persistent Fixed Sidebar */}
      <Sidebar />

      {/* 2. Main Viewport Container */}
      <div className="flex-1 ml-64 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader />

        {/* Dynamic View Router */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'channels' && <ChannelsView />}
          {activeTab === 'discrepancies' && <DiscrepanciesView />}
          {activeTab === 'syncLogs' && <SyncLogsView />}
        </main>
      </div>

      {/* 3. Global Slide-out Drawers & Modals */}
      <ProductDrawer />
      <PayloadInspectorModal />
      <RawSqliteModal />
      <PrecedenceModal />
      <PipelineInfoModal />
      <SettingsModal />
      <ProductDetailModal />

      {/* 4. Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <PimProvider>
      <AppContent />
    </PimProvider>
  );
}
