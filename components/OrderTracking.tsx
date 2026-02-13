
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserProfile, Order } from '../types';

interface OrderTrackingProps {
    order: Order;
    onClose: () => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ order, onClose }) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const [tracking, setTracking] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTracking();
    }, [order.id]);

    const fetchTracking = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/orders/${order.id}/tracking`);
            setTracking(data);
        } catch (err) {
            console.error('Error fetching tracking:', err);
        } finally {
            setLoading(false);
        }
    };

    // Major stages that map to our icons/timeline
    const stages = [
        { key: 'Filled', title: 'Order Filled', icon: 'fa-clipboard-check' },
        { key: 'Processed', title: 'Processed', icon: 'fa-cog' },
        { key: 'Packaged', title: 'Packaged', icon: 'fa-box' },
        { key: 'Out for Delivery', title: 'Out for Delivery', icon: 'fa-bicycle' },
        { key: 'Delivered', title: 'Delivered', icon: 'fa-check-circle' },
    ];

    // Find the current status in the tracking history
    const currentStatus = tracking.length > 0 ? tracking[tracking.length - 1].status : order.status;
    const currentStepIndex = stages.findIndex(s => s.key === currentStatus);

    // For the timeline, we'll use the tracking entries we actually have
    // but keep the skeleton of all stages if we want to show progress
    const displaySteps = stages.map((stage, index) => {
        const foundEntry = tracking.find(t => t.status === stage.key);
        return {
            ...stage,
            date: foundEntry ? new Date(foundEntry.timestamp).toLocaleString() : null,
            isCompleted: index <= currentStepIndex || !!foundEntry
        };
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-scale-in">

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-2">Order #{order.id.slice(-6).toUpperCase()}</span>
                        <h2 className="text-3xl font-black text-rose-950">{order.status}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center hover:bg-rose-100 transition-colors"
                    >
                        <i className="fas fa-times text-rose-400"></i>
                    </button>
                </div>

                {/* Timeline */}
                <div className="relative space-y-8 pl-4">
                    {/* Vertical Line */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-100 -z-10"></div>
                    <div
                        className="absolute left-[27px] top-4 w-0.5 bg-rose-500 -z-10 transition-all duration-1000 ease-out"
                        style={{ height: `${(currentStepIndex / (stages.length - 1)) * 85}%` }}
                    ></div>

                    {displaySteps.map((step, index) => {
                        const isCompleted = step.isCompleted;

                        return (
                            <div key={index} className={`flex gap-6 items-center ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg transition-all duration-500 ${isCompleted ? 'bg-rose-500 text-white shadow-rose-200 scale-100' : 'bg-white border border-gray-100 text-gray-300 scale-95'
                                    }`}>
                                    <i className={`fas ${step.icon}`}></i>
                                </div>

                                {/* Content */}
                                <div>
                                    <h4 className={`text-lg font-black ${isCompleted ? 'text-rose-950' : 'text-gray-400'}`}>{step.title}</h4>
                                    {step.date && (
                                        <p className="text-xs font-bold text-rose-400 mt-1">{step.date}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer info */}
                {order.status === 'Delivered' && (
                    <div className="mt-8 p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                        <i className="fas fa-map-marker-alt text-green-500"></i>
                        <p className="text-xs font-bold text-green-700">Delivered to your registered address.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;
