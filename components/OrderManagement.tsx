
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { OrderWithUser } from '../types';
import OrderManagementModal from './OrderManagementModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface OrderManagementProps {
    adminId: string;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ adminId }) => {
    const [orders, setOrders] = useState<OrderWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'Processing' | 'Delivered' | 'Shipped' | 'Out for Delivery'>('all');
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<OrderWithUser | null>(null);

    useEffect(() => {
        fetchOrders();
    }, [adminId]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE_URL}/admin/orders`, {
                headers: { 'x-user-id': adminId }
            });
            setOrders(data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesFilter = filter === 'all' || o.status === filter;
        const searchLower = search.toLowerCase();
        const matchesSearch =
            o.id.toLowerCase().includes(searchLower) ||
            o.userName.toLowerCase().includes(searchLower) ||
            o.userEmail.toLowerCase().includes(searchLower);
        return matchesFilter && matchesSearch;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-green-50 text-green-600 border-green-100';
            case 'Processing': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Out for Delivery': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="space-y-8 animate-reveal">
            {/* Top Bar: Search & Filters */}
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                <div className="relative w-full lg:w-96 group">
                    <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-rose-500 transition-colors"></i>
                    <input
                        type="text"
                        placeholder="Search ID, Name or Email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/40 border border-white/60 focus:bg-white focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950 transition-all placeholder:text-rose-200"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    {['all', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
                                    : 'bg-white/60 text-rose-400 hover:bg-white border border-rose-100'
                                }`}
                        >
                            {f === 'all' ? 'All Orders' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table/List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="glass-card rounded-[3rem] p-20 text-center flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-200 text-3xl">
                        <i className="fas fa-receipt"></i>
                    </div>
                    <p className="text-2xl font-black text-rose-950/20 uppercase tracking-tighter">No orders found</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="glass-card rounded-[2.5rem] p-8 border-white/60 hover:shadow-2xl hover:scale-[1.01] transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8">
                                <div className="flex-grow flex gap-6 items-center">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl transition-all ${getStatusStyle(order.status).split(' ')[1].replace('text-', 'bg-').replace('-600', '-500')} text-white shadow-lg rotate-3 group-hover:rotate-0`}>
                                        <i className={`fas ${order.status === 'Delivered' ? 'fa-check' : 'fa-box-open'}`}></i>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
                                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-black text-rose-950">{order.userName}</h4>
                                        <p className="text-xs font-bold text-gray-400">{order.userEmail}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap lg:flex-nowrap items-center gap-12 border-t lg:border-t-0 pt-6 lg:pt-0 border-rose-50">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Order Details</p>
                                        <p className="text-sm font-black text-rose-950">{order.itemCount} Items • {order.type}</p>
                                        <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{order.productNames}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Total Value</p>
                                        <p className="text-xl font-black text-rose-950 tracking-tighter">R {Number(order.total).toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-300 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                        <i className="fas fa-chevron-right"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedOrder && (
                <OrderManagementModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusUpdate={fetchOrders}
                    adminId={adminId}
                />
            )}
        </div>
    );
};

export default OrderManagement;
