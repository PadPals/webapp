
import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductVariant } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ProductCatalogueProps {
  products: Product[];
  onAddToCart: (product: Product, variant: ProductVariant, isSubscription: boolean) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const BrandedImage: React.FC<{ productName: string, prompt: string, alt: string }> = ({ productName, prompt, alt }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const cache = useRef<Record<string, string>>({});

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);

      // 1. Check if prompt is already a local path (from DB / Admin Panel)
      if (prompt && prompt.startsWith('/images')) {
        // API_BASE_URL usually includes /api, but images are at root /images
        // We need to strip /api to get the server root
        const serverRoot = API_BASE_URL.replace(/\/api$/, '');
        setImageUrl(`${serverRoot}${prompt}`);
        setLoading(false);
        return;
      }

      // 2. Map product name to local image (hardcoded legacy mapping)
      const name = productName.toLowerCase();
      let localPath = '';
      if (name.includes('daily regular')) localPath = '/images/products/daily regular.png';
      else if (name.includes('super protection')) localPath = '/images/products/super protection.png';
      else if (name.includes('overnight')) localPath = '/images/products/dreamguard overnight.png';
      else if (name.includes('liners')) localPath = '/images/products/silksoft daily liners.png';

      if (localPath) {
        // Mock a slight delay to show the curating animation as requested
        await new Promise(resolve => setTimeout(resolve, 800));
        setImageUrl(localPath);
        setLoading(false);
        return;
      }

      // 3. Fallback to Gemini or Cache
      if (cache.current[prompt]) {
        setImageUrl(cache.current[prompt]);
        setLoading(false);
        return;
      }

      try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: prompt }] },
          config: { imageConfig: { aspectRatio: "1:1" } },
        });
        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (imagePart?.inlineData) {
          const b64Data = `data:image/png;base64,${imagePart.inlineData.data}`;
          cache.current[prompt] = b64Data;
          setImageUrl(b64Data);
        } else {
          setImageUrl(`https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=800`);
        }
      } catch (error) {
        setImageUrl(`https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=800`);
      } finally {
        setLoading(false);
      }
    };
    loadImage();
  }, [productName, prompt]);

  if (loading) {
    return (
      <div className="w-full h-full bg-rose-50/50 flex flex-col items-center justify-center gap-4 border border-rose-100/30 rounded-[3rem]">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-200 animate-pulse shadow-sm">
          <i className="fas fa-heart text-2xl"></i>
        </div>
        <span className="text-[10px] font-black text-rose-300 uppercase tracking-[0.4em]">Curating...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden rounded-[3rem] border border-white/50 shadow-inner group">
      <img src={imageUrl || ''} alt={alt} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" />
    </div>
  );
};


const ProductCatalogue: React.FC<ProductCatalogueProps> = ({ products, onAddToCart }) => {
  const [filter, setFilter] = useState('All');
  const [purchaseMode, setPurchaseMode] = useState<Record<string, 'once' | 'sub'>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const categories = ['All', 'regular', 'super', 'overnight', 'liner'];
  const filteredProducts = filter === 'All' ? products : products.filter(p => p.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-12">
        <div className="space-y-4">
          <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] block">Essential Collection</span>
          <h2 className="text-6xl lg:text-8xl font-black text-rose-950 tracking-tighter leading-none italic font-['Playfair_Display']">
            Select Your <span className="font-sans text-rose-500 not-italic">Pal.</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-4 glass-card p-2 rounded-[2.5rem] border-rose-100/30">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-rose-500 text-white shadow-xl scale-105' : 'text-rose-900/40 hover:text-rose-600'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {filteredProducts.map(product => {
          const activeVariantId = selectedVariants[product.id] || product.variants[0].id;
          const activeVariant = product.variants.find(v => v.id === activeVariantId) || product.variants[0];
          const isSub = purchaseMode[product.id] === 'sub';
          const displayPrice = isSub ? activeVariant.price * 0.85 : activeVariant.price;

          return (
            <div key={product.id} className="group flex flex-col">
              <div className="relative aspect-[3/4] mb-8">
                <BrandedImage productName={product.name} prompt={activeVariant.image} alt={product.name} />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 bg-white/60 backdrop-blur rounded-full text-[9px] font-black text-rose-600 shadow-xl uppercase tracking-widest border border-white/50">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="px-2 space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-rose-950 tracking-tight leading-none mb-2">{product.name}</h3>
                  <p className="text-rose-900/40 text-sm font-medium line-clamp-2 leading-relaxed">{product.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariants(prev => ({ ...prev, [product.id]: v.id }))}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight border-2 transition-all ${activeVariantId === v.id ? 'bg-rose-500 border-rose-600 text-white shadow-lg' : 'border-rose-100 text-rose-400 hover:border-rose-300'
                          }`}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>

                  <div className="bg-rose-50/50 p-1.5 rounded-[1.8rem] flex border border-rose-100">
                    <button
                      onClick={() => setPurchaseMode(prev => ({ ...prev, [product.id]: 'once' }))}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${!isSub ? 'bg-white shadow-sm text-rose-600' : 'text-rose-400 hover:text-rose-600'}`}
                    >
                      Once
                    </button>
                    <button
                      onClick={() => setPurchaseMode(prev => ({ ...prev, [product.id]: 'sub' }))}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${isSub ? 'bg-rose-500 text-white shadow-xl' : 'text-rose-400 hover:text-rose-600'}`}
                    >
                      Sub & Save
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-rose-950 tracking-tighter">R {displayPrice.toFixed(2)}</span>
                    {isSub && <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Saving 15% Member Rate</span>}
                  </div>
                  <button
                    onClick={() => onAddToCart(product, activeVariant, isSub)}
                    className="w-14 h-14 glass-button-primary text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductCatalogue;
