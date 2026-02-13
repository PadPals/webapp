
import React from 'react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (variantId: string, delta: number) => void;
  onNavigateToCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onNavigateToCheckout }) => {
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 35; // Fixed delivery fee for Drop-off only
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <div className="w-24 h-24 glass-card rounded-[2.5rem] flex items-center justify-center text-rose-300 text-4xl mx-auto mb-8 shadow-xl shadow-rose-100/10">
          <i className="fas fa-shopping-bag"></i>
        </div>
        <h2 className="text-5xl font-black text-rose-950 mb-4 tracking-tighter">Bag is empty</h2>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('setView', { detail: 'shop' }))}
          className="px-10 py-5 glass-button-primary text-white rounded-[2rem] font-black shadow-2xl uppercase tracking-widest"
        >
          Go Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-4xl font-black text-rose-950 tracking-tighter mb-8">Your Bag</h2>
        {items.map(item => (
          <div key={`${item.variantId}-${item.isSubscription}`} className="flex gap-8 p-8 glass-card rounded-[3rem] shadow-sm hover:shadow-xl hover:shadow-rose-100/10 transition-all group">
            <div className="w-32 h-32 overflow-hidden rounded-[2rem] border border-white/40 shadow-sm shrink-0">
              <img
                src={item.image.startsWith('/images') ? `${import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:3000'}${item.image}` : item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex-grow flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-rose-950 text-xl leading-tight">{item.name}</h3>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest">{item.selectedSize}</span>
                    <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest">•</span>
                    <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest">{item.category}</span>
                    {item.isSubscription && <span className="text-[9px] font-black text-rose-600 bg-rose-50/50 px-2 py-0.5 rounded-full uppercase border border-rose-100/50">Monthly Sub</span>}
                  </div>
                </div>
                <span className="font-black text-rose-600 text-xl">R {(item.price * item.quantity).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center glass-card rounded-2xl p-1">
                  <button onClick={() => onUpdateQuantity(item.variantId, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-xl transition-all"><i className="fas fa-minus text-[10px]"></i></button>
                  <span className="px-4 font-black text-rose-950 text-xs">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.variantId, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-xl transition-all"><i className="fas fa-plus text-[10px]"></i></button>
                </div>
                <button onClick={() => onUpdateQuantity(item.variantId, -item.quantity)} className="text-[10px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="p-10 glass-card rounded-[3.5rem] shadow-2xl shadow-rose-100/10">
          <h3 className="text-2xl font-black text-rose-950 mb-10">Summary</h3>
          <div className="space-y-5 mb-10 border-b border-white/30 pb-10">
            <div className="flex justify-between font-black text-[10px] text-gray-400 uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="text-rose-950">R {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-[10px] text-gray-400 uppercase tracking-widest">
              <span>Standard Shipping</span>
              <span className="text-rose-950">R {deliveryFee.toFixed(2)}</span>
            </div>
            <div className="pt-4">
              <div className="flex items-center gap-2 px-4 py-3 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                <i className="fas fa-truck text-rose-500 text-xs"></i>
                <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Drop-off Delivery Only</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center bg-rose-50/50 backdrop-blur-md p-6 rounded-3xl border border-rose-100/50 mb-10">
            <span className="text-[10px] font-black text-rose-950 uppercase tracking-widest">Total</span>
            <span className="text-3xl font-black text-rose-600">R {total.toFixed(2)}</span>
          </div>
          <button onClick={onNavigateToCheckout} className="w-full py-6 glass-button-primary text-white rounded-[2.5rem] font-black text-xl uppercase tracking-widest shadow-2xl">Checkout</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
