
import React, { useState } from 'react';
import { CartItem, UserProfile } from '../types';
import { SOUTH_AFRICAN_UNIVERSITIES, PAD_SIZES, SOUTH_AFRICAN_TOWNS } from '../constants';

interface CheckoutProps {
  items: CartItem[];
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onComplete: () => void;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ items, userProfile, onUpdateProfile, onComplete, onBack }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal + 35;

  const deductionDays = Array.from({length: 31}, (_, i) => {
    const day = i + 1;
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';
    return `${day}${suffix}`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => onComplete(), 3000);
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <div className="w-24 h-24 glass-button-primary text-white rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl animate-bounce">
          <i className="fas fa-check"></i>
        </div>
        <h2 className="text-5xl font-black text-rose-950 mb-4 tracking-tighter">Order Confirmed!</h2>
        <p className="text-lg text-gray-500 mb-10">Welcome to the family, Pal! Redirecting...</p>
        <div className="glass-card p-8 rounded-[2rem] text-left border border-white/40">
          <p className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1">Reference</p>
          <p className="text-xl font-bold text-rose-950">#PP-{(Math.random() * 10000).toFixed(0)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest mb-12 hover:translate-x-[-4px] transition-transform">
        <i className="fas fa-arrow-left"></i> Back to Bag
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-rose-950 tracking-tighter">Checkout</h2>
            <p className="text-sm font-medium text-gray-500 italic font-['Playfair_Display']">Just a few details to get your care package on its way.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile / Delivery Info Section */}
            <div className="glass-card p-10 rounded-[2.5rem] space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
                <h3 className="text-xl font-black text-rose-950 tracking-tight">Delivery & Pal Info</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    value={userProfile.name}
                    onChange={(e) => onUpdateProfile({ name: e.target.value })}
                    placeholder="Jane Doe" 
                    className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-white/60 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-medium" 
                  />
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Age</label>
                  <input 
                    required 
                    type="number" 
                    value={userProfile.age}
                    onChange={(e) => onUpdateProfile({ age: e.target.value })}
                    placeholder="e.g. 21" 
                    className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-white/60 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-medium" 
                  />
                </div>

                {/* Account Type Toggle */}
                <div className="space-y-2 group md:col-span-2">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">I am a...</label>
                  <div className="flex bg-white/40 p-1 rounded-2xl border border-white/60 h-14">
                    <button 
                      type="button"
                      onClick={() => onUpdateProfile({ isStudent: true })}
                      className={`flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${userProfile.isStudent ? 'bg-rose-500 text-white shadow-md' : 'text-gray-400 hover:text-rose-400'}`}
                    >
                      Student Pal
                    </button>
                    <button 
                      type="button"
                      onClick={() => onUpdateProfile({ isStudent: false })}
                      className={`flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!userProfile.isStudent ? 'bg-rose-500 text-white shadow-md' : 'text-gray-400 hover:text-rose-400'}`}
                    >
                      Everyday Pal
                    </button>
                  </div>
                </div>

                {/* Conditional University or Address */}
                {userProfile.isStudent ? (
                  <div className="space-y-2 group md:col-span-2">
                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">University</label>
                    <div className="relative">
                      <select 
                        required
                        value={userProfile.university}
                        onChange={(e) => onUpdateProfile({ university: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-white/60 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-medium appearance-none pr-10"
                      >
                        <option value="" disabled>Select your university</option>
                        {SOUTH_AFRICAN_UNIVERSITIES.map(uni => (
                          <option key={uni} value={uni}>{uni}</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400">
                        <i className="fas fa-chevron-down text-[10px]"></i>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 group md:col-span-2">
                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Residential Address</label>
                    <input 
                      required 
                      type="text" 
                      value={userProfile.address}
                      onChange={(e) => onUpdateProfile({ address: e.target.value })}
                      placeholder="Street, Suburb, etc." 
                      className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-white/60 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-medium" 
                    />
                  </div>
                )}

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Town / City</label>
                  <div className="relative">
                    <select 
                      required
                      value={userProfile.town}
                      onChange={(e) => onUpdateProfile({ town: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-white/60 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-medium appearance-none pr-10"
                    >
                      <option value="" disabled>Select town</option>
                      {SOUTH_AFRICAN_TOWNS.map(town => (
                        <option key={town} value={town}>{town}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400">
                      <i className="fas fa-chevron-down text-[10px]"></i>
                    </div>
                  </div>
                </div>

                {/* Optional Deduction Date */}
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Automated Deduction Date (Optional)</label>
                  <div className="relative">
                    <select 
                      value={userProfile.preferredDeductionDate}
                      onChange={(e) => onUpdateProfile({ preferredDeductionDate: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-white/60 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-medium appearance-none pr-10"
                    >
                      <option value="">Not now (Order once)</option>
                      {deductionDays.map(day => (
                        <option key={day} value={day}>Every month on the {day}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400">
                      <i className="fas fa-chevron-down text-[10px]"></i>
                    </div>
                  </div>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest ml-1">Setting this will automate your future refills.</p>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="glass-card p-10 rounded-[2.5rem]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
                <h3 className="text-xl font-black text-rose-950 tracking-tight">Payment</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex flex-col p-6 glass-card border-2 border-rose-500 rounded-2xl cursor-pointer">
                  <i className="fas fa-credit-card text-rose-500 text-xl mb-2"></i>
                  <span className="text-[10px] font-black text-rose-900 uppercase">Card</span>
                  <div className="absolute top-2 right-2 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[8px] text-white"><i className="fas fa-check"></i></div>
                </label>
                <label className="relative flex flex-col p-6 bg-white/30 border border-white/50 rounded-2xl cursor-pointer hover:border-rose-200">
                  <i className="fas fa-mobile-alt text-gray-400 text-xl mb-2"></i>
                  <span className="text-[10px] font-black text-gray-400 uppercase">Mobile</span>
                </label>
              </div>
            </div>

            <button type="submit" className="w-full py-6 glass-button-primary text-white rounded-[2.5rem] font-black text-xl uppercase tracking-widest shadow-2xl">Complete Order</button>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="glass-card p-10 rounded-[3rem] sticky top-32">
            <h3 className="text-xl font-black text-rose-950 mb-8">Summary</h3>
            <div className="space-y-6 mb-8 border-b border-white/30 pb-8 max-h-[300px] overflow-y-auto custom-scrollbar">
              {items.map(item => (
                <div key={`${item.variantId}-${item.isSubscription}`} className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-xl overflow-hidden glass-card shrink-0 border border-white/40 shadow-sm">
                    <img src={item.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-xs text-rose-950">{item.name}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.selectedSize}</p>
                  </div>
                  <span className="font-black text-rose-600 text-sm">R {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                <span>Shipping</span>
                <span className="text-rose-950">R 35.00</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/30">
                <span className="text-lg font-black text-rose-950">Total</span>
                <span className="text-2xl font-black text-rose-600">R {total.toFixed(2)}</span>
              </div>
              <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-rose-50/50 rounded-xl border border-rose-100/50">
                <i className="fas fa-truck text-rose-500 text-[10px]"></i>
                <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Standard Drop-off</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
