
import React, { useState } from 'react';
import { View } from '../types';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, cartCount }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation order as requested: home, profile, shop, tracker
  const navItems = [
    { id: View.HOME, label: 'Home', icon: 'fa-home' },
    { id: View.PROFILE, label: 'Profile', icon: 'fa-user' },
    { id: View.SHOP, label: 'Shop', icon: 'fa-shopping-bag' },
    { id: View.TRACKER, label: 'Tracker', icon: 'fa-calendar-alt' },
  ];

  const handleNavigate = (view: View) => {
    setView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600"></div>
      
      {/* Navbar Container with Glass effect */}
      <nav className="glass-nav rounded-b-[2.5rem] shadow-[0_15px_40px_-15px_rgba(233,126,139,0.15)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Mobile Menu Toggle (Left - The Menu trigger requested) */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-3 text-rose-950 hover:bg-rose-50 rounded-2xl transition-colors active:scale-90"
                aria-label="Open Menu"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>

            {/* Logo Section (Center on mobile, Left on desktop) */}
            <div 
              className="flex items-center cursor-pointer group transition-transform hover:scale-105 active:scale-95 md:static absolute left-1/2 -translate-x-1/2 md:translate-x-0" 
              onClick={() => handleNavigate(View.HOME)}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-rose-500 rounded-2xl flex items-center justify-center text-white mr-2 sm:mr-3 shadow-lg shadow-rose-200 group-hover:bg-rose-600 rotate-3 group-hover:rotate-0 transition-all">
                <i className="fas fa-heart text-lg sm:text-xl"></i>
              </div>
              <div className="hidden xs:block">
                <span className="text-xl sm:text-2xl font-black tracking-tighter text-rose-950 font-['Playfair_Display'] block leading-none">PadPal</span>
                <span className="text-[8px] sm:text-[10px] font-bold text-rose-400 uppercase tracking-widest">Care Delivered</span>
              </div>
            </div>

            {/* Desktop Navigation (Center-aligned for aesthetic balance) */}
            <div className="hidden md:flex items-center bg-white/40 backdrop-blur-md rounded-2xl p-1.5 border border-white/40">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    currentView === item.id 
                      ? 'bg-white text-rose-600 shadow-sm border border-rose-100' 
                      : 'text-gray-500 hover:text-rose-500 hover:bg-white/50'
                  }`}
                >
                  <i className={`fas ${item.icon} text-xs ${currentView === item.id ? 'text-rose-500' : 'text-gray-400'}`}></i>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Actions (Right) */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleNavigate(View.CART)}
                className={`relative p-3 rounded-2xl transition-all ${
                  currentView === View.CART ? 'bg-rose-50 text-rose-600' : 'bg-white/40 border border-white/50 text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <i className="fas fa-shopping-cart text-lg sm:text-xl"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs font-black leading-none text-white bg-rose-500 border-2 sm:border-4 border-white rounded-full shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-rose-950/20 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {/* Sidebar Drawer (Slides from the Left) */}
        <div 
          className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col rounded-r-[3rem]`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with the Red Block Logo */}
          <div className="p-10 border-b border-rose-50 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                <i className="fas fa-heart text-xl"></i>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-gray-400 hover:text-rose-500"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div>
              <span className="text-3xl font-black tracking-tighter text-rose-950 font-['Playfair_Display']">PadPal</span>
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Care Delivered</p>
            </div>
          </div>

          {/* Nav Links - Large and accessible */}
          <div className="p-6 space-y-4 flex-grow overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-5 p-5 rounded-[2rem] font-black transition-all text-left group ${
                  currentView === item.id 
                    ? 'bg-rose-500 text-white shadow-xl shadow-rose-200' 
                    : 'text-rose-950/60 hover:bg-rose-50 hover:text-rose-500'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${currentView === item.id ? 'bg-white/20' : 'bg-white border border-rose-100 text-rose-400 group-hover:text-rose-500 shadow-sm'}`}>
                  <i className={`fas ${item.icon} text-lg`}></i>
                </div>
                <span className="text-lg tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-10 border-t border-rose-50 space-y-4">
             <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100">
                <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Your Pal</p>
                <p className="text-xs text-rose-950/70 font-medium">Ready for your next care cycle?</p>
             </div>
             <p className="text-[8px] text-center font-bold text-gray-300 uppercase tracking-widest">PadPal Web Services © 2026</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
