
import React, { useState } from 'react';
import { Product, ProductVariant, View } from '../types';

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface AdminPanelProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, onUpdateProduct, onAddProduct }) => {
  const [editingId, setEditingId] = useState<string | null>(products[0]?.id || null);

  // Template for new product
  const NEW_PRODUCT_TEMPLATE: Product = {
    id: 'new',
    group_id: '',
    name: 'New Product',
    description: '',
    category: 'regular' as any,
    stock: 0,
    variants: [
      { id: 'v-new-1', size: 'Regular', price: 0, image: '' }
    ]
  };

  const currentProduct = editingId === 'new' ? NEW_PRODUCT_TEMPLATE : products.find(p => p.id === editingId);
  // Local state for new product creation to avoid mutating the template or props directly before save
  const [newProductState, setNewProductState] = useState<Product>(NEW_PRODUCT_TEMPLATE);

  // Helper to get the product to display (either from props or local new state)
  const displayProduct = editingId === 'new' ? newProductState : currentProduct;

  const handleProductChange = (updates: Partial<Product>) => {
    if (editingId === 'new') {
      setNewProductState(prev => ({ ...prev, ...updates }));
    } else {
      if (!currentProduct) return;
      onUpdateProduct({ ...currentProduct, ...updates });
    }
  };

  const handleVariantChange = (variantId: string, updates: Partial<ProductVariant>) => {
    if (editingId === 'new') {
      setNewProductState(prev => ({
        ...prev,
        variants: prev.variants.map(v => v.id === variantId ? { ...v, ...updates } : v)
      }));
    } else {
      if (!currentProduct) return;
      const newVariants = currentProduct.variants.map(v =>
        v.id === variantId ? { ...v, ...updates } : v
      );
      onUpdateProduct({ ...currentProduct, variants: newVariants });
    }
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `v-${Date.now()}`,
      size: 'New Size',
      price: 0,
      image: (editingId === 'new' ? newProductState : currentProduct)?.variants[0]?.image || ''
    };

    if (editingId === 'new') {
      setNewProductState(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
    } else {
      if (!currentProduct) return;
      onUpdateProduct({ ...currentProduct, variants: [...currentProduct.variants, newVariant] });
    }
  };

  const removeVariant = (variantId: string) => {
    const product = editingId === 'new' ? newProductState : currentProduct;
    if (!product || product.variants.length <= 1) return;

    const newVariants = product.variants.filter(v => v.id !== variantId);

    if (editingId === 'new') {
      setNewProductState(prev => ({ ...prev, variants: newVariants }));
    } else {
      onUpdateProduct({ ...product, variants: newVariants });
    }
  };

  const handleImageUpload = async (file: File, variantId: string) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update the specific variant with the new image URL
      handleVariantChange(variantId, { image: data.imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const handleCreateNew = () => {
    // Generate a temporary group ID
    const productToCreate = {
      ...newProductState,
      group_id: `g-${Date.now()}`,
      // Ensure we don't send 'new' as ID to server, let server handle it or send null/undefined if API expects
      // but here we keep the structure. The App.tsx handleAddProduct seems to expect a Product object.
    };
    onAddProduct(productToCreate);
    // Reset state and switch to the new product (assuming onAddProduct updates the list and we'll receive it via props)
    // For now, we can just reset the form or wait for the products prop to update.
    // Ideally, we'd switch editingId to the new product's ID after creation, but that requires more complex state lifting.
    // We'll just reset the new product state for now.
    setNewProductState(NEW_PRODUCT_TEMPLATE);
    setEditingId(null); // Go back to list or select first
  };

  const navigateToShop = () => {
    window.dispatchEvent(new CustomEvent('setView', { detail: View.SHOP }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-5xl font-black text-rose-950 tracking-tighter">Store <span className="text-rose-500">Management</span></h2>
          <p className="text-gray-400 font-medium mt-2">Manage your inventory, pricing, and product variants.</p>
        </div>
        <button
          onClick={navigateToShop}
          className="px-8 py-4 glass-card rounded-2xl text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-3"
        >
          <i className="fas fa-eye"></i> View Customer Shop
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-4">
          <h3 className="text-xl font-black text-rose-950 mb-6 uppercase tracking-widest text-xs">Inventory</h3>
          <button
            onClick={() => {
              setEditingId('new');
              setNewProductState(NEW_PRODUCT_TEMPLATE);
            }}
            className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all border mb-4 flex items-center justify-between ${editingId === 'new'
              ? 'bg-rose-500 text-white shadow-lg border-rose-600'
              : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
              }`}
          >
            <span><i className="fas fa-plus mr-2"></i> Create New Product</span>
          </button>
          <div className="space-y-2">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => setEditingId(p.id)}
                className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all border ${editingId === p.id
                  ? 'bg-rose-500 text-white shadow-lg border-rose-600'
                  : 'bg-white/40 text-gray-500 border-white/60 hover:bg-white/60'
                  }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-grow glass-card rounded-[3.5rem] p-10 shadow-2xl">
          {!displayProduct ? (
            <div className="h-full flex items-center justify-center text-gray-400 font-medium">Select a product to edit or create a new one</div>
          ) : (
            <div className="space-y-10">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-black text-rose-950 tracking-tighter">
                  {editingId === 'new' ? 'Create' : 'Edit'} <span className="text-rose-500">{displayProduct.name}</span>
                </h2>
                {editingId === 'new' ? (
                  <button
                    onClick={handleCreateNew}
                    className="px-6 py-2 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
                  >
                    Save Product
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                    ID: {displayProduct.id}
                  </div>
                )}
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input
                    type="text"
                    value={displayProduct.name}
                    onChange={e => handleProductChange({ name: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-white/60 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Category</label>
                  <div className="relative">
                    <select
                      value={displayProduct.category}
                      onChange={e => handleProductChange({ category: e.target.value as any })}
                      className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-white/60 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950 appearance-none pr-10"
                    >
                      <option value="regular">Regular</option>
                      <option value="super">Super</option>
                      <option value="overnight">Overnight</option>
                      <option value="liner">Liner</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400">
                      <i className="fas fa-chevron-down text-[10px]"></i>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    value={displayProduct.description}
                    onChange={e => handleProductChange({ description: e.target.value })}
                    rows={3}
                    className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-white/60 focus:ring-4 focus:ring-rose-500/10 outline-none font-medium text-rose-950"
                  />
                </div>
              </div>

              {/* Variants Editor */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-rose-950">Size Variants</h3>
                  <button
                    onClick={addVariant}
                    className="px-6 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-rose-600 active:scale-95"
                  >
                    Add Variant
                  </button>
                </div>

                <div className="space-y-4">
                  {displayProduct.variants.map((v, idx) => (
                    <div key={v.id} className="p-8 bg-white/30 rounded-[2.5rem] border border-white/50 space-y-6 group relative">
                      <button
                        onClick={() => removeVariant(v.id)}
                        className="absolute top-4 right-4 text-gray-300 hover:text-rose-500 transition-colors"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Size Label</label>
                          <input
                            type="text"
                            value={v.size}
                            onChange={e => handleVariantChange(v.id, { size: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-white/60 border border-white/80 text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Price (R)</label>
                          <input
                            type="number"
                            value={v.price}
                            onChange={e => handleVariantChange(v.id, { price: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2 rounded-xl bg-white/60 border border-white/80 text-xs font-bold"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Image</label>
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={v.image}
                              onChange={e => handleVariantChange(v.id, { image: e.target.value })}
                              placeholder="Image URL or Upload"
                              className="w-full px-4 py-2 rounded-xl bg-white/60 border border-white/80 text-xs font-medium"
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleImageUpload(e.target.files[0], v.id);
                                }
                              }}
                              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-white/50">
                          <img src={v.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold italic">Preview for {v.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
