import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ReviewItem from './ReviewCard';
import { productService } from '../../../../services/product/productService';
import useAuth from '../../../../hooks/auth/useAuth';
import { getFriendlyErrorMessage } from '../../../../utils/firebaseErrorHandler.js';
import Pagination from '../../../../components/Common/Pagination';

// ── Interactive Star Picker ───────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    const active = hovered || value;

    const LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="text-3xl transition-transform hover:scale-110 active:scale-95 leading-none"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                        <span className={star <= active ? 'text-amber-400' : 'text-gray-200'}>
                            ★
                        </span>
                    </button>
                ))}
                {active > 0 && (
                    <span className="ml-2 text-xs font-semibold text-amber-600">
                        {LABELS[active]}
                    </span>
                )}
            </div>
            {value === 0 && (
                <p className="text-[11px] text-gray-400">Click a star to rate</p>
            )}
        </div>
    );
}

// ── Write-a-Review Form ───────────────────────────────────────────────────────
function WriteReviewForm({ productId, onSubmitted }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isLoggedIn = !!user?.user?.uid;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoggedIn) {
            toast.error('Please log in to leave a review.');
            return;
        }
        if (rating === 0) {
            toast.error('Please select a star rating.');
            return;
        }
        if (text.trim().length < 5) {
            toast.error('Review must be at least 5 characters long.');
            return;
        }

        setSubmitting(true);
        try {
            const newReview = await productService.submitRating({
                productId,
                userId: user.user.uid,
                userName: user.user.displayName || user.user.email?.split('@')[0] || 'Anonymous',
                rating,
                review: text,
            });
            toast.success('Your review has been submitted!');
            setRating(0);
            setText('');
            // Optimistically surface the new review immediately
            onSubmitted(newReview);
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, 'Failed to submit review. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="border border-gray-200 rounded-2xl p-5 bg-white space-y-4"
        >
            <h4 className="text-sm font-bold text-gray-900">Write a Review</h4>

            {/* Star picker */}
            <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Your Rating</p>
                <StarPicker value={rating} onChange={setRating} />
            </div>

            {/* Text area */}
            <div>
                <p className="text-xs text-gray-500 mb-1.5 font-medium">Your Review</p>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Share your experience — what did you like, what could be better?"
                    disabled={submitting}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-800 resize-none placeholder:text-gray-300 transition-all disabled:opacity-50"
                />
                <p className="text-right text-[10px] text-gray-300 mt-1">{text.length}/1000</p>
            </div>

            {/* Submit */}
            {isLoggedIn ? (
                <button
                    type="submit"
                    disabled={submitting || rating === 0}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-compli text-xs font-bold shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
            ) : (
                <p className="text-xs text-gray-400 italic">
                    <a href="/login" className="text-primary font-semibold hover:underline">Log in</a> to leave a review.
                </p>
            )}
        </form>
    );
}

// ── Reviews Tab ───────────────────────────────────────────────────────────────
function ReviewsTab({ productId, reviews = [] }) {
    const [sortBy, setSortBy] = useState('Newest');
    const [localReviews, setLocalReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const SORT_OPTIONS = ['Newest', 'Oldest', 'Highest', 'Lowest'];

    // Combine prop reviews + any optimistically added ones
    const allReviews = [...(reviews || []), ...localReviews];

    // Normalize
    const list = allReviews.map(r => ({
        userName: r.userName || r.name || 'Anonymous',
        rating: Number(r.rating !== undefined ? r.rating : (r.stars !== undefined ? r.stars : 5)),
        review: r.review || r.comment || '',
        createdAt: r.createdAt || null
    }));

    // Sort
    const sorted = [...list].sort((a, b) => {
        if (sortBy === 'Newest') {
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        }
        if (sortBy === 'Oldest') {
            return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        }
        if (sortBy === 'Highest') return b.rating - a.rating;
        if (sortBy === 'Lowest') return a.rating - b.rating;
        return 0;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [sortBy, reviews.length, localReviews.length]);

    // Aggregate stats
    const totalReviews = list.length;
    const avgStars = list.reduce((s, r) => s + r.rating, 0) / totalReviews || 0;
    const distMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    list.forEach((r) => {
        if (distMap[r.rating] !== undefined) distMap[r.rating]++;
    });

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedReviews = sorted.slice(startIndex, startIndex + pageSize);

    const handleNewReview = (review) => {
        setLocalReviews(prev => [review, ...prev]);
    };

    return (
        <div className="py-6 space-y-8">

            {/* Write a Review */}
            <WriteReviewForm productId={productId} onSubmitted={handleNewReview} />

            {/* Header Row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Customer Reviews</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Showing {sorted.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, sorted.length)} of {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                    </p>
                </div>
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Sort by:</span>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-base text-gray-400 pointer-events-none">
                            expand_more
                        </span>
                    </div>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Review list & Pagination */}
                <div className="md:col-span-2 space-y-4">
                    {paginatedReviews.length === 0 ? (
                        <div className="py-10 px-6 text-center border border-dashed border-border-base rounded-2xl bg-bg-surface/50">
                            <span className="material-symbols-outlined text-3xl text-text-muted/40 mb-1.5 block">
                                rate_review
                            </span>
                            <p className="text-sm font-bold text-text-base">No reviews yet</p>
                            <p className="text-xs text-text-muted mt-1">Be the first to review this product!</p>
                        </div>
                    ) : (
                        paginatedReviews.map((review, index) => (
                            <ReviewItem key={startIndex + index} review={review} index={startIndex + index} />
                        ))
                    )}

                    {/* Pagination */}
                    {sorted.length > 0 && (
                        <div className="pt-4 border-t border-gray-100">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={sorted.length}
                                pageSize={pageSize}
                                pageSizeOptions={[5, 10, 20]}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Right: Aggregate score card */}
                <div className="md:col-span-1">
                    <div className="border border-gray-200 rounded-2xl p-6 sticky top-32 bg-white">
                        {/* Big Score */}
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-5xl font-bold text-gray-900">{avgStars.toFixed(1)}</span>
                            <span className="text-gray-400 text-sm font-medium">out of 5</span>
                        </div>

                        {/* Star row */}
                        <div className="flex gap-0.5 mb-1">
                            {Array(5).fill(null).map((_, i) => (
                                <span key={i} className={`text-2xl ${i < Math.round(avgStars) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mb-5">({totalReviews} Reviews)</p>

                        {/* Star distribution */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const pct = totalReviews > 0 ? Math.round((distMap[star] / totalReviews) * 100) : 0;
                                return (
                                    <div key={star} className="flex items-center gap-2 text-xs">
                                        <span className="w-3 text-gray-500 font-medium">{star}</span>
                                        <span className="text-amber-400 text-xs">★</span>
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="w-7 text-right text-gray-400">{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReviewsTab;