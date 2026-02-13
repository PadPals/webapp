
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { OrderWithUser, OrderItem, OrderTrackingEntry } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface OrderManagementModalProps {
    order: OrderWithUser;
    onClose: () => void;
    onStatusUpdate: () => void;
    adminId: string;
}

const OrderManagementModal: React.FC<OrderManagementModalProps> = ({ order, onClose, onStatusUpdate, adminId }) => {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [tracking, setTracking] = useState<OrderTrackingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [newStatus, setNewStatus] = useState('');
    const [newLocation, setNewLocation] = useState('Warehouse');
    const [updating, setUpdating] = useState(false);

    const statusOptions = [
        'Filled',
        'Processed',
        'Packaged',
        'Out for Delivery',
        'Delivered',
        'Shipped',
        'Processing'
    ];

    useEffect(() => {
        fetchOrderDetails();
    }, [order.id]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const [itemsRes, trackingRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/admin/orders/${order.id}`, { headers: { 'x-user-id': adminId } }),
                axios.get(`${API_BASE_URL}/orders/${order.id}/tracking`)
            ]);
            setItems(itemsRes.data);
            setTracking(trackingRes.data);
        } catch (err) {
            console.error('Error fetching order details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTracking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStatus || !newLocation) return;

        setUpdating(true);
        try {
            await axios.post(`${API_BASE_URL}/admin/orders/${order.id}/tracking`,
                { status: newStatus, location: newLocation },
                { headers: { 'x-user-id': adminId } }
            );
            setNewStatus('');
            await fetchOrderDetails();
            onStatusUpdate(); // Refresh the main list
            alert('Tracking updated!');
        } catch (err) {
            console.error('Error updating tracking:', err);
            alert('Failed to update tracking');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-rose-950/20 backdrop-blur-sm animate-reveal">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-4xl w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center hover:bg-rose-100 transition-all">
                    <i className="fas fa-times text-rose-400"></i>
                </button>

                <div className="mb-12">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-2">Manage Order</span>
                    <h2 className="text-4xl font-black text-rose-950 tracking-tighter">Order #{order.id.slice(-6).toUpperCase()}</h2>
                    <div className="flex flex-wrap gap-4 mt-4">
                        <div className="px-4 py-2 bg-rose-50 rounded-xl border border-rose-100 text-[10px] font-black text-rose-900 uppercase tracking-widest">
                            Customer: {order.userName}
                        </div>
                        <div className="px-4 py-2 bg-rose-50 rounded-xl border border-rose-100 text-[10px] font-black text-rose-900 uppercase tracking-widest">
                            Email: {order.userEmail}
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                            }`}>
                            {order.status}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Left: Items & History */}
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-xl font-black text-rose-950 mb-6 flex items-center gap-3">
                                <i className="fas fa-shopping-bag text-rose-500 text-sm"></i>
                                Package Contents
                            </h3>
                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.id} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-rose-950">{item.product_name}</p>
                                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">x {item.quantity}</p>
                                        </div>
                                        <p className="font-black text-rose-950">R {Number(item.price).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-rose-950 mb-6 flex items-center gap-3">
                                <i className="fas fa-history text-rose-500 text-sm"></i>
                                Tracking History
                            </h3>
                            <div className="space-y-6 relative pl-6">
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-rose-100"></div>
                                {tracking.map((t, idx) => (
                                    <div key={t.id} className="relative">
                                        <div className={`absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${idx === tracking.length - 1 ? 'bg-rose-500 animate-pulse' : 'bg-rose-200'
                                            }`}></div>
                                        <p className="text-sm font-bold text-rose-950">{t.status}</p>
                                        <p className="text-[10px] font-medium text-rose-400 italic">{t.location} • {new Date(t.timestamp).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Update Form */}
                    <div className="glass-card rounded-[2.5rem] p-8 border-rose-100/50 h-fit sticky top-0">
                        <h3 className="text-xl font-black text-rose-950 mb-8">Post Status Update</h3>
                        <form onSubmit={handleAddTracking} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Status</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl bg-white border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950 appearance-none bg-no-repeat bg-[right_1.5rem_center]"
                                    required
                                >
                                    <option value="">Select Status...</option>
                                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Location</label>
                                <input
                                    type="text"
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    placeholder="e.g. Distribution Center"
                                    className="w-full px-6 py-4 rounded-2xl bg-white border border-rose-50 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-rose-950"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={updating || !newStatus}
                                className="w-full py-5 bg-rose-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-600 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {updating ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-paper-plane"></i>}
                                Update Order
                            </button>
                        </form>

                        <div className="mt-8 p-6 bg-rose-50/50 rounded-2xl border border-rose-100/30">
                            <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1 italic">Note</p>
                            <p className="text-[10px] text-rose-900/60 leading-relaxed font-medium">Updating to major states like 'Shipped' or 'Delivered' will update the customer's main order view automatically.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderManagementModal;
