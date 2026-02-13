import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminRequest, Product, UserProfile } from '../types';
import AdminPanel from './AdminPanel';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface SuperAdminPanelProps {
    userProfile: UserProfile;
    products: Product[];
    onUpdateProduct: (product: Product) => void;
    onAddProduct: (product: Product) => void;
}

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ userProfile, products, onUpdateProduct, onAddProduct }) => {
    const [activeTab, setActiveTab] = useState<'requests' | 'products'>('requests');
    const [requests, setRequests] = useState<AdminRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'Pending' | 'Approved' | 'Denied'>('all');

    useEffect(() => {
        if (activeTab === 'requests') {
            fetchRequests();
        }
    }, [activeTab, filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const url = filter === 'all'
                ? `${API_BASE_URL}/admin-requests`
                : `${API_BASE_URL}/admin-requests?status=${filter}`;

            if (!userProfile?.id) return;

            const { data } = await axios.get(url, {
                headers: { 'x-user-id': userProfile.id }
            });
            setRequests(data);
        } catch (err) {
            console.error('Error fetching admin requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: string) => {
        if (!userProfile?.id) return;
        try {
            await axios.put(
                `${API_BASE_URL}/admin-requests/${requestId}`,
                { status: 'Approved', reviewerId: userProfile.id },
                { headers: { 'x-user-id': userProfile.id } }
            );
            fetchRequests();
            alert('Admin request approved successfully!');
        } catch (err) {
            console.error('Error approving request:', err);
            alert('Failed to approve request');
        }
    };

    const handleDeny = async (requestId: string) => {
        if (!userProfile?.id) return;
        try {
            await axios.put(
                `${API_BASE_URL}/admin-requests/${requestId}`,
                { status: 'Denied', reviewerId: userProfile.id },
                { headers: { 'x-user-id': userProfile.id } }
            );
            fetchRequests();
            alert('Admin request denied');
        } catch (err) {
            console.error('Error denying request:', err);
            alert('Failed to deny request');
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
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-reveal">
            {/* Header */}
            <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-black text-rose-950 tracking-tighter leading-tight font-['Playfair_Display'] italic">
                    Super Admin Panel
                </h2>
                <p className="text-xl text-rose-900/40 font-medium">
                    Manage admin requests and product listings
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b-2 border-rose-100">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-8 py-4 font-black text-sm uppercase tracking-widest transition-all relative ${activeTab === 'requests'
                        ? 'text-rose-500'
                        : 'text-rose-900/40 hover:text-rose-500'
                        }`}
                >
                    Admin Requests
                    {activeTab === 'requests' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-t-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-8 py-4 font-black text-sm uppercase tracking-widest transition-all relative ${activeTab === 'products'
                        ? 'text-rose-500'
                        : 'text-rose-900/40 hover:text-rose-500'
                        }`}
                >
                    Product Management
                    {activeTab === 'products' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-t-full"></div>
                    )}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'requests' ? (
                <div className="space-y-8">
                    {/* Filter */}
                    <div className="flex gap-4">
                        {['all', 'Pending', 'Approved', 'Denied'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as typeof filter)}
                                className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-rose-500 text-white shadow-lg'
                                    : 'bg-white/60 text-rose-900/60 hover:bg-white border border-rose-100'
                                    }`}
                            >
                                {f === 'all' ? 'All Requests' : f}
                            </button>
                        ))}
                    </div>

                    {/* Requests List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="glass-card rounded-[4rem] p-16 text-center">
                            <i className="fas fa-inbox text-6xl text-rose-200 mb-6"></i>
                            <p className="text-2xl font-black text-rose-900/40">No requests found</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {requests.map((request) => (
                                <div
                                    key={request.id}
                                    className="glass-card rounded-[3rem] p-8 shadow-xl border-rose-100 hover:shadow-2xl transition-shadow"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex-grow space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-2xl font-black text-rose-950">{request.userName}</h3>
                                                    <p className="text-sm text-rose-900/60 font-medium">{request.userEmail}</p>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Reason</label>
                                                <p className="text-rose-900/70 mt-2 leading-relaxed">{request.reason}</p>
                                            </div>

                                            <div className="flex gap-6 text-sm">
                                                <div>
                                                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Submitted</label>
                                                    <p className="text-rose-950 font-bold mt-1">{new Date(request.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                {request.reviewedAt && (
                                                    <div>
                                                        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Reviewed</label>
                                                        <p className="text-rose-950 font-bold mt-1">{new Date(request.reviewedAt).toLocaleDateString()}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {request.status === 'Pending' && (
                                            <div className="flex md:flex-col gap-3">
                                                <button
                                                    onClick={() => handleApprove(request.id)}
                                                    className="px-6 py-3 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg"
                                                >
                                                    <i className="fas fa-check mr-2"></i>
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleDeny(request.id)}
                                                    className="px-6 py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg"
                                                >
                                                    <i className="fas fa-times mr-2"></i>
                                                    Deny
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <AdminPanel
                    products={products}
                    onUpdateProduct={onUpdateProduct}
                    onAddProduct={onAddProduct}
                    userProfile={userProfile}
                />
            )}
        </div>
    );
};

export default SuperAdminPanel;
