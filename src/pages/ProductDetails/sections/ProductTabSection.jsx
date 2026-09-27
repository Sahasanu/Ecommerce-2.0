import React, { useState } from 'react'
import ReviewsTab from './Reviews/Reviews';
import DescriptionTab from './DescriptionTab';


// ── Main Tabbed Component ─────────────────────────────────────────
const TABS = ['Details', 'Reviews',];

export default function ProductTabSection({ productId, description, specifications, reviews, onReviewAdded }) {
  const [activeTab, setActiveTab] = useState('Details');

  return (
    <div className="mt-12 bg-white border border-border-base rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs">
      {/* Tab Bar */}
      <div className="flex gap-6 border-b border-border-base">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative pb-3 text-sm font-bold transition-colors cursor-pointer ${
              activeTab === tab
                ? 'text-primary'
                : 'text-text-muted hover:text-text-base'
            }`}
          >
            {tab}
            {/* Active underline */}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'Details'  && <DescriptionTab  description={description} specifications={specifications} />}
        {activeTab === 'Reviews'  && <ReviewsTab  productId={productId} reviews={reviews} onSubmitted={onReviewAdded} />}
      </div>
    </div>
  );
}
