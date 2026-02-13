
import React, { useState } from 'react';
import { UserProfile, Order } from '../types';

interface OrderTrackingProps {
    order: Order;
    onClose: () => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ order, onClose }) => {
    // Mock tracking data for now, similar to mobile implementation
    // In a real app, this would come from an API endpoint like /api/orders/:id/tracking
    const steps = [
        { title: 'Order Filled', icon: 'fa-clipboard-check', date: new Date(order.created_at).toLocaleString() },
        { title: 'Processed', icon: 'fa-cog', date: new Date(new Date(order.created_at).getTime() + 3600000).toLocaleString() }, // +1 hour
        { title: 'Packaged', icon: 'fa-box', date: order.status !== 'Processing' ? new Date(new Date(order.created_at).getTime() + 7200000).toLocaleString() : null }, // +2 hours
        { title: 'Out for Delivery', icon: 'fa-bicycle', date: null },
        { title: 'Delivered', icon: 'fa-check-circle', date: null },
    ];

    /* 
       Determine current step index based on order status.
       Mappings:
       Processing -> Index 1 (Processed) - Assuming it's filled & processed
       Shipped -> Index 3 (Out for Delivery)
       Delivered -> Index 4 (Delivered)
    */
    let currentStepIndex = 1;
    if (order.status === 'Shipped') currentStepIndex = 3;
    if (order.status === 'Delivered') currentStepIndex = 4;

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
                        style={{ height: `${(currentStepIndex / (steps.length - 1)) * 85}%` }}
                    ></div>

                    {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

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
