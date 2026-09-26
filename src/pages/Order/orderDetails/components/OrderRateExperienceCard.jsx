import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaStar, FaRegStar, FaPaperPlane } from "react-icons/fa";
import { productService } from "../../../../services/product/productService";
import useAuth from "../../../../hooks/auth/useAuth";

/**
 * OrderRateExperienceCard Component
 * Interactive product rating and review section.
 * Supports rating multiple items in an order via item switcher tabs.
 */
export default function OrderRateExperienceCard({ items = [], orderId, onReviewSubmitted }) {
  const { user } = useAuth();
  const userId = user?.user?.uid || user?.uid || "";
  const userName = user?.user?.displayName || user?.displayName || user?.user?.email?.split("@")[0] || "Customer";

  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentItem = items[selectedIndex] || items[0] || {};
  const productId = currentItem?.productId || currentItem?.id || "";
  const productTitle = currentItem?.productName || currentItem?.title || currentItem?.name || "Product";

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [showReviewInput, setShowReviewInput] = useState(false);

  // Check if this user already rated the currently selected item
  useEffect(() => {
    let isMounted = true;
    setRating(0);
    setReviewText("");
    setExistingRating(null);
    setShowReviewInput(false);

    if (productId && userId) {
      productService.getUserProductRating(productId, userId)
        .then((res) => {
          if (isMounted && res) {
            setExistingRating(res);
            setRating(Number(res.rating || 0));
            setReviewText(res.review || "");
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [productId, userId]);

  const activeRating = hovered || rating;

  const handleStarClick = (val) => {
    if (!userId) {
      toast.error("Please log in to submit your rating.");
      return;
    }
    setRating(val);
    setShowReviewInput(true);
  };

  const handleSubmitRating = async (e) => {
    if (e) e.preventDefault();
    if (!productId) return;
    if (!userId) {
      toast.error("Please log in to submit your rating.");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    try {
      const savedReview = await productService.submitRating({
        productId,
        userId,
        userName,
        rating: Number(rating),
        review: reviewText.trim() || `Verified purchase rating (${rating} / 5 stars)`,
      });

      setExistingRating(savedReview);
      setShowReviewInput(false);
      toast.success(`Thank you! Your ${rating}-star rating for "${productTitle}" has been recorded.`);
      if (onReviewSubmitted) onReviewSubmitted(savedReview);
    } catch (err) {
      console.error("Failed to submit rating:", err);
      toast.error("Could not record rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!productId && items.length === 0) return null;

  return (
    <div className="bg-bg-surface border border-border-base/70 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm sm:text-base font-bold text-text-base">
          Rate your experience
        </h3>
      </div>

      {/* Multi-item switcher tabs (if order contains more than 1 item) */}
      {items.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {items.map((it, idx) => {
            const itTitle = it?.productName || it?.title || it?.name || `Item ${idx + 1}`;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedIndex === idx
                    ? "bg-primary text-white shadow-xs"
                    : "bg-bg-base hover:bg-border-base/60 text-text-muted border border-border-base/40"
                }`}
              >
                {itTitle.length > 20 ? `${itTitle.slice(0, 20)}...` : itTitle}
              </button>
            );
          })}
        </div>
      )}

      <div className="bg-bg-base/30 border border-border-base/50 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs font-bold text-text-base">
            {productTitle ? `How was ${productTitle}?` : "Rate this product"}
          </p>

          {/* Interactive Star Row */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={submitting}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="text-2xl sm:text-3xl text-amber-400 hover:scale-125 transition-transform duration-150 p-1 cursor-pointer disabled:opacity-50"
                title={`Rate ${star} Star${star > 1 ? "s" : ""}`}
              >
                {star <= activeRating ? (
                  <FaStar className="text-amber-400 fill-current" />
                ) : (
                  <FaRegStar className="text-gray-300 dark:text-gray-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Review Text Input */}
        {showReviewInput && (
          <form onSubmit={handleSubmitRating} className="pt-2 space-y-2.5 animate-fadeIn">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write a brief review about product quality, fit, or delivery (optional)..."
              rows={2}
              className="w-full p-2.5 text-xs rounded-xl border border-border-base bg-bg-surface text-text-base focus:border-primary focus:outline-hidden"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewInput(false)}
                className="px-3 py-1.5 text-xs font-bold text-text-muted hover:text-text-base cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-primary text-white hover:bg-primary-hover rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <FaPaperPlane size={10} />
                <span>{submitting ? "Submitting..." : "Submit Rating"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
