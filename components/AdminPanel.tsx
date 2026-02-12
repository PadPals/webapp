
import React, { useState } from 'react';
import { Product, ProductVariant, View } from '../types';

interface AdminPanelProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, onUpdateProduct, onAddProduct }) => {
  const [editingId, setEditingId] = useState<string | null>(products[0]?.id || null);
  
  const currentProduct = products.find(p => p.id === editingId);

  const handleProductChange = (updates: Partial<Product>) => {
    if (!currentProduct) return;
    onUpdateProduct({ ...currentProduct, ...updates });
  };

  const handleVariantChange = (variantId: string, updates: Partial<ProductVariant>) => {
    if (!currentProduct) return;
    const newVariants = currentProduct.variants.map(v => 
      v.id === variantId ? { ...v, ...updates } : v
    );
    onUpdateProduct({ ...currentProduct, variants: newVariants });
  };

  const addVariant = () => {
    if (!currentProduct) return;
    const newVariant: ProductVariant = {
      id: `v-${Date.now()}`,
      size: 'New Size',
      price: 0,
      image: currentProduct.variants[0]?.image || ''
    };
    onUpdateProduct({ ...currentProduct, variants: [...currentProduct.variants, newVariant] });
  };

  const removeVariant = (variantId: string) => {
    if (!currentProduct || currentProduct.variants.length <= 1) return;
    const newVariants = currentProduct.variants.filter(v => v.id !== variantId);
    onUpdateProduct({ ...currentProduct, variants: newVariants });
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
          <div className="space-y-2">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => setEditingId(p.id)}
                className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all border ${
                  editingId === p.id 
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
          {!currentProduct ? (
            <div className="h-full flex items-center justify-center text-gray-400 font-medium">Select a product to edit</div>
          ) : (
            <div className="space-y-10">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-black text-rose-950 tracking-tighter">Edit <span className="text-rose-500">{currentProduct.name}</span></h2>
                <div className="px-4 py-2 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                  ID: {currentProduct.id}
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input 
                    type="text" 
                    value={currentProduct.name}
                    onChange={e => handleProductChange({ name: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-white/60 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Category</label>
                  <div className="relative">
                    <select 
                      value={currentProduct.category}
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
                    value={currentProduct.description}
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
                  {currentProduct.variants.map((v, idx) => (
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
                          <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Image URL</label>
                          <input 
                            type="text" 
                            value={v.image}
                            onChange={e => handleVariantChange(v.id, { image: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-white/60 border border-white/80 text-xs font-medium"
                          />
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
