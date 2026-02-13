
import React, { useState } from 'react';
import axios from 'axios';

interface LoginProps {
    onLogin: (user: any) => void;
}

type Mode = 'login' | 'signup' | 'forgot' | 'reset';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [mode, setMode] = useState<Mode>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        identifier: '',
        otp: '',
        newPassword: ''
    });

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (mode === 'login') {
                const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
                    identifier: formData.identifier,
                    password: formData.password
                });
                onLogin(data.user);
            } else if (mode === 'signup') {
                const { data } = await axios.post(`${API_BASE_URL}/auth/signup`, {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                onLogin(data.user);
            } else if (mode === 'forgot') {
                await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
                    email: formData.email
                });
                setSuccessMsg('Reset code sent! Check your email (or server console).');
                setMode('reset');
            } else if (mode === 'reset') {
                await axios.post(`${API_BASE_URL}/auth/reset-password`, {
                    email: formData.email,
                    token: formData.otp,
                    newPassword: formData.newPassword
                });
                setSuccessMsg('Password reset successful! Please login.');
                setTimeout(() => setMode('login'), 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Operation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        switch (mode) {
            case 'login': return 'Welcome back';
            case 'signup': return 'Join the Pals';
            case 'forgot': return 'Reset Password';
            case 'reset': return 'New Password';
        }
    };

    const getSubtitle = () => {
        switch (mode) {
            case 'login': return 'Please enter your details to continue.';
            case 'signup': return 'Start your journey to effortless care.';
            case 'forgot': return 'Enter your email to receive a reset code.';
            case 'reset': return 'Enter the code and your new password.';
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-20 animate-reveal">
            <div className="glass-card rounded-[4rem] p-10 md:p-16 shadow-2xl border-rose-100/40 text-center">
                <div className="w-20 h-20 bg-rose-500 rounded-[2.2rem] flex items-center justify-center text-white text-3xl font-black mb-10 shadow-xl mx-auto rotate-3">
                    <i className={`fas ${mode === 'login' ? 'fa-lock' : mode === 'signup' ? 'fa-user-plus' : 'fa-key'}`}></i>
                </div>

                <h2 className="text-4xl font-black text-rose-950 tracking-tighter mb-4 italic font-['Playfair_Display']">
                    {getTitle()}
                </h2>
                <p className="text-rose-900/40 font-medium mb-12">
                    {getSubtitle()}
                </p>

                {error && (
                    <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-black text-rose-500 uppercase tracking-widest animate-reveal">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-2xl text-[10px] font-black text-green-600 uppercase tracking-widest animate-reveal">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {mode === 'signup' && (
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your name"
                                className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950"
                            />
                        </div>
                    )}

                    {(mode === 'login' || mode === 'signup') && (
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">
                                {mode === 'login' ? 'Email or Username' : 'Email'}
                            </label>
                            <input
                                required
                                type={mode === 'login' ? 'text' : 'email'}
                                value={mode === 'login' ? formData.identifier : formData.email}
                                onChange={(e) => setFormData({ ...formData, [mode === 'login' ? 'identifier' : 'email']: e.target.value })}
                                placeholder={mode === 'login' ? "email@example.com" : "your@email.com"}
                                className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950"
                            />
                        </div>
                    )}

                    {/* Forgot Password Email Input */}
                    {mode === 'forgot' && (
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Account Email</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="your@email.com"
                                className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950"
                            />
                        </div>
                    )}

                    {/* Reset Password Inputs */}
                    {mode === 'reset' && (
                        <>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Reset Code</label>
                                <input
                                    required
                                    value={formData.otp}
                                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                    placeholder="123456"
                                    className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950"
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">New Password</label>
                                <input
                                    required
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    placeholder="New Password"
                                    className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950"
                                />
                            </div>
                        </>
                    )}


                    {(mode === 'login' || mode === 'signup') && (
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Password</label>
                            <input
                                required
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950"
                            />
                        </div>
                    )}

                    {/* Forgot Password Link */}
                    {mode === 'login' && (
                        <div className="text-right">
                            <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-bold text-rose-400 uppercase tracking-widest hover:text-rose-600">
                                Forgot Password?
                            </button>
                        </div>
                    )}


                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-6 mt-6 glass-button-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all ${loading ? 'opacity-50' : 'hover:scale-[1.02]'}`}
                    >
                        {loading ? 'Processing...' : (
                            mode === 'login' ? 'Login' :
                                mode === 'signup' ? 'Sign Up' :
                                    mode === 'forgot' ? 'Send Reset Code' : 'Reset Password'
                        )}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-rose-50">
                    <button
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
                    >
                        {mode === 'login' ? "Don't have an account? Sign Up" : "Back to Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
