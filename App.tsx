
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ProductCatalogue from './components/ProductCatalogue';
import PeriodTracker from './components/PeriodTracker';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminPanel from './components/AdminPanel';
import AdminApply from './components/AdminApply';
import SuperAdminPanel from './components/SuperAdminPanel';
import Login from './components/Login';
import Profile from './components/Profile';
import { View, Product, ProductVariant, CartItem, Subscription, UserProfile } from './types';
import { INITIAL_PRODUCTS, SOUTH_AFRICAN_UNIVERSITIES, PAD_SIZES, SOUTH_AFRICAN_TOWNS } from './constants';
import { GoogleGenAI } from "@google/genai";


const CareAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: "Hi there! I'm your PadPal Care Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "You are the PadPal Care Assistant. Your tone is warm, professional, and supportive. You help users with period care questions, explain PadPal's subscription model (15% discount, choose deduction date), and offer empathetic health advice. Keep responses concise and use heart emojis occasionally. Mention you are here to make their cycle easier."
        }
      });
      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I'm sorry, I couldn't quite catch that. Could you repeat it?" }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm having a little trouble connecting right now, but I'm still here for you!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-[350px] h-[500px] mb-4 glass-card rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl border-rose-100 animate-reveal">
          <div className="bg-rose-500 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-rose-500">
                <i className="fas fa-heart text-xs"></i>
              </div>
              <span className="font-black uppercase tracking-widest text-[10px]">Care Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><i className="fas fa-times"></i></button>
          </div>
          <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-[1.5rem] text-sm font-medium ${m.role === 'user' ? 'bg-rose-500 text-white rounded-tr-none' : 'bg-white border border-rose-50 text-rose-950 rounded-tl-none shadow-sm'
                  }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-rose-300 text-xs font-black animate-pulse">Assistant is thinking...</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 bg-white/80 border-t border-rose-50 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-grow bg-rose-50/50 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <button onClick={handleSend} className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 transition-all">
              <i className="fas fa-paper-plane text-xs"></i>
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all group relative"
      >
        <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-20"></div>
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-comment-medical'} text-xl`}></i>
      </button>
    </div>
  );
};

