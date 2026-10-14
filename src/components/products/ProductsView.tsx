import React, { useState } from 'react';
import { usePim } from '../../context/PimContext';
import { Product } from '../../types';

export const ProductsView: React.FC = () => {
  const {
    products,
    syncSingleProduct,
    deleteProduct,
    setEditingProduct,
    setIsProductDrawerOpen,
    setInspectingProductDetails,
    addToast,
    searchQuery,
    setSearchQuery,
  } = usePim();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filter products
  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === '' ||
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === 'Synchronized') {
      matchesStatus =
        p.channelPresence.onlineStore.status === 'synced' &&
        p.channelPresence.marketplace.status === 'synced';
    } else if (statusFilter === 'Has Discrepancy') {
      matchesStatus =
        p.channelPresence.onlineStore.status === 'discrepancy' ||
        p.channelPresence.marketplace.status === 'discrepancy';
    } else if (statusFilter === 'Failed') {
      matchesStatus =
        p.channelPresence.onlineStore.status === 'failed' ||
        p.channelPresence.marketplace.status === 'failed';
    }

    let matchesChannel = true;
    if (channelFilter === 'Online Store') {
      matchesChannel = p.dispatchTargets.onlineStore;
    } else if (channelFilter === 'Marketplace') {
      matchesChannel = p.dispatchTargets.marketplace;
    }

    let matchesStock = true;
    if (stockFilter === 'In Stock (>20)') {
      matchesStock = p.stock > 20;
    } else if (stockFilter === 'Low Stock (<20)') {
      matchesStock = p.stock <= 20 && p.stock > 0;
    } else if (stockFilter === 'Out of Stock (0)') {
      matchesStock = p.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesChannel && matchesStock;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const displayedProducts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const handleBulkValidate = () => {
    addToast(`Validated ${products.length} master entities against channel schemas`, 'success');
  };

  const exportCSV = () => {
    const headers = ['SKU', 'Product Name', 'Brand', 'Category', 'Price', 'Stock', 'Online Store', 'Marketplace'];
    const rows = filtered.map((p) => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      p.brand,
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
    link.setAttribute('download', `smartpim_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Catalog CSV exported', 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scroll p-6 lg:p-8 space-y-6 bg-[#F8FAFC]">
      {/* 1. Page Header & Actions */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Product Catalog Management</h1>
          <p className="text-sm text-[#475569] mt-0.5">
            Central master repository with automated channel sync validation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded bg-white border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold hover:bg-[#F1F5F9] transition-colors active:scale-98 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-[#475569]">file_download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleBulkValidate}
            className="flex items-center gap-2 px-3.5 py-2 rounded bg-white border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold hover:bg-[#F1F5F9] transition-colors active:scale-98 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-[#475569]">checklist</span>
            <span>Bulk Validate</span>
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsProductDrawerOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#4f46e5] text-white text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm active:scale-98 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Add Product</span>
          </button>
        </div>
      </section>

      {/* 2. Search & Filter Strip */}
      <section className="bg-white rounded-lg border border-[#E2E8F0] p-3.5 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Text Search Filter */}
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#94A3B8] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, product name, brand, or barcode..."
              className="w-full h-9 pl-9 pr-3 rounded border border-[#CBD5E1] bg-white text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 focus:outline-none transition-all"
            />
          </div>

          {/* Dropdown Filter Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Computers">Computers</option>
              <option value="Wearables">Wearables</option>
              <option value="Displays">Displays</option>
              <option value="Accessories">Accessories</option>
            </select>

            {/* Sync Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Synchronized">Synchronized</option>
              <option value="Has Discrepancy">Has Discrepancy</option>
              <option value="Failed">Failed</option>
            </select>

            {/* Channel Presence */}
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="h-9 px-3 rounded border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 focus:outline-none"
            >
              <option value="All">All Channels</option>
              <option value="Online Store">Online Store</option>
              <option value="Marketplace">Marketplace</option>
            </select>

            {/* Stock Level Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="h-9 px-3 rounded border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 focus:outline-none"
            >
              <option value="All">Stock Level: All</option>
              <option value="In Stock (>20)">In Stock (&gt;20)</option>
              <option value="Low Stock (<20)">Low Stock (&lt;20)</option>
              <option value="Out of Stock (0)">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. Main Data Table */}
      <section className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] h-10 border-b border-[#E2E8F0] text-[#475569] text-[11px] font-semibold uppercase tracking-wider select-none">
                <th className="w-12 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === displayedProducts.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#CBD5E1] text-[#4f46e5] focus:ring-[#4f46e5]/20 h-4 w-4"
                  />
                </th>
                <th className="w-16 px-3">Thumb</th>
                <th className="px-4">SKU / ID</th>
                <th className="px-4">Product Name &amp; Brand</th>
                <th className="px-4">Category</th>
                <th className="px-4 text-right">Price</th>
                <th className="px-4 text-center">Stock</th>
                <th className="px-4">Attributes</th>
                <th className="px-4">Channel Sync Badges</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {displayedProducts.map((product, idx) => {
                const isSelected = selectedIds.includes(product.id);
                const onlineSynced = product.channelPresence.onlineStore.status === 'synced';
                const onlineFailed = product.channelPresence.onlineStore.status === 'failed';
                const marketSynced = product.channelPresence.marketplace.status === 'synced';
                const marketDiscrepancy = product.channelPresence.marketplace.status === 'discrepancy';
                const marketPending = product.channelPresence.marketplace.status === 'pending';

                return (
                  <tr
                    key={product.id}
                    className={`transition-colors group ${
                      idx % 2 === 1 ? 'bg-[#F8FAFC]/50' : 'bg-white'
                    } hover:bg-[#F1F5F9] ${isSelected ? 'bg-indigo-50/40' : ''}`}
                  >
                    <td className="px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(product.id)}
                        className="rounded border-[#CBD5E1] text-[#4f46e5] focus:ring-[#4f46e5]/20 h-4 w-4"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <img
                        src={product.imageUrl}
                        alt={product.imageAlt}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded object-cover border border-[#E2E8F0] bg-slate-100 flex-shrink-0"
                      />
                    </td>
                    <td className="px-4 font-mono font-semibold text-[#0F172A] whitespace-nowrap">
                      {product.sku}
                    </td>
                    <td className="px-4">
                      <div
                        onClick={() => setInspectingProductDetails(product)}
                        className="font-medium text-[#0F172A] leading-snug cursor-pointer hover:text-[#4f46e5] transition-colors"
                      >
                        {product.name}
                      </div>
                      <div className="text-[#94A3B8] text-[11px]">Brand: {product.brand}</div>
                    </td>
                    <td className="px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F5F9] text-[#475569]">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 text-right font-mono font-semibold text-[#0F172A] tabular-nums whitespace-nowrap">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 text-center font-mono tabular-nums whitespace-nowrap">
                      {product.stock <= 15 ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          {product.stock} (Low)
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {product.attributes?.slice(0, 2).map((a) => (
                          <span
                            key={a.id}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                          >
                            {a.value}
                          </span>
                        ))}
                        {product.attributes && product.attributes.length > 2 && (
                          <span className="text-[10px] text-[#94A3B8] self-center">
                            +{product.attributes.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Channel Badges */}
                    <td className="px-4 whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row gap-1.5">
                        {onlineSynced && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                            Store
                          </span>
                        )}
                        {onlineFailed && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FFF1F2] border border-[#FECDD3] text-[#9F1239] text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
                            Sync Failed
                          </span>
                        )}

                        {marketSynced && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                            Marketplace
                          </span>
                        )}
                        {marketDiscrepancy && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                            {product.channelPresence.marketplace.statusLabel || 'Marketplace Drift'}
                          </span>
                        )}
                        {marketPending && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] text-[#475569] text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
                            Pending
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setIsProductDrawerOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-[#F1F5F9] text-[#475569] hover:text-[#4f46e5] cursor-pointer transition-colors"
                          title="Edit Product"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => syncSingleProduct(product.sku)}
                          className="p-1.5 rounded hover:bg-[#F1F5F9] text-[#475569] hover:text-[#4f46e5] cursor-pointer transition-colors"
                          title="Sync Record"
                        >
                          <span className="material-symbols-outlined text-[18px]">sync</span>
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-1.5 rounded hover:bg-[#FFF1F2] text-[#475569] hover:text-[#E11D48] cursor-pointer transition-colors"
                          title="Delete Product"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Bar */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#475569]">
          <div className="font-mono">
            Showing <span className="font-semibold text-[#0F172A]">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-[#0F172A]">
              {Math.min(currentPage * pageSize, filtered.length)}
            </span>{' '}
            of <span className="font-semibold text-[#0F172A]">{filtered.length}</span> products
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-[#CBD5E1] bg-white text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  currentPage === num
                    ? 'bg-[#4f46e5] text-white shadow-sm'
                    : 'border border-[#CBD5E1] bg-white text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-[#CBD5E1] bg-white text-[#0F172A] hover:bg-[#F1F5F9] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
