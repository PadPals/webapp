
import React, { useState } from 'react';
import axios from 'axios';
import { UserProfile, Subscription, Order } from '../types';
import Login from './Login';
import OrderTracking from './OrderTracking';
import { SOUTH_AFRICAN_UNIVERSITIES, SOUTH_AFRICAN_TOWNS } from '../constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ProfileProps {
    userProfile: UserProfile;
    onUpdateProfile: (updates: Partial<UserProfile>) => void;
    subscriptions: Subscription[];
    onUpdateSubscription: (id: string, status: Subscription['status']) => void;
    onAdminClick: () => void;
    onSuperAdminClick: () => void;
    isGuest: boolean;
    onLogin: (user: any) => void;
}

const Profile: React.FC<ProfileProps> = ({
    userProfile,
    onUpdateProfile,
    subscriptions,
    onUpdateSubscription,
    onAdminClick,
    onSuperAdminClick,
    isGuest,
    onLogin
}) => {
    const [showLogin, setShowLogin] = useState(false);
    const [password, setPassword] = useState(''); // New state for signup
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // For tracking modal

    const initials = userProfile.name ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    const deductionDays = Array.from({ length: 31 }, (_, i) => {
        const day = i + 1;
        let suffix = 'th';
        if (day === 1 || day === 21 || day === 31) suffix = 'st';
        else if (day === 2 || day === 22) suffix = 'nd';
        else if (day === 3 || day === 23) suffix = 'rd';
        return `${day}${suffix}`;
    });

    const handleSignup = async () => {
        try {
            if (!userProfile.name || !userProfile.email || !password) {
                alert('Please fill in Name, Email and Password');
                return;
            }

            const payload = {
                name: userProfile.name,
                email: userProfile.email,
                password: password,
                isStudent: userProfile.isStudent,
                university: userProfile.university,
                address: userProfile.address,
                town: userProfile.town,
                age: userProfile.age,
                phone: '', // Optional add if needed
                username: userProfile.email.split('@')[0]
            };

            const response = await axios.post(`${API_BASE_URL}/auth/signup`, payload);
            alert('Account created! Logging you in...');
            onLogin(response.data.user);
        } catch (error: any) {
            console.error('Signup failed:', error);
            alert(error.response?.data?.error || 'Signup failed');
        }
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`${API_BASE_URL}/users/${userProfile.id}`, userProfile);
            alert('Profile updated!');
        } catch (error) {
            console.error('Update failed', error);
            alert('Update failed');
        }
    }


    return (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16 animate-reveal">
            {/* Registration Focused Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-6 text-center md:text-left">
                    <h2 className="text-5xl md:text-7xl font-black text-rose-950 tracking-tighter leading-tight font-['Playfair_Display'] italic">
                        {isGuest ? 'Join the Palhood,' : `Hey pal,`} <br />
                        <span className="text-rose-500 font-sans not-italic">{isGuest ? 'get started today' : 'welcome back'}</span>
                    </h2>
                    <p className="text-xl text-rose-900/40 font-medium max-w-2xl">
                        {isGuest ? 'Create an account to track your orders and manage subscriptions.' : 'Manage your profile and track active orders.'}
                    </p>
                </div>

                {isGuest && (
                    <button
                        onClick={() => setShowLogin(!showLogin)}
                        className="px-8 py-4 bg-rose-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-800 transition-all shadow-xl"
                    >
                        {showLogin ? 'Back to Signup' : 'Existing Pal? Login'}
                    </button>
                )}

            </div>

            {isGuest && showLogin ? (
                <div className="animate-reveal">
                    <Login onLogin={(u) => { setShowLogin(false); onLogin(u); }} />
                </div>
            ) : (
                <div className="grid lg:grid-cols-12 gap-12 items-start">

                    {/* LEFT COLUMN: Signup Form (Guest) OR Order Tracking (User) */}
                    <div className="lg:col-span-8">
                        {isGuest ? (
                            <div className="glass-card rounded-[4rem] p-8 md:p-12 shadow-2xl border-rose-100/40">
                                <h3 className="text-2xl font-black text-rose-950 mb-8">Create Account</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            value={userProfile.name}
                                            onChange={(e) => onUpdateProfile({ name: e.target.value })}
                                            placeholder="Your name"
                                            className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950 placeholder:text-rose-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Email</label>
                                        <input
                                            value={userProfile.email}
                                            onChange={(e) => onUpdateProfile({ email: e.target.value })}
                                            placeholder="your@email.com"
                                            type="email"
                                            className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950 placeholder:text-rose-200"
                                        />
                                    </div>

                                    {/* Password Field for Signup */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Password</label>
                                        <input
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create a password"
                                            type="password"
                                            className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950 placeholder:text-rose-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Age</label>
                                        <input
                                            type="number"
                                            value={userProfile.age}
                                            onChange={(e) => onUpdateProfile({ age: e.target.value })}
                                            placeholder="e.g. 21"
                                            className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950 placeholder:text-rose-200"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Account Type</label>
                                        <div className="flex bg-rose-50 p-1 rounded-2xl border border-rose-100">
                                            <button
                                                onClick={() => onUpdateProfile({ isStudent: true })}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userProfile.isStudent ? 'bg-rose-500 text-white shadow-md' : 'text-rose-400 hover:text-rose-600'}`}
                                            >
                                                Student Pal
                                            </button>
                                            <button
                                                onClick={() => onUpdateProfile({ isStudent: false })}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!userProfile.isStudent ? 'bg-rose-500 text-white shadow-md' : 'text-rose-400 hover:text-rose-600'}`}
                                            >
                                                Everyday Pal
                                            </button>
                                        </div>
                                    </div>

                                    {userProfile.isStudent ? (
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">University</label>
                                            <select
                                                value={userProfile.university}
                                                onChange={(e) => onUpdateProfile({ university: e.target.value })}
                                                className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950 appearance-none bg-no-repeat bg-[right_1.5rem_center]"
                                            >
                                                <option value="">Select University</option>
                                                {SOUTH_AFRICAN_UNIVERSITIES.map(uni => <option key={uni} value={uni}>{uni}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Delivery Address</label>
                                            <input
                                                value={userProfile.address}
                                                onChange={(e) => onUpdateProfile({ address: e.target.value })}
                                                placeholder="Street, Suburb, etc."
                                                className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950 placeholder:text-rose-200"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Town / City</label>
                                        <select
                                            value={userProfile.town}
                                            onChange={(e) => onUpdateProfile({ town: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950"
                                        >
                                            <option value="">Select Town</option>
                                            {SOUTH_AFRICAN_TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-12">
                                    <button
                                        onClick={handleSignup}
                                        className="w-full md:w-auto px-12 py-6 glass-button-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform"
                                    >
                                        Create Account
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // LOGGED IN USER VIEW - ORDER TRACKING
                            <div className="space-y-8">
                                {/* Edit Profile Section (Collapsed by default or simple inputs) - Keeping it readable but secondary */}
                                <div className="glass-card rounded-[3rem] p-8 border-rose-100/40">
                                    <h3 className="text-xl font-black text-rose-950 mb-6">Profile Settings</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest ml-1">Name</label>
                                            <input value={userProfile.name} onChange={(e) => onUpdateProfile({ name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/60 border border-rose-50 text-sm font-bold text-rose-950" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest ml-1">Email</label>
                                            <input value={userProfile.email} disabled className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold text-gray-400 cursor-not-allowed" />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest ml-1">Address / University</label>
                                            <input value={userProfile.isStudent ? userProfile.university : userProfile.address} onChange={(e) => onUpdateProfile(userProfile.isStudent ? { university: e.target.value } : { address: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/60 border border-rose-50 text-sm font-bold text-rose-950" />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
                                        <div className="flex gap-4">
                                            {!isGuest && (userProfile.isAdmin || userProfile.isSuperAdmin) && (
                                                <button
                                                    onClick={onAdminClick}
                                                    className="px-6 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                                                >
                                                    <i className="fas fa-tasks mr-2"></i>
                                                    Manage Products
                                                </button>
                                            )}
                                            {!isGuest && userProfile.isSuperAdmin && (
                                                <button
                                                    onClick={onSuperAdminClick}
                                                    className="px-6 py-3 bg-rose-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-800 transition-colors shadow-lg"
                                                >
                                                    <i className="fas fa-user-shield mr-2"></i>
                                                    Manage Requests
                                                </button>
                                            )}
                                            {!isGuest && !userProfile.isAdmin && !userProfile.isSuperAdmin && (
                                                <button
                                                    onClick={() => {
                                                        const event = new CustomEvent('setView', { detail: 'admin_apply' });
                                                        window.dispatchEvent(event);
                                                    }}
                                                    className="px-6 py-3 bg-white border border-rose-200 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-colors"
                                                >
                                                    <i className="fas fa-plus-circle mr-2"></i>
                                                    Apply for Admin
                                                </button>
                                            )}
                                        </div>
                                        <button onClick={handleUpdate} className="px-6 py-3 bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-200 transition-colors">Update Details</button>
                                    </div>
                                </div>

                                {/* Order Tracking Section */}
                                <div className="glass-card rounded-[3rem] p-8 md:p-10 shadow-2xl border-rose-100/40">
                                    <h3 className="text-2xl font-black text-rose-950 mb-8 flex items-center gap-3">
                                        <i className="fas fa-box-open text-rose-500"></i>
                                        Order History
                                    </h3>

                                    {(!userProfile.orderHistory || userProfile.orderHistory.length === 0) ? (
                                        <div className="text-center py-12 bg-white/40 rounded-3xl border border-dashed border-rose-200">
                                            <p className="text-rose-400 font-medium">No orders yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userProfile.orderHistory.map((order: any) => (
                                                <div key={order.id} className="bg-white/60 p-6 rounded-[2rem] border border-white/60 hover:shadow-lg transition-all">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-1">Order #{order.id.slice(-6).toUpperCase()}</span>
                                                            <h4 className="text-lg font-black text-rose-950">{new Date(order.created_at).toLocaleDateString()}</h4>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                                            }`}>
                                                            {order.status}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-rose-50">
                                                        <span className="font-bold text-rose-950">R {Number(order.total).toFixed(2)}</span>
                                                        <button
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="px-4 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors"
                                                        >
                                                            Track Order
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: Account Summary (Existing) */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass-card rounded-[4rem] p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 text-rose-500 group-hover:scale-125 transition-transform duration-700">
                                <i className="fas fa-heart text-9xl"></i>
                            </div>
                            <div className="w-20 h-20 bg-rose-500 rounded-[2.2rem] flex items-center justify-center text-white text-3xl font-black mb-10 shadow-xl rotate-3">
                                {initials}
                            </div>
                            <h3 className="text-2xl font-black text-rose-950 mb-2">{userProfile.name || 'Pal Candidate'}</h3>
                            <p className="text-xs font-black text-rose-400 uppercase tracking-widest mb-10">{isGuest ? 'Guest Account' : 'Account Verified'}</p>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-4 border-b border-rose-50">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rewards</span>
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Bronze Tier</span>
                                </div>
                                <div className="flex justify-between items-center py-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subs</span>
                                    <span className="text-[10px] font-black text-rose-950 uppercase tracking-widest">{subscriptions.length} Active</span>
                                </div>
                            </div>

                            {/* Admin Panel Button */}
                            {!isGuest && userProfile.isAdmin && (
                                <div className="mt-8 pt-8 border-t border-rose-100">
                                    <button onClick={onAdminClick} className="w-full py-4 bg-rose-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-800 transition-colors shadow-xl">
                                        {userProfile.isSuperAdmin ? 'Super Admin Panel' : 'Admin Panel'}
                                    </button>
                                </div>
                            )}

                            {/* Logout Button */}
                            {!isGuest && (
                                <div className="mt-4">
                                    <button onClick={() => { localStorage.removeItem('padpals_user'); window.location.reload(); }} className="w-full py-4 bg-white border border-rose-100 text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-colors">
                                        Sign Out
                                    </button>
                                </div>
                            )}

                        </div>

                        <div className="bg-rose-950 p-10 rounded-[4rem] shadow-2xl relative overflow-hidden group border border-rose-900">
                            {/* Promo content, kept from original design if needed, or simplified */}
                            <h4 className="text-white font-black text-xl mb-4">PadPal Verified</h4>
                            <p className="text-white/60 text-sm mb-6">Join 12,000+ happy members.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tracking Modal */}
            {selectedOrder && (
                <OrderTracking order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </div>
    );
};

export default Profile;
