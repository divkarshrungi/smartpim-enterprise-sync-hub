import React, { useState } from 'react';
import { usePim } from '../../context/PimContext';

export const RawSqliteModal: React.FC = () => {
  const { isSqliteModalOpen, setIsSqliteModalOpen, products, channels, addToast } = usePim();
  const [selectedTable, setSelectedTable] = useState<'storefront' | 'marketplace' | 'audit'>('storefront');

  if (!isSqliteModalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#0F172A]/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsSqliteModalOpen(false);
      }}
    >
      <div className="bg-white border border-[#CBD5E1] rounded-xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4f46e5]">
              <span className="material-symbols-outlined text-[20px]">database</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">In-Memory SQLite Replica Schema Inspector</h2>
              <p className="text-xs text-[#475569]">Direct read query on simulated shadow storage tables (schema_v2.sqlite)</p>
            </div>
          </div>
          <button
            onClick={() => setIsSqliteModalOpen(false)}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Table Selector Tabs */}
        <div className="px-6 py-2.5 border-b border-[#E2E8F0] bg-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTable('storefront')}
              className={`px-3 py-1.5 rounded font-mono font-medium cursor-pointer transition-colors ${
                selectedTable === 'storefront'
                  ? 'bg-[#4f46e5] text-white shadow-xs'
                  : 'bg-[#F1F5F9] text-[#475569] hover:bg-slate-200'
              }`}
            >
              channel_storefront_replica (148 rows)
            </button>
            <button
              onClick={() => setSelectedTable('marketplace')}
              className={`px-3 py-1.5 rounded font-mono font-medium cursor-pointer transition-colors ${
                selectedTable === 'marketplace'
                  ? 'bg-[#4f46e5] text-white shadow-xs'
                  : 'bg-[#F1F5F9] text-[#475569] hover:bg-slate-200'
              }`}
            >
              channel_marketplace_replica (148 rows)
            </button>
            <button
              onClick={() => setSelectedTable('audit')}
              className={`px-3 py-1.5 rounded font-mono font-medium cursor-pointer transition-colors ${
                selectedTable === 'audit'
                  ? 'bg-[#4f46e5] text-white shadow-xs'
                  : 'bg-[#F1F5F9] text-[#475569] hover:bg-slate-200'
              }`}
            >
              sync_transaction_audit (WAL mode)
            </button>
          </div>
          <span className="text-[11px] font-mono text-[#059669] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            PRAGMA integrity_check: OK
          </span>
        </div>

        {/* Table Content */}
        <div className="p-6 overflow-y-auto custom-scroll flex-1 space-y-4">
          <div className="bg-[#0B0F19] text-slate-200 rounded-lg p-3 font-mono text-xs overflow-x-auto custom-scroll border border-slate-800">
            <span className="text-emerald-400">sqlite&gt;</span> SELECT id, sku, channel_price, inventory_on_hand, sync_hash, last_ack FROM {selectedTable === 'storefront' ? 'channel_storefront_replica' : selectedTable === 'marketplace' ? 'channel_marketplace_replica' : 'sync_transaction_audit'} LIMIT 6;
          </div>

          <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] text-[#475569]">
                  <th className="p-2.5">id</th>
                  <th className="p-2.5">sku</th>
                  <th className="p-2.5">channel_price</th>
                  <th className="p-2.5">inventory_on_hand</th>
                  <th className="p-2.5">sync_hash</th>
                  <th className="p-2.5">last_ack</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[11px]">
                {products.slice(0, 6).map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-2.5 text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-[#3525cd]">{p.sku}</td>
                    <td className="p-2.5">
                      ${selectedTable === 'marketplace' && p.channelPresence.marketplace.price
                        ? p.channelPresence.marketplace.price.toFixed(2)
                        : p.price.toFixed(2)}
                    </td>
                    <td className="p-2.5">{p.stock}</td>
                    <td className="p-2.5 text-slate-400 truncate max-w-[120px]">
                      hash_{p.sku.toLowerCase()}_{idx * 17 + 42}f
                    </td>
                    <td className="p-2.5 text-emerald-600">2025-05-18 14:32:05</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">Memory usage: 5.5MB | Read-only sandbox</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                addToast('PRAGMA vacuum complete: SQLite shadow database optimized', 'success');
              }}
              className="px-3 py-1.5 rounded border border-[#CBD5E1] bg-white text-[#0F172A] font-semibold hover:bg-[#F1F5F9] cursor-pointer"
            >
              VACUUM &amp; Reindex
            </button>
            <button
              onClick={() => setIsSqliteModalOpen(false)}
              className="px-4 py-1.5 rounded bg-[#4f46e5] text-white font-semibold hover:bg-indigo-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
