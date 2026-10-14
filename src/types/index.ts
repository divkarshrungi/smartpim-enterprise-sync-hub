export type NavTab = 'dashboard' | 'products' | 'channels' | 'discrepancies' | 'syncLogs';

export type SyncStatusType = 'synced' | 'discrepancy' | 'failed' | 'pending';

export interface ChannelPresence {
  onlineStore: {
    status: SyncStatusType;
    statusLabel?: string;
    details?: string;
  };
  marketplace: {
    status: SyncStatusType;
    statusLabel?: string;
    details?: string;
    price?: number;
    stock?: number;
  };
}

export interface ProductAttribute {
  id: string;
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  masterId: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  attributes: ProductAttribute[];
  channelPresence: ChannelPresence;
  dispatchTargets: {
    onlineStore: boolean;
    marketplace: boolean;
  };
  imageUrl: string;
  imageAlt: string;
  lastModified: string;
}

export interface ChannelInfo {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  endpoint: string;
  status: 'healthy' | 'drift' | 'error';
  statusText: string;
  latencyMs: number;
  totalCataloged: number;
  fullySynchronized: number;
  accuracyRate: string;
  pendingUpdates: number;
  failedDispatches: number;
  lastSyncTime: string;
  lastSyncNote: string;
  mappedAttributes: { name: string; hasWarning?: boolean }[];
}

export interface DiscrepancyItem {
  id: string;
  sku: string;
  productName: string;
  channel: 'Online Store' | 'Marketplace';
  fieldName: 'Price' | 'Stock Count' | 'Product Name' | 'Color Attribute' | 'Category';
  pimMasterValue: string;
  channelValue: string;
  deltaText: string;
  riskText: string;
  driftAge: string;
  severity: 'High' | 'Medium' | 'Low';
  isResolved?: boolean;
}

export interface SyncLogItem {
  id: string;
  timestampTime: string;
  timestampDate: string;
  sku: string;
  productName: string;
  targetChannel: 'Online Store' | 'Marketplace';
  operationType: 'Stock Update' | 'Price Update' | 'Full Publish' | 'Attribute Sync' | 'Price & Stock';
  status: 'SUCCESS 200' | 'FAILED 500' | 'FAILED 422' | 'FAILED 429';
  statusCode: number;
  errorTitle: string;
  errorTrace: string;
  attempts: string;
  responseTraceId?: string;
  retryAfterSec?: number;
  payload: Record<string, unknown>;
}

export interface TelemetryLogEntry {
  id: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}
