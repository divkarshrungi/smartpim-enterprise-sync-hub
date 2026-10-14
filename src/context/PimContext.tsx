import React, { createContext, useContext, useEffect, useState } from 'react';
import { productsApi, type ApiProduct } from '../services/api';
import {
  Product,
  ChannelInfo,
  DiscrepancyItem,
  SyncLogItem,
  TelemetryLogEntry,
  ToastMessage,
  NavTab,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CHANNELS,
  INITIAL_DISCREPANCIES,
  INITIAL_SYNC_LOGS,
  INITIAL_TELEMETRY,
} from '../data/mockData';

interface PimContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  mockMode: boolean;
  setMockMode: (val: boolean) => void;
  latencyMs: number;
  setLatencyMs: (val: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  products: Product[];
  channels: ChannelInfo[];
  discrepancies: DiscrepancyItem[];
  syncLogs: SyncLogItem[];
  telemetryLogs: TelemetryLogEntry[];
  toasts: ToastMessage[];

  // Selected for drawers
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  isProductDrawerOpen: boolean;
  setIsProductDrawerOpen: (open: boolean) => void;

  inspectingLog: SyncLogItem | null;
  setInspectingLog: (log: SyncLogItem | null) => void;

  inspectingProductDetails: Product | null;
  setInspectingProductDetails: (product: Product | null) => void;

  isSqliteModalOpen: boolean;
  setIsSqliteModalOpen: (open: boolean) => void;

  isPrecedenceModalOpen: boolean;
  setIsPrecedenceModalOpen: (open: boolean) => void;

  isPipelineModalOpen: boolean;
  setIsPipelineModalOpen: (open: boolean) => void;

  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;

  isSyncingAll: boolean;

  // Actions
  addToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info', title?: string) => void;
  removeToast: (id: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'masterId' | 'lastModified'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  syncSingleProduct: (sku: string, channelName?: string) => void;
  syncAllChannels: () => void;
  syncEntireChannel: (channelId: string) => void;
  resolveDiscrepancy: (id: string) => void;
  resolveAllSafeDiscrepancies: () => void;
  scanAllForDrift: () => void;
  retrySyncLog: (id: string) => void;
  retryAllFailedLogs: () => void;
  clearNonErrorLogs: () => void;
  triggerDriftSimulation: () => void;
  triggerFailureSimulation: () => void;
  injectMockResponse: (statusCode: 200 | 429 | 500) => void;
  addTelemetryLog: (type: TelemetryLogEntry['type'], message: string) => void;
}

const PimContext = createContext<PimContextType | undefined>(undefined);
const mapApiProduct = (item: ApiProduct): Product => {
  const existing = INITIAL_PRODUCTS.find((p) => p.sku === item.sku);

  return {
    id: String(item.id),
    sku: item.sku,
    masterId: existing?.masterId ?? `PIM-${item.id}`,
    name: item.name,
    brand: item.brand || existing?.brand || 'Generic',
    category: item.category || existing?.category || 'Uncategorized',
    price: Number(item.price),
    stock: Number(item.stock),
    description: item.description || existing?.description || '',
    attributes: Array.isArray(item.attributes)
      ? (item.attributes as Product['attributes'])
      : existing?.attributes ?? [],
    channelPresence: existing?.channelPresence ?? {
      onlineStore: { status: 'synced', statusLabel: 'Synchronized' },
      marketplace: { status: 'synced', statusLabel: 'Synchronized' },
    },
    dispatchTargets: existing?.dispatchTargets ?? {
      onlineStore: true,
      marketplace: true,
    },
    imageUrl: existing?.imageUrl ?? '',
    imageAlt: existing?.imageAlt ?? item.name,
    lastModified: existing?.lastModified ?? 'From database',
  };
};

export const PimProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mockMode, setMockMode] = useState<boolean>(true);
  const [latencyMs, setLatencyMs] = useState<number>(45);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [channels, setChannels] = useState<ChannelInfo[]>(INITIAL_CHANNELS);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyItem[]>(INITIAL_DISCREPANCIES);
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>(INITIAL_SYNC_LOGS);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLogEntry[]>(INITIAL_TELEMETRY);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState<boolean>(false);
  const [inspectingLog, setInspectingLog] = useState<SyncLogItem | null>(null);
  const [inspectingProductDetails, setInspectingProductDetails] = useState<Product | null>(null);

  const [isSqliteModalOpen, setIsSqliteModalOpen] = useState<boolean>(false);
  const [isPrecedenceModalOpen, setIsPrecedenceModalOpen] = useState<boolean>(false);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);

  const addToast = (
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'success',
    title?: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, message, type, title };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };
  useEffect(() => {
  const loadProducts = async () => {
    try {
      const databaseProducts = await productsApi.getAll();
      setProducts(databaseProducts.map(mapApiProduct));
      addTelemetryLog(
        'success',
        '[Database] Products loaded from SQLite',
      );
    } catch (error) {
      console.error('Failed to load database products:', error);
      addToast(
        'Could not load products from the database. Check that the backend is running.',
        'error',
      );
    }
  };

  loadProducts();
}, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addTelemetryLog = (type: TelemetryLogEntry['type'], message: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newEntry: TelemetryLogEntry = {
      id: `tel-${Date.now()}`,
      time: timeStr,
      type,
      message,
    };
    setTelemetryLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
  };

  const addProduct = async (
  productData: Omit<Product, 'id' | 'masterId' | 'lastModified'>
) => {
  try {
    const saved = await productsApi.create({
      sku: productData.sku,
      name: productData.name,
      category: productData.category,
      brand: productData.brand,
      price: productData.price,
      stock: productData.stock,
      description: productData.description,
      attributes: productData.attributes,
    });

    const newProduct = mapApiProduct(saved);

    setProducts((prev) => [newProduct, ...prev]);

    addTelemetryLog(
      'success',
      `[Database] Product created: ${newProduct.sku}`
    );

    addToast(
      `Product ${newProduct.sku} saved to the database`,
      'success'
    );
  } catch (error) {
    console.error('Product creation failed:', error);

    addToast(
      error instanceof Error ? error.message : 'Could not create product',
      'error'
    );
  }
};

  
const updateProduct = async (
  id: string,
  updates: Partial<Product>
) => {
  try {
    const saved = await productsApi.update(id, {
      name: updates.name,
      sku: updates.sku,
      category: updates.category,
      brand: updates.brand,
      price: updates.price,
      stock: updates.stock,
      description: updates.description,
      attributes: updates.attributes,
    });

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...mapApiProduct(saved),
              ...updates,
              id: String(saved.id),
              lastModified: 'Just now',
            }
          : p
      )
    );

    addTelemetryLog(
      'success',
      `[Database] Product ${id} updated`
    );

    addToast('Product updated and saved to SQLite', 'success');
  } catch (error) {
    console.error('Product update failed:', error);

    addToast(
      error instanceof Error ? error.message : 'Could not update product',
      'error'
    );
  }
};


  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDiscrepancies((prev) => prev.filter((d) => d.sku !== target.sku));
    addTelemetryLog('warning', `[Catalog-Core] SKU ${target.sku} purged from catalog`);
    addToast(`Product ${target.sku} removed from catalog`, 'info');
  };

  const syncSingleProduct = (sku: string, channelName?: string) => {
    const prod = products.find((p) => p.sku === sku);
    if (!prod) return;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku !== sku) return p;
        return {
          ...p,
          channelPresence: {
            onlineStore: { status: 'synced', statusLabel: 'Synchronized' },
            marketplace: { status: 'synced', statusLabel: 'Synchronized' },
          },
          lastModified: 'Just now',
        };
      })
    );

    setDiscrepancies((prev) => prev.filter((d) => d.sku !== sku));

    const timeStr = new Date().toTimeString().split(' ')[0];
    const logId = `LOG-${Math.floor(9830 + Math.random() * 50)}`;
    const newLog: SyncLogItem = {
      id: logId,
      timestampTime: timeStr,
      timestampDate: 'Today',
      sku: prod.sku,
      productName: prod.name,
      targetChannel: channelName === 'Marketplace' ? 'Marketplace' : 'Online Store',
      operationType: 'Full Publish',
      status: 'SUCCESS 200',
      statusCode: 200,
      errorTitle: 'Product attributes synchronized with channel replica',
      errorTrace: 'manual_reconciliation=success',
      attempts: '1 / 1',
      payload: {
        action: 'FORCE_CHANNEL_SYNC',
        sku: prod.sku,
        name: prod.name,
        price: prod.price,
        stock: prod.stock,
      },
    };
    setSyncLogs((prev) => [newLog, ...prev]);
    addTelemetryLog('success', `[Manual-Sync] SKU ${sku} successfully reconciled`);
    addToast(`SKU ${sku} reconciled across all target channels`, 'success');
  };

  const syncAllChannels = () => {
    setIsSyncingAll(true);
    addTelemetryLog('info', '[Bulk-Sync] Triggered global catalog reconciliation sweep');
    addToast('Reconciling catalog across 2 channels...', 'info');

    setTimeout(() => {
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          channelPresence: {
            onlineStore: { status: 'synced', statusLabel: 'Synchronized' },
            marketplace: { status: 'synced', statusLabel: 'Synchronized' },
          },
          lastModified: 'Just now',
        }))
      );

      setChannels((prev) =>
        prev.map((c) => ({
          ...c,
          status: 'healthy',
          statusText: 'Connected & Synchronized',
          fullySynchronized: c.totalCataloged,
          pendingUpdates: 0,
          failedDispatches: 0,
          accuracyRate: '100.0%',
          lastSyncTime: 'Just now',
        }))
      );

      setDiscrepancies([]);

      setSyncLogs((prev) =>
        prev.map((log) => {
          if (log.status.includes('FAILED')) {
            return {
              ...log,
              status: 'SUCCESS 200',
              statusCode: 200,
              errorTitle: 'Bulk reconciliation cleared failure state',
              errorTrace: 'bulk_reconciled=true',
            };
          }
          return log;
        })
      );

      setIsSyncingAll(false);
      addTelemetryLog('success', '[Bulk-Sync] All channels in full parity with Central PIM');
      addToast('Sync Complete: 148 products aligned with zero discrepancies', 'success');
    }, 1200);
  };

  const syncEntireChannel = (channelId: string) => {
    const ch = channels.find((c) => c.id === channelId);
    if (!ch) return;

    addToast(`Dispatching full sync to ${ch.name}...`, 'info');
    setTimeout(() => {
      setChannels((prev) =>
        prev.map((c) =>
          c.id === channelId
            ? {
                ...c,
                status: 'healthy',
                statusText: 'Connected & Synchronized',
                fullySynchronized: c.totalCataloged,
                pendingUpdates: 0,
                failedDispatches: 0,
                accuracyRate: '100%',
                lastSyncTime: 'Just now',
              }
            : c
        )
      );
      setDiscrepancies((prev) =>
        prev.filter((d) => (ch.name === 'Online Store' ? d.channel !== 'Online Store' : d.channel !== 'Marketplace'))
      );
      addTelemetryLog('success', `[Channel-Sync] ${ch.name} reached 100% catalog parity`);
      addToast(`${ch.name} synchronized successfully`, 'success');
    }, 800);
  };

  const resolveDiscrepancy = (id: string) => {
    const item = discrepancies.find((d) => d.id === id);
    if (!item) return;

    setDiscrepancies((prev) => prev.filter((d) => d.id !== id));
    addTelemetryLog('success', `[Discrepancy-Resolver] Resolved ${item.fieldName} mismatch on ${item.sku}`);
    addToast(`Discrepancy for ${item.sku} pushed to ${item.channel}`, 'success');
  };

  const resolveAllSafeDiscrepancies = () => {
    const safeCount = discrepancies.filter((d) => d.severity !== 'High').length;
    setDiscrepancies((prev) => prev.filter((d) => d.severity === 'High'));
    addTelemetryLog('success', `[Batch-Resolver] Safely auto-resolved ${safeCount} field mappings`);
    addToast(`Auto-resolved ${safeCount} safe discrepancies`, 'success');
  };

  const scanAllForDrift = () => {
    addToast('Scanning all channel replica tables for drift...', 'info');
    setTimeout(() => {
      addTelemetryLog('info', '[Drift-Scanner] Schema comparison scan completed across 2 channels');
      addToast('Scan complete: 11 discrepancy records active', 'warning');
    }, 600);
  };

  const retrySyncLog = (id: string) => {
    setSyncLogs((prev) =>
      prev.map((log) => {
        if (log.id !== id) return log;
        return {
          ...log,
          status: 'SUCCESS 200',
          statusCode: 200,
          errorTitle: 'Manual retry succeeded: Payload acknowledged by upstream',
          errorTrace: 'ack_resolved=true',
        };
      })
    );
    addTelemetryLog('success', `[Dispatcher-Retry] Transaction ${id} re-delivered with HTTP 200`);
    addToast(`Request #${id} reconciled & re-delivered`, 'success');
  };

  const retryAllFailedLogs = () => {
    const failedCount = syncLogs.filter((l) => l.status.includes('FAILED')).length;
    setSyncLogs((prev) =>
      prev.map((l) => ({
        ...l,
        status: 'SUCCESS 200',
        statusCode: 200,
        errorTitle: 'Manual batch retry cleared failure state',
        errorTrace: 'ack_batch_resolved=true',
      }))
    );
    addTelemetryLog('success', `[Dispatcher] Re-sent ${failedCount} failed events successfully`);
    addToast(`Bulk reconciliation complete: ${failedCount} failed events resolved`, 'success');
  };

  const clearNonErrorLogs = () => {
    const cleared = syncLogs.filter((l) => l.status.includes('SUCCESS')).length;
    setSyncLogs((prev) => prev.filter((l) => !l.status.includes('SUCCESS')));
    addToast(`Cleaned ${cleared} resolved entries from active audit viewport`, 'info');
  };

  const triggerDriftSimulation = () => {
    // Inject synthetic drift
    const timeStr = new Date().toTimeString().split(' ')[0];
    const newDisc: DiscrepancyItem = {
      id: `disc-${Date.now()}`,
      sku: 'SKU-4412',
      productName: 'Logitech MX Master 3S',
      channel: 'Marketplace',
      fieldName: 'Stock Count',
      pimMasterValue: '160 units',
      channelValue: '142 units',
      deltaText: '-18 drift',
      riskText: 'Inventory discrepancy detected in secondary marketplace warehouse',
      driftAge: 'Just now',
      severity: 'Medium',
    };

    setDiscrepancies((prev) => [newDisc, ...prev]);

    setChannels((prev) =>
      prev.map((c) =>
        c.code === 'CH-02'
          ? {
              ...c,
              status: 'drift',
              statusText: 'Data Drift Detected',
              pendingUpdates: c.pendingUpdates + 1,
            }
          : c
      )
    );

    addTelemetryLog('warning', `[Drift-Engine] Injected synthetic price & inventory variance (+1 SKU)`);
    addToast('Simulated synthetic channel drift injected (+1 discrepancy generated)', 'warning');
  };

  const triggerFailureSimulation = () => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const newLog: SyncLogItem = {
      id: `LOG-${Math.floor(9850 + Math.random() * 50)}`,
      timestampTime: timeStr,
      timestampDate: 'Today',
      sku: 'SKU-5190',
      productName: 'Dell UltraSharp 27" 4K Monitor',
      targetChannel: 'Marketplace',
      operationType: 'Price & Stock',
      status: 'FAILED 500',
      statusCode: 500,
      errorTitle: 'Mock-Hook: 500 Internal Server Error (Gateway Timeout)',
      errorTrace: 'simulated_circuit_breaker=open',
      attempts: '3 / 3 (Exhausted)',
      payload: {
        action: 'TRIGGER_SIMULATED_FAIL',
        code: 500,
        simulated: true,
      },
    };

    setSyncLogs((prev) => [newLog, ...prev]);
    addTelemetryLog('error', `[Mock-Hook] 500 Internal Server Error: Gateway timeout from endpoint`);
    addToast('Simulated failure scenario triggered (HTTP 500 injected)', 'error');
  };

  const injectMockResponse = (code: 200 | 429 | 500) => {
    if (code === 200) {
      addTelemetryLog('success', `[Manual-Test] Response 200 OK - Health Verified`);
      addToast('Injected 200 OK test response', 'success');
    } else if (code === 429) {
      addTelemetryLog('warning', `[Manual-Test] Response 429 Too Many Requests - Circuit breaker armed`);
      addToast('Injected 429 Rate Limit test response', 'warning');
    } else {
      addTelemetryLog('error', `[Manual-Test] Response 500 Server Error - Failed batch rollback`);
      addToast('Injected 500 Gateway Error test response', 'error');
    }
  };

  return (
    <PimContext.Provider
      value={{
        activeTab,
        setActiveTab,
        mockMode,
        setMockMode,
        latencyMs,
        setLatencyMs,
        searchQuery,
        setSearchQuery,
        products,
        channels,
        discrepancies,
        syncLogs,
        telemetryLogs,
        toasts,
        editingProduct,
        setEditingProduct,
        isProductDrawerOpen,
        setIsProductDrawerOpen,
        inspectingLog,
        setInspectingLog,
        inspectingProductDetails,
        setInspectingProductDetails,
        isSqliteModalOpen,
        setIsSqliteModalOpen,
        isPrecedenceModalOpen,
        setIsPrecedenceModalOpen,
        isPipelineModalOpen,
        setIsPipelineModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        isSyncingAll,
        addToast,
        removeToast,
        addProduct,
        updateProduct,
        deleteProduct,
        syncSingleProduct,
        syncAllChannels,
        syncEntireChannel,
        resolveDiscrepancy,
        resolveAllSafeDiscrepancies,
        scanAllForDrift,
        retrySyncLog,
        retryAllFailedLogs,
        clearNonErrorLogs,
        triggerDriftSimulation,
        triggerFailureSimulation,
        injectMockResponse,
        addTelemetryLog,
      }}
    >
      {children}
    </PimContext.Provider>
  );
};

export const usePim = () => {
  const context = useContext(PimContext);
  if (!context) {
    throw new Error('usePim must be used within a PimProvider');
  }
  return context;
};
