import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface AdminApplyProps {
    userId: string | null;
    userName: string;
    onBack: () => void;
}

const AdminApply: React.FC<AdminApplyProps> = ({ userId, userName, onBack }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingRequest, setExistingRequest] = useState<AdminRequest | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (userId) {
            fetchExistingRequest();
        }
    }, [userId]);

    const fetchExistingRequest = async () => {
        if (!userId) return;

        try {
            const { data } = await axios.get(`${API_BASE_URL}/admin-requests/user/${userId}`);
            setExistingRequest(data);
        } catch (err) {
            console.error('Error fetching admin request:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            setError('You must be logged in to request admin access');
            return;
        }

        if (!reason.trim()) {
            setError('Please provide a reason for your request');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post(`${API_BASE_URL}/admin-requests`, {
                userId,
                reason: reason.trim()
            });

            setSuccess('Admin request submitted successfully! You will be notified once reviewed.');
            setReason('');
            fetchExistingRequest();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 'Approved':
                return 'bg-green-50 text-green-600 border-green-100';
            case 'Denied':
                return 'bg-red-50 text-red-600 border-red-100';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 animate-reveal">
            {/* Header */}
            <div className="space-y-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-rose-500 hover:text-rose-600 font-black text-sm uppercase tracking-widest transition-colors"
                >
                    <i className="fas fa-arrow-left"></i>
                    Back to Profile
                </button>

                <div>
                    <h2 className="text-5xl md:text-7xl font-black text-rose-950 tracking-tighter leading-tight font-['Playfair_Display'] italic">
                        Request Admin Access
                    </h2>
                    <p className="text-xl text-rose-900/40 font-medium mt-4">
                        Submit your request to become a PadPals administrator. Super admins will review your application.
                    </p>
                </div>
            </div>

            {/* Existing Request Status */}
            {existingRequest && (
                <div className="glass-card rounded-[4rem] p-8 md:p-12 shadow-2xl border-rose-100/40">
                    <div className="flex items-start justify-between mb-6">
                        <h3 className="text-3xl font-black text-rose-950 tracking-tight">Your Current Request</h3>
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(existingRequest.status)}`}>
                            {existingRequest.status}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Reason</label>
                            <p className="text-rose-900/70 mt-2 leading-relaxed">{existingRequest.reason}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Submitted</label>
                                <p className="text-rose-950 font-bold mt-1">{new Date(existingRequest.createdAt).toLocaleDateString()}</p>
                            </div>

                            {existingRequest.reviewedAt && (
                                <div>
                                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Reviewed</label>
                                    <p className="text-rose-950 font-bold mt-1">{new Date(existingRequest.reviewedAt).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>

                        {existingRequest.status === 'Denied' && (
                            <div className="mt-6 p-6 bg-rose-50 rounded-2xl border border-rose-100">
                                <p className="text-rose-900/70 text-sm">
                                    Your previous request was denied. You may submit a new request with additional information.
                                </p>
                            </div>
                        )}

                        {existingRequest.status === 'Approved' && (
                            <div className="mt-6 p-6 bg-green-50 rounded-2xl border border-green-100">
                                <p className="text-green-900/70 text-sm font-bold">
                                    🎉 Congratulations! Your admin request has been approved. You now have admin access.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Application Form */}
            {(!existingRequest || existingRequest.status === 'Denied') && (
                <div className="glass-card rounded-[4rem] p-8 md:p-12 shadow-2xl border-rose-100/40">
                    <h3 className="text-3xl font-black text-rose-950 tracking-tight mb-8">
                        {existingRequest?.status === 'Denied' ? 'Submit New Request' : 'Application Form'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">
                                Why do you want to become an admin?
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Explain your qualifications, experience, and why you'd be a good fit for the admin role..."
                                rows={6}
                                className="w-full px-6 py-4 rounded-2xl bg-white/40 border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-medium text-rose-950 placeholder:text-rose-200 resize-none"
                                required
                            />
                            <p className="text-xs text-rose-900/40 ml-1">
                                Be specific about your goals and how you plan to contribute to PadPals.
                            </p>
                        </div>

                        {error && (
                            <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                                <p className="text-red-600 text-sm font-bold">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                                <p className="text-green-600 text-sm font-bold">{success}</p>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading || !reason.trim()}
                                className="flex-grow px-12 py-6 glass-button-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </button>

                            <button
                                type="button"
                                onClick={onBack}
                                className="px-8 py-6 bg-white/60 backdrop-blur-xl text-rose-950 border border-white/80 rounded-[2rem] font-black text-xs hover:bg-white transition-all shadow-2xl uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Info Section */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-card p-10 rounded-[4rem] border-rose-100">
                    <div className="w-16 h-16 rounded-3xl bg-rose-500 text-white flex items-center justify-center text-2xl mb-6 shadow-xl">
                        <i className="fas fa-user-shield"></i>
                    </div>
                    <h4 className="text-2xl font-black text-rose-950 mb-4">Admin Responsibilities</h4>
                    <ul className="space-y-2 text-rose-900/70">
                        <li className="flex items-start gap-2">
                            <i className="fas fa-check text-rose-500 mt-1"></i>
                            <span>Manage product listings and inventory</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <i className="fas fa-check text-rose-500 mt-1"></i>
                            <span>Upload and maintain product images</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <i className="fas fa-check text-rose-500 mt-1"></i>
                            <span>Update product details and pricing</span>
                        </li>
                    </ul>
                </div>

                <div className="glass-card p-10 rounded-[4rem] border-rose-100">
                    <div className="w-16 h-16 rounded-3xl bg-rose-500 text-white flex items-center justify-center text-2xl mb-6 shadow-xl">
                        <i className="fas fa-clock"></i>
                    </div>
                    <h4 className="text-2xl font-black text-rose-950 mb-4">Review Process</h4>
                    <ul className="space-y-2 text-rose-900/70">
                        <li className="flex items-start gap-2">
                            <i className="fas fa-check text-rose-500 mt-1"></i>
                            <span>Super admins review all requests</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <i className="fas fa-check text-rose-500 mt-1"></i>
                            <span>Typically reviewed within 2-3 business days</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <i className="fas fa-check text-rose-500 mt-1"></i>
                            <span>You'll be notified of the decision</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminApply;
