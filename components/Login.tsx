import React, { useState } from 'react';
import axios from 'axios';

interface LoginProps {
    onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        identifier: ''
    });

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
                    identifier: formData.identifier,
                    password: formData.password
                });
                onLogin(data.user);
            } else {
                const { data } = await axios.post(`${API_BASE_URL}/auth/signup`, {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                onLogin(data.user);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-20 animate-reveal">
            <div className="glass-card rounded-[4rem] p-10 md:p-16 shadow-2xl border-rose-100/40 text-center">
                <div className="w-20 h-20 bg-rose-500 rounded-[2.2rem] flex items-center justify-center text-white text-3xl font-black mb-10 shadow-xl mx-auto rotate-3">
                    <i className={`fas ${isLogin ? 'fa-lock' : 'fa-user-plus'}`}></i>
                </div>

                <h2 className="text-4xl font-black text-rose-950 tracking-tighter mb-4 italic font-['Playfair_Display']">
                    {isLogin ? 'Welcome back' : 'Join the Pals'}
                </h2>
                <p className="text-rose-900/40 font-medium mb-12">
                    {isLogin ? 'Please enter your details to continue.' : 'Start your journey to effortless care.'}
                </p>

                {error && (
                    <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-black text-rose-500 uppercase tracking-widest animate-reveal">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
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

                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">
                            {isLogin ? 'Email or Username' : 'Email'}
                        </label>
                        <input
                            required
                            type={isLogin ? 'text' : 'email'}
                            value={isLogin ? formData.identifier : formData.email}
                            onChange={(e) => setFormData({ ...formData, [isLogin ? 'identifier' : 'email']: e.target.value })}
                            placeholder={isLogin ? "email@example.com" : "your@email.com"}
                            className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950"
                        />
                    </div>

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

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-6 mt-6 glass-button-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all ${loading ? 'opacity-50' : 'hover:scale-[1.02]'}`}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-rose-50">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already a pal? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
