import React from "react";
import { FaTicketAlt, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

function CouponStats({ coupons = [] }) {
    const total = coupons.length;

    const active = coupons.filter((c) => {
        if (!c.isActive) return false;
        if (!c.validUntil) return true;
        return new Date(c.validUntil) >= new Date();
    }).length;

    const inactive = coupons.filter((c) => !c.isActive).length;

    const expired = coupons.filter((c) => {
        if (!c.validUntil) return false;
        return new Date(c.validUntil) < new Date();
    }).length;

    const cards = [
        {
            title: "Total Coupons",
            value: total,
            icon: <FaTicketAlt size={16} />,
            color: "text-blue-600 bg-blue-50 border-blue-100",
        },
        {
            title: "Active Coupons",
            value: active,
            icon: <FaCheckCircle size={16} />,
            color: "text-emerald-700 bg-emerald-50 border-emerald-100",
        },
        {
            title: "Inactive Coupons",
            value: inactive,
            icon: <FaTimesCircle size={16} />,
            color: "text-gray-600 bg-gray-50 border-gray-100",
        },
        {
            title: "Expired Coupons",
            value: expired,
            icon: <FaClock size={16} />,
            color: "text-red-600 bg-red-50 border-red-100",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
                <div
                    key={card.title} className="bg-white rounded-2xl border border-border-base shadow-xs p-3 flex items-center justify-between hover:border-gray-300 transition-colors duration-150">

                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${card.color}`}>
                            {card.icon}
                        </div>
                        <span className="text-sm font-semibold text-text-muted">
                            {card.title}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-text-base leading-none">
                        {card.value}
                    </h2>
                </div>
            ))}
        </div>
    );
}

export default CouponStats;