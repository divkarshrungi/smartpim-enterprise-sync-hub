import React from 'react';
import { usePim } from '../../context/PimContext';

export const ProductDetailModal: React.FC = () => {
  const {
    inspectingProductDetails,
    setInspectingProductDetails,
    setEditingProduct,
    setIsProductDrawerOpen,
    syncSingleProduct,
  } = usePim();

  if (!inspectingProductDetails) return null;

  const product = inspectingProductDetails;

  const handleEdit = () => {
    setEditingProduct(product);
    setInspectingProductDetails(null);
    setIsProductDrawerOpen(true);
  };

  const handleSync = () => {
    syncSingleProduct(product.sku);
    setInspectingProductDetails(null);
  };

  return (
    <div
      className="fixed inset-0 bg-[#0F172A]/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) setInspectingProductDetails(null);
      }}
    >
      <div className="bg-white border border-[#CBD5E1] rounded-xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <img
              src={product.imageUrl}
              alt={product.imageAlt}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded object-cover border border-[#E2E8F0] bg-slate-100 flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#0F172A] line-clamp-1">{product.name}</h2>
                <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-[#3525cd]">
                  {product.sku}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">Master ID: {product.masterId}</p>
            </div>
          </div>
          <button
            onClick={() => setInspectingProductDetails(null)}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">Master Price</span>
              <div className="font-mono text-sm font-bold text-[#0F172A]">${product.price.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">Stock Level</span>
              <div className="font-mono text-sm font-bold text-[#0F172A]">{product.stock} units</div>
            </div>
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">Category</span>
              <div className="font-medium text-[#475569]">{product.category}</div>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#0F172A] block mb-1">Description</span>
            <p className="text-xs text-[#475569] leading-relaxed bg-white border border-[#E2E8F0] p-2.5 rounded-lg">
              {product.description || 'No description entered.'}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#0F172A] block mb-1">Attribute Chips</span>
            <div className="flex flex-wrap gap-1.5">
              {product.attributes?.map((attr) => (
                <span
                  key={attr.id}
                  className="px-2.5 py-1 rounded bg-[#F1F5F9] border border-[#CBD5E1] text-[11px] font-medium text-[#0F172A]"
                >
                  {attr.label}: {attr.value}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#0F172A] block mb-1">Channel Reconciled Status</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded border border-[#E2E8F0] bg-white flex items-center justify-between">
                <span>Online Store:</span>
                <span className="font-semibold text-[#065F46] font-mono">
                  {product.channelPresence.onlineStore.status.toUpperCase()}
                </span>
              </div>
              <div className="p-2.5 rounded border border-[#E2E8F0] bg-white flex items-center justify-between">
                <span>Marketplace:</span>
                <span className="font-semibold text-[#92400E] font-mono">
                  {product.channelPresence.marketplace.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center text-xs">
          <button
            onClick={handleEdit}
            className="px-3.5 py-1.5 rounded border border-[#CBD5E1] bg-white text-[#0F172A] font-semibold hover:bg-[#F1F5F9] cursor-pointer"
          >
            Edit in Drawer
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInspectingProductDetails(null)}
              className="px-3 py-1.5 text-[#475569] hover:underline"
            >
              Close
            </button>
            <button
              onClick={handleSync}
              className="px-4 py-1.5 rounded bg-[#4f46e5] text-white font-semibold hover:bg-indigo-700 cursor-pointer"
            >
              Force Sync Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
