import React from "react";

/**
 * Section 2: Basic Information
 */
export function ProductBasicInfo({ products, setProducts, handleTagsChange }) {
    return (
        <div className="bg-bg-surface border border-border-base rounded-2xl shadow-xs overflow-hidden text-xs">
            {/* Section 2 Header */}
            <div className="px-5 py-3.5 border-b border-border-base flex items-center justify-between bg-bg-base/30">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                        2
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-text-base flex items-center gap-2">
                            Basic Information
                        </h2>
                        <p className="text-[10px] text-text-muted mt-0.5">
                            Define the product brand, title, category, and search keywords.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Brand */}
                    <div>
                        <label className="block font-bold text-text-base mb-1.5">
                            Brand Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={products.brand || ""}
                            onChange={(e) =>
                                setProducts({
                                    ...products,
                                    brand: e.target.value
                                })
                            }
                            placeholder="e.g. Apple, Nike, Samsung"
                            className="w-full rounded-xl border border-border-base bg-bg-base px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
                        />
                    </div>

                    {/* Category Select Dropdown with Add New Option */}
                    <div>
                        <label className="block font-bold text-text-base mb-1.5">
                            Category <span className="text-red-500">*</span>
                        </label>
                        {(() => {
                            const DEFAULT_CATS = ["Accessories", "Grocery", "Electronics", "Fashion", "Footwear", "Beauty & Personal Care", "Home & Kitchen", "Books & Stationery", "Sports & Fitness", "Toys & Games"];
                            const isCustomCat = products.category && !DEFAULT_CATS.includes(products.category);
                            const isCustom = Boolean(products.isAddingCustomCategory || isCustomCat);

                            return (
                                <div className="space-y-2">
                                    <select
                                        value={isCustom ? "__NEW__" : (products.category || "")}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "__NEW__") {
                                                setProducts({ ...products, category: "", isAddingCustomCategory: true });
                                            } else {
                                                setProducts({ ...products, category: val, isAddingCustomCategory: false });
                                            }
                                        }}
                                        className="w-full rounded-xl border border-border-base bg-bg-base px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold cursor-pointer"
                                    >
                                        <option value="">Select Category...</option>
                                        <option value="__NEW__" className="font-bold text-primary">+ Add Custom Category</option>
                                        {DEFAULT_CATS.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>

                                    {isCustom && (
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="text"
                                                value={products.category || ""}
                                                onChange={(e) => setProducts({ ...products, category: e.target.value })}
                                                placeholder="Type new category name..."
                                                className="flex-1 rounded-xl border border-primary/40 bg-bg-surface px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setProducts({ ...products, category: "", isAddingCustomCategory: false })}
                                                className="px-2.5 py-2 rounded-xl border border-border-base bg-bg-base hover:bg-gray-100 text-text-muted hover:text-text-base text-xs font-bold transition cursor-pointer"
                                                title="Cancel custom category"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Product Title */}
                    <div className="md:col-span-2">
                        <label className="block font-bold text-text-base mb-1.5">
                            Product Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={products.title || ""}
                            onChange={(e) =>
                                setProducts({
                                    ...products,
                                    title: e.target.value
                                })
                            }
                            placeholder="e.g. Premium Noise Cancelling Headphones"
                            className="w-full rounded-xl border border-border-base bg-bg-base px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-extrabold text-sm"
                        />
                    </div>

                    {/* Tags / Search Keywords */}
                    <div className="md:col-span-2">
                        <label className="block font-bold text-text-base mb-1.5">
                            Search Tags & Keywords <span className="text-text-muted text-[10px] font-normal">(Comma separated)</span>
                        </label>
                        <input
                            type="text"
                            value={typeof products.tags === 'string' ? products.tags : (Array.isArray(products.tags) ? products.tags.join(", ") : "")}
                            onChange={handleTagsChange}
                            placeholder="e.g. wireless, bluetooth, gaming, bass"
                            className="w-full rounded-xl border border-border-base bg-bg-base px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                        />
                        {(() => {
                            const badges = typeof products.tags === 'string'
                                ? products.tags.split(',').map(t => t.trim()).filter(Boolean)
                                : (Array.isArray(products.tags) ? products.tags : []);
                            if (badges.length === 0) return null;
                            return (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {badges.map((tag, idx) => (
                                        <span key={idx} className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductBasicInfo;
