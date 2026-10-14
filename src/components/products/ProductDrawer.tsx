import React, { useState, useEffect } from 'react';
import { usePim } from '../../context/PimContext';
import { ProductAttribute } from '../../types';

export const ProductDrawer: React.FC = () => {
  const {
    isProductDrawerOpen,
    setIsProductDrawerOpen,
    editingProduct,
    setEditingProduct,
    addProduct,
    updateProduct,
    products,
    addToast,
  } = usePim();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [brand, setBrand] = useState('Sony');
  const [price, setPrice] = useState('399.99');
  const [stock, setStock] = useState('84');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [syncOnlineStore, setSyncOnlineStore] = useState(true);
  const [syncMarketplace, setSyncMarketplace] = useState(true);

  // New attribute chip state
  const [newChipLabel, setNewChipLabel] = useState('');
  const [newChipValue, setNewChipValue] = useState('');
  const [isAddingChip, setIsAddingChip] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setSku(editingProduct.sku);
      setCategory(editingProduct.category);
      setBrand(editingProduct.brand);
      setPrice(editingProduct.price.toString());
      setStock(editingProduct.stock.toString());
      setDescription(editingProduct.description);
      setAttributes(editingProduct.attributes || []);
      setSyncOnlineStore(editingProduct.dispatchTargets?.onlineStore ?? true);
      setSyncMarketplace(editingProduct.dispatchTargets?.marketplace ?? true);
    } else {
      // Default new product values
      const nextSkuNum = 1000 + products.length * 110;
      setName('');
      setSku(`SKU-${nextSkuNum}`);
      setCategory('Electronics');
      setBrand('');
      setPrice('99.99');
      setStock('50');
      setDescription('');
      setAttributes([
        { id: '1', label: 'Color', value: 'Default' },
        { id: '2', label: 'Condition', value: 'New' },
      ]);
      setSyncOnlineStore(true);
      setSyncMarketplace(true);
    }
  }, [editingProduct, products.length, isProductDrawerOpen]);

  if (!isProductDrawerOpen) return null;

  const handleClose = () => {
    setIsProductDrawerOpen(false);
    setEditingProduct(null);
  };

  const handleRemoveAttribute = (id: string) => {
    setAttributes((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddAttribute = () => {
    if (!newChipLabel.trim() || !newChipValue.trim()) {
      addToast('Please enter both label and value for the chip', 'warning');
      return;
    }
    const newAttr: ProductAttribute = {
      id: `attr-${Date.now()}`,
      label: newChipLabel.trim(),
      value: newChipValue.trim(),
    };
    setAttributes((prev) => [...prev, newAttr]);
    setNewChipLabel('');
    setNewChipValue('');
    setIsAddingChip(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast('Product name is required', 'error');
      return;
    }
    if (!sku.trim()) {
      addToast('SKU identifier is required', 'error');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0.01) {
      addToast('Price must be at least $0.01', 'error');
      return;
    }

    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      addToast('Stock quantity cannot be negative', 'error');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        sku,
        category,
        brand,
        price: numPrice,
        stock: numStock,
        description,
        attributes,
        dispatchTargets: {
          onlineStore: syncOnlineStore,
          marketplace: syncMarketplace,
        },
      });
    } else {
      addProduct({
        name,
        sku,
        category,
        brand: brand || 'Generic',
        price: numPrice,
        stock: numStock,
        description,
        attributes,
        channelPresence: {
          onlineStore: { status: 'synced', statusLabel: 'Synchronized' },
          marketplace: { status: 'synced', statusLabel: 'Synchronized' },
        },
        dispatchTargets: {
          onlineStore: syncOnlineStore,
          marketplace: syncMarketplace,
        },
        imageUrl:
          category === 'Computers'
            ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwvkJD9zRqWUaqqqrgPHPxt91KpY1cZwaZr70c73m4KUy8xm_jEtxJPa2G5gBEMPrhmRjgFeF88JCJQSmdVC5WCt8D2HCWdt4WDOC1zXuhq5v8NBPU-TdAhfQV9g-W0e8qycZZFX4qHlwyOJNp2A7Z-sfHRb-6bw7ysu0_uDWhcyVbdE1pEHMz3zjoNs6W3P0Sfhi-T5l7alGnDKzadVfwUpMjSaYVXyqSVkhYVBNSjzykyaRBbDgpdw'
            : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV7-0rHsSTjB7k1M7roMo-3pbUTgojQyzbmpfoWCkAWPrz_oJZn3l61vgemM-ghUFW0lsoCKjNVWfD1HQjW-7bSwh7mGux8QY7KWpAkNcM5YjvYKYxztqZy5oOCqXD6Zm1f8MxFfm36PiRU94xwyU8bI_zus50VXebc3vBnaPC1t6uKoAfLG7yVZnd9sLkTKA3rFrdC_Z0ua-G6popnEWk_rTctMfw7t9qEkUV9KKJ16soNeC9jZv3-g',
        imageAlt: name,
      });
    }

    handleClose();
  };

  // Check unique SKU
  const isSkuUnique = !products.some(
    (p) => p.sku.toLowerCase() === sku.toLowerCase() && p.id !== editingProduct?.id
  );

  return (
    <div
      className="fixed inset-0 bg-[#0F172A]/40 z-50 flex justify-end transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-xl h-full bg-white border-l border-[#CBD5E1] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">
              {editingProduct ? 'Edit Master Product' : 'Add / Edit Product'}
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">
              Configure master attributes and multichannel dispatch
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scroll p-6 space-y-5">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Master Wireless Headset"
              className="w-full h-9 px-3 rounded border border-[#CBD5E1] bg-white text-xs font-normal text-[#0F172A] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 focus:outline-none"
            />
          </div>

          {/* SKU / ID with Unique Validation Indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                SKU / ID *
              </label>
              {isSkuUnique && sku.trim() ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#065F46]">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Unique SKU Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9F1239]">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  SKU already exists
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className={`w-full h-9 px-3 rounded border text-xs font-mono font-medium text-[#0F172A] focus:outline-none ${
                  isSkuUnique && sku.trim()
                    ? 'border-[#A7F3D0] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15'
                    : 'border-[#FECDD3] focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15'
                }`}
              />
            </div>
          </div>

          {/* Category & Brand Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-3 rounded border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 focus:outline-none"
              >
                <option value="Electronics">Electronics</option>
                <option value="Computers">Computers</option>
                <option value="Wearables">Wearables</option>
                <option value="Displays">Displays</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                Brand *
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Sony, Apple, Dell"
                className="w-full h-9 px-3 rounded border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 focus:outline-none"
              />
            </div>
          </div>

          {/* Price with Negative Value Indicator & Stock Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                  Price ($) *
                </label>
                <span className="text-[10px] text-[#94A3B8] font-mono">Min: $0.01</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-[#94A3B8] text-sm font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full h-9 pl-7 pr-3 rounded border border-[#CBD5E1] bg-white text-xs font-mono font-medium text-[#0F172A] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-[#065F46]">Prevented negative value drift</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full h-9 px-3 rounded border border-[#CBD5E1] bg-white text-xs font-mono font-medium text-[#0F172A] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 focus:outline-none"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide canonical product specifications and marketing copy..."
              className="w-full p-2.5 rounded border border-[#CBD5E1] bg-white text-xs text-[#0F172A] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 focus:outline-none custom-scroll"
            />
          </div>

          {/* Attribute Chips Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                Attribute Tags
              </label>
              <span className="text-[11px] text-[#94A3B8]">Master Specification</span>
            </div>
            <div className="flex flex-wrap gap-2 p-2.5 rounded border border-[#CBD5E1] bg-[#F8FAFC] min-h-[44px] items-center">
              {attributes.map((attr) => (
                <span
                  key={attr.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-[#CBD5E1] text-xs font-medium text-[#0F172A] shadow-xs"
                >
                  <span>
                    {attr.label}: {attr.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(attr.id)}
                    className="text-[#94A3B8] hover:text-[#E11D48] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}

              {!isAddingChip ? (
                <button
                  type="button"
                  onClick={() => setIsAddingChip(true)}
                  className="inline-flex items-center gap-1 text-xs text-[#3525cd] font-semibold hover:underline px-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Add Chip</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 p-1 bg-white border border-[#4f46e5] rounded text-xs">
                  <input
                    type="text"
                    placeholder="Key (e.g. Color)"
                    value={newChipLabel}
                    onChange={(e) => setNewChipLabel(e.target.value)}
                    className="w-20 px-1 py-0.5 border-b border-slate-300 text-xs focus:outline-none"
                  />
                  <span>:</span>
                  <input
                    type="text"
                    placeholder="Value (e.g. Silver)"
                    value={newChipValue}
                    onChange={(e) => setNewChipValue(e.target.value)}
                    className="w-24 px-1 py-0.5 border-b border-slate-300 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    className="px-1.5 py-0.5 bg-[#4f46e5] text-white rounded text-[11px] font-semibold"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingChip(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Channel Presence Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Channel Dispatch Targets
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-start gap-2.5 p-3 rounded border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={syncOnlineStore}
                  onChange={(e) => setSyncOnlineStore(e.target.checked)}
                  className="mt-0.5 rounded border-[#CBD5E1] text-[#4f46e5] focus:ring-[#4f46e5]/20 h-4 w-4"
                />
                <div>
                  <span className="block text-xs font-semibold text-[#0F172A]">
                    Sync to Online Store
                  </span>
                  <span className="block text-[11px] text-[#94A3B8]">
                    Primary Shopify &amp; Custom Web API
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={syncMarketplace}
                  onChange={(e) => setSyncMarketplace(e.target.checked)}
                  className="mt-0.5 rounded border-[#CBD5E1] text-[#4f46e5] focus:ring-[#4f46e5]/20 h-4 w-4"
                />
                <div>
                  <span className="block text-xs font-semibold text-[#0F172A]">
                    Sync to Marketplace
                  </span>
                  <span className="block text-[11px] text-[#94A3B8]">
                    Amazon &amp; Walmart Commerce Feed
                  </span>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Drawer Footer Action Bar */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded border border-[#CBD5E1] bg-white text-[#0F172A] font-semibold text-xs hover:bg-[#F1F5F9] transition-colors cursor-pointer active:scale-98"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded bg-[#4f46e5] hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm active:scale-98 flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Save &amp; Validate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