import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const GUEST_PROFILE: UserProfile = {
  id: 'guest',
  name: '',
  email: '',
  isAdmin: false,
  isSuperAdmin: false,
  age: '',
  town: '',
  country: 'South Africa',
  isStudent: true,
  university: '',
  address: '',
  padSize: 'Regular',
  preferredDeductionDate: '',
  subscriptionActive: false,
  orderHistory: [],
  subscriptions: []
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    fetchProducts();
    const savedUser = localStorage.getItem('padpals_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserProfile({
        ...user,
        isAdmin: !!user.isAdmin,
        isSuperAdmin: !!user.isSuperAdmin,
        age: '', town: '', country: 'South Africa',
        isStudent: true, university: '', address: '', padSize: 'Regular',
        preferredDeductionDate: '', subscriptionActive: true, orderHistory: [], subscriptions: []
      });
      fetchUserData(user.id);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/products`);

      // Transform flat product list (variants) into nested structure
      const grouped: Record<string, Product> = {};
      data.forEach((item: any) => {
        if (!grouped[item.group_id]) {
          grouped[item.group_id] = {
            id: item.group_id,
            group_id: item.group_id,
            name: item.name,
            description: item.description,
            category: item.category,
            stock: item.stock,
            variants: []
          };
        }
        grouped[item.group_id].variants.push({
          id: item.id,
          size: item.size,
          price: Number(item.price),
          image: item.image
        });
      });

      setProducts(Object.values(grouped));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      const [ordersRes, subsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/orders?userId=${userId}`),
        axios.get(`${API_BASE_URL}/subscriptions?userId=${userId}`)
      ]);
      setSubscriptions(subsRes.data);
      if (userProfile) {
        setUserProfile(prev => prev ? { ...prev, orderHistory: ordersRes.data, subscriptions: subsRes.data } : null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const handleSetView = (e: any) => {
      if (e.detail) setCurrentView(e.detail as View);
    };
    window.addEventListener('setView', handleSetView);

    // Check URL for admin request
    if (window.location.pathname === '/admin/request') {
      setCurrentView(View.ADMIN_APPLY);
    }

    return () => window.removeEventListener('setView', handleSetView);
  }, []);

  const handleAddToCart = (product: Product, variant: ProductVariant, isSubscription: boolean = false) => {
    setCart(prev => {
      const basePrice = variant.price;
      const finalPrice = isSubscription ? basePrice * 0.85 : basePrice;
      const existing = prev.find(item => item.productId === product.id && item.variantId === variant.id && item.isSubscription === isSubscription);
      if (existing) {
        return prev.map(item => (item.productId === product.id && item.variantId === variant.id && item.isSubscription === isSubscription) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        productId: product.id, variantId: variant.id, name: product.name,
        selectedSize: variant.size, price: finalPrice, image: variant.image,
        category: product.category, quantity: 1, isSubscription
      }];
    });
  };

  const updateCartQuantity = (variantId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.variantId === variantId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleLogin = (user: any) => {
    localStorage.setItem('padpals_user', JSON.stringify(user));
    setUserProfile({
      ...user,
      isAdmin: !!user.isAdmin,
      isSuperAdmin: !!user.isSuperAdmin,
      age: '', town: '', country: 'South Africa',
      isStudent: true, university: '', address: '', padSize: 'Regular',
      preferredDeductionDate: '', subscriptionActive: true, orderHistory: [], subscriptions: []
    });
    fetchUserData(user.id);
  };

  const handleUpdateProduct = async (product: Product) => {
    if (!userProfile?.id) return;
    try {
      await axios.put(`${API_BASE_URL}/products/${product.id}`, product, {
        headers: { 'x-user-id': userProfile.id }
      });
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product.');
    }
  };

  const handleAddProduct = async (product: Product) => {
    if (!userProfile?.id) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/products`, product, {
        headers: { 'x-user-id': userProfile.id }
      });
      const newProduct = { ...product, id: response.data.id };
      setProducts(prev => [...prev, newProduct]);
      alert('Product created successfully!');
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('Failed to create product.');
    }
  };

  const handleCompleteCheckout = async () => {
    if (!userProfile?.id) {
      alert('Please login to complete your order');
      setCurrentView(View.PROFILE);
      return;
    }

    try {
      const orderData = {
        userId: userProfile.id,
        total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        type: 'Drop-off', // Default from UI
        status: 'Processing',
        items: cart.map(item => ({
          id: item.variantId, // In Server table, product_id is the variant ID (v1-1 etc)
          name: `${item.name} (${item.selectedSize})`,
          quantity: item.quantity,
          price: item.price,
          isSubscription: item.isSubscription
        }))
      };

      await axios.post(`${API_BASE_URL}/orders`, orderData);
      setCart([]);
      fetchUserData(userProfile.id);
      setCurrentView(View.HOME);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    }
  };



  const renderView = () => {
    if (loading && currentView === View.SHOP) {
      return (
        <div className="flex-grow flex items-center justify-center py-40">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    switch (currentView) {
      case View.HOME:
        return (
          <div className="animate-reveal">
            <Hero setView={setCurrentView} />
            <SubscriptionInfoSection setView={setCurrentView} />
            <AboutUsSection />
          </div>
        );
      case View.SHOP:
        return <div className="pt-8 pb-20 animate-reveal"><ProductCatalogue products={products} onAddToCart={handleAddToCart} /></div>;
      case View.TRACKER:
        return <div className="py-20 px-4 animate-reveal"><PeriodTracker userId={userProfile?.id} isGuest={!userProfile} /></div>;
      case View.CART:
        return <div className="pt-8 pb-20 animate-reveal"><Cart items={cart} onUpdateQuantity={updateCartQuantity} onNavigateToCheckout={() => setCurrentView(View.CHECKOUT)} /></div>;
      case View.CHECKOUT:
        return <div className="pt-8 pb-20 animate-reveal"><Checkout items={cart} userProfile={userProfile || { name: '', email: '', age: '', town: '', country: 'South Africa', isStudent: true, university: '', address: '', padSize: 'Regular', preferredDeductionDate: '', subscriptionActive: true, orderHistory: [], subscriptions: [] }} onUpdateProfile={(u) => setUserProfile(p => p ? { ...p, ...u } : null)} onBack={() => setCurrentView(View.CART)} onComplete={handleCompleteCheckout} /></div>;
      case View.PROFILE:
        return (
          <div className="pt-8 pb-20 animate-reveal">
            <Profile
              userProfile={userProfile || GUEST_PROFILE}
              onUpdateProfile={(u) => setUserProfile(p => p ? { ...p, ...u } : { ...GUEST_PROFILE, ...u })}
              subscriptions={subscriptions}
              onUpdateSubscription={(id, s) => setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, status: s } : sub))}
              onAdminClick={() => setCurrentView(userProfile?.isSuperAdmin ? View.SUPER_ADMIN : View.ADMIN)}
              isGuest={!userProfile || userProfile.id === 'guest'}
              onLogin={(user) => handleLogin(user)}
            />
          </div>
        );
      case View.ADMIN:
        return <div className="pt-8 pb-20 animate-reveal"><AdminPanel products={products} onUpdateProduct={handleUpdateProduct} onAddProduct={handleAddProduct} /></div>;
      case View.ADMIN_APPLY:
        return (
          <div className="pt-8 pb-20 animate-reveal">
            <AdminApply
              userId={userProfile?.id || null}
              userName={userProfile?.name || ''}
              onBack={() => setCurrentView(View.PROFILE)}
            />
          </div>
        );
      case View.SUPER_ADMIN:
        return (
          <div className="pt-8 pb-20 animate-reveal">
            <SuperAdminPanel
              userId={userProfile?.id || ''}
              products={products}
              onUpdateProduct={handleUpdateProduct}
              onAddProduct={handleAddProduct}
            />
          </div>
        );
      default:
        return <Hero setView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentView={currentView} setView={setCurrentView} cartCount={cart.reduce((a, b) => a + b.quantity, 0)} />
      <main className="flex-grow">{renderView()}</main>
      <CareAssistant />
      <footer className="bg-[#2D2421] py-24 text-rose-50 border-t-8 border-rose-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white mr-4 shadow-xl">
                  <i className="fas fa-heart text-xl"></i>
                </div>
                <span className="text-3xl font-black tracking-tighter text-white font-['Playfair_Display']">PadPal</span>
              </div>
              <p className="text-rose-100/40 max-w-sm text-lg font-medium leading-relaxed">
                Empowering women through convenient, automated monthly care deliveries. Because dignity is a right, not a luxury.
              </p>
              <div className="flex gap-6">
                {['instagram', 'twitter', 'facebook', 'linkedin'].map(social => (
                  <a key={social} href="#" className="text-rose-100/20 hover:text-rose-400 transition-all text-2xl">
                    <i className={`fab fa-${social}`}></i>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-black text-white uppercase tracking-[0.2em] text-xs mb-8">Navigation</h4>
              <nav className="flex flex-col space-y-4">
                {['Shop Products', 'Cycle Tracker', 'My Account', 'Student Program'].map(link => (
                  <a key={link} href="#" className="text-rose-100/40 hover:text-rose-50 transition-colors text-sm font-bold">{link}</a>
                ))}
              </nav>
            </div>
            <div>
              <h4 className="font-black text-white uppercase tracking-[0.2em] text-xs mb-8">Support</h4>
              <nav className="flex flex-col space-y-4">
                {['Help Center', 'Shipping Info', 'Returns', 'Privacy Policy'].map(link => (
                  <a key={link} href="#" className="text-rose-100/40 hover:text-rose-50 transition-colors text-sm font-bold">{link}</a>
                ))}
              </nav>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-rose-100/20 text-[10px] uppercase tracking-widest font-black">© 2026 PadPal Web Services. A Think Outsource Project.</p>
            <div className="flex gap-4">
              <div className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase text-rose-300 tracking-widest border border-white/5">Visa</div>
              <div className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase text-rose-300 tracking-widest border border-white/5">Mastercard</div>
              <div className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase text-rose-300 tracking-widest border border-white/5">OZOW</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Hero: React.FC<{ setView: (v: View) => void }> = ({ setView }) => (
  <section className="relative overflow-hidden pt-24 pb-24 lg:pt-40 lg:pb-40">
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-rose-200/20 rounded-full blur-[120px] animate-float-blob"></div>
      <div className="absolute bottom-[0%] left-[-5%] w-[600px] h-[600px] bg-peach-200/20 rounded-full blur-[100px] animate-float-blob-reverse" style={{ backgroundColor: 'rgba(255, 215, 186, 0.15)' }}></div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-12 gap-16 items-center">
      <div className="lg:col-span-7">
        <div className="inline-flex items-center gap-3 py-2 px-6 rounded-full glass-card border-rose-200/30 text-rose-600 mb-10 shadow-lg">
          <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase">Trusted by 12k+ Women</span>
        </div>
        <h1 className="text-7xl lg:text-[10rem] font-black text-rose-950 leading-[0.8] mb-12 tracking-tighter">
          Care, <br />
          <span className="text-rose-500 italic font-['Playfair_Display']">Redefined.</span>
        </h1>
        <p className="text-2xl text-rose-900/60 mb-16 leading-relaxed max-w-xl font-medium">
          The only subscription that syncs with your life. Track your cycle, automate your delivery, and reclaim your comfort.
        </p>
        <div className="flex flex-col sm:flex-row gap-8">
          <button
            onClick={() => setView(View.SHOP)}
            className="px-12 py-8 glass-button-primary text-white rounded-[3rem] font-black text-xl uppercase tracking-[0.2em] shadow-2xl"
          >
            Start Subscribing
          </button>
          <button
            onClick={() => setView(View.TRACKER)}
            className="px-12 py-8 bg-white/60 backdrop-blur-xl text-rose-950 border border-white/80 rounded-[3rem] font-black text-xl hover:bg-white transition-all transform hover:-translate-y-2 shadow-2xl uppercase tracking-[0.2em]"
          >
            Log My Cycle
          </button>
        </div>
      </div>

      <div className="lg:col-span-5 relative group">
        <div className="absolute inset-0 bg-rose-400 rounded-[6rem] blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="relative glass-card p-6 rounded-[6rem] rotate-1 group-hover:rotate-0 transition-transform duration-1000">
          <img
            src="images/pexels-alialcantara-12319186.jpg"
            alt="Wellness Essentials"
            className="w-full aspect-[4/5] object-cover rounded-[5rem] shadow-2xl brightness-105"
          />
          <div className="absolute -bottom-8 -left-8 glass-card p-10 rounded-[3rem] shadow-2xl border-white animate-reveal delay-300">
            <div className="flex items-center gap-4 mb-3">
              <i className="fas fa-star text-rose-500 text-xs"></i>
              <i className="fas fa-star text-rose-500 text-xs"></i>
              <i className="fas fa-star text-rose-500 text-xs"></i>
              <i className="fas fa-star text-rose-500 text-xs"></i>
              <i className="fas fa-star text-rose-500 text-xs"></i>
            </div>
            <p className="text-rose-950 font-black text-lg italic tracking-tight">"Life changing."</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const SubscriptionInfoSection: React.FC<{ setView: (v: View) => void }> = ({ setView }) => (
  <section className="py-40 relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-20 items-end mb-32">
        <div>
          <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] mb-6 block">The PadPal Standard</span>
          <h2 className="text-6xl lg:text-8xl font-black text-rose-950 tracking-tighter leading-[0.9] mb-8">
            Effortless <br />Automation.
          </h2>
        </div>
        <p className="text-xl text-rose-900/50 font-medium leading-relaxed max-w-md pb-4">
          We combined smart health tracking with automated logistics to ensure you never have to think about buying pads again.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          {
            title: "Smart Syncing",
            desc: "Our AI predicts your flow dates and schedules your 'Care Package' to arrive 3 days before you need it.",
            icon: "fa-brain",
            color: "bg-rose-500"
          },
          {
            title: "Member Pricing",
            desc: "Enjoy an evergreen 15% discount and priority shipping on all subscription orders. No hidden fees.",
            icon: "fa-percentage",
            color: "bg-rose-500"
          },
          {
            title: "Pure Flexibility",
            desc: "One-click pause. No contracts. No hassle. Manage everything from your elegant member profile.",
            icon: "fa-sliders-h",
            color: "bg-rose-500"
          }
        ].map((item, i) => (
          <div key={i} className="glass-card p-16 rounded-[4rem] hover:bg-white transition-all duration-700 border-rose-100 group">
            <div className={`w-20 h-20 rounded-3xl ${item.color} text-white flex items-center justify-center text-3xl mb-12 shadow-2xl shadow-rose-200 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
              <i className={`fas ${item.icon}`}></i>
            </div>
            <h3 className="text-3xl font-black text-rose-950 mb-6 tracking-tight leading-none">{item.title}</h3>
            <p className="text-rose-900/60 text-lg font-medium leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const AboutUsSection: React.FC = () => (
  <section className="py-40 bg-white relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Introduction */}
      <div className="grid lg:grid-cols-2 gap-24 items-center mb-40">
        <div className="space-y-12">
          <div className="space-y-6">
            <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.5em] block">About PadPals</span>
            <h2 className="text-6xl lg:text-8xl font-black text-rose-950 tracking-tighter leading-[0.9]">
              Support <br />You Can <br /><span className="text-rose-500 italic font-['Playfair_Display']">Trust.</span>
            </h2>
          </div>
          <div className="space-y-8 text-xl text-rose-900/70 font-medium leading-relaxed">
            <p>PadPals was created to solve a simple but critical problem: access to affordable, reliable period care.</p>
            <p>For many women—especially students—sanitary pads are an ongoing necessity that shouldn’t be difficult, expensive, or uncertain to obtain. Yet too often, access depends on timing, budget, or availability. PadPals exists to change that.</p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-10 bg-rose-50 rounded-[6rem] -z-10 animate-pulse-soft"></div>
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200"
            alt="Group of Happy Women"
            className="rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] w-full"
          />
          <div className="absolute -bottom-12 -right-12 glass-card p-12 rounded-[4rem] shadow-2xl border-white animate-reveal">
            <p className="text-rose-500 font-black text-4xl leading-none">Your Pal,</p>
            <p className="text-rose-950 font-black text-xl italic font-['Playfair_Display']">Every Month.</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16 mb-40">
        <div className="space-y-6">
          <h3 className="text-3xl font-black text-rose-950 tracking-tight">What We Do</h3>
          <p className="text-rose-900/60 leading-relaxed text-lg">PadPals partners with Universities, colleges, and student residences to supply quality sanitary pads at reduced costs, delivered on a subscription basis. This ensures that women always have access to what they need, without stress or disruption.</p>
        </div>
        <div className="space-y-6">
          <h3 className="text-3xl font-black text-rose-950 tracking-tight">Why PadPals?</h3>
          <p className="text-rose-900/60 leading-relaxed text-lg">A pal is someone reliable, supportive, and always there. That’s how we approach period care: Always available, always affordable, and always reliable. We believe period care is not a luxury—it’s a basic need.</p>
        </div>
        <div className="space-y-6">
          <h3 className="text-3xl font-black text-rose-950 tracking-tight">Our Mission</h3>
          <p className="text-rose-900/60 leading-relaxed text-lg">To make period care accessible and affordable for women everywhere—starting with students—through smart subscriptions and institutional partnerships.</p>
        </div>
      </div>

      {/* Vision & Serve Banner */}
      <div className="relative rounded-[5rem] bg-rose-950 p-16 lg:p-24 overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px]"></div>
        <div className="relative z-10 grid lg:grid-cols-2 gap-20">
          <div>
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] mb-4 block">Our Vision</span>
            <p className="text-3xl lg:text-4xl font-black text-white leading-tight">A future where no woman has to worry about access to sanitary products, and where universities actively support dignity and health on campus.</p>
          </div>
          <div className="flex flex-col justify-center gap-8">
            <h4 className="text-white text-xl font-black border-l-4 border-rose-500 pl-6 uppercase tracking-widest text-xs">Who We Serve</h4>
            <div className="flex flex-wrap gap-4">
              {['Female Students', 'Universities', 'Student Wellness Centers', 'Inclusion Focused Groups'].map(item => (
                <span key={item} className="px-6 py-3 bg-white/10 rounded-2xl text-rose-200 text-xs font-black uppercase tracking-widest border border-white/5">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PadPals Promise */}
      <div className="mt-40 text-center space-y-8">
        <h3 className="text-5xl font-black text-rose-950 tracking-tighter">PadPals Promise</h3>
        <p className="text-2xl text-rose-900/40 font-medium max-w-3xl mx-auto italic font-['Playfair_Display']">"With PadPals, you’re never caught unprepared. You’re supported by a system designed to care—every month, every cycle."</p>
      </div>
    </div>
  </section>
);


export default App;
