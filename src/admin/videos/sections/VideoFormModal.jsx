import React, { useState, useEffect } from 'react';
import { FaTimes, FaYoutube, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import { extractYouTubeId, getYouTubeThumbnail } from '../../../services/video/videoService';

const PREDEFINED_CATEGORIES = [
  'Buying Guide',
  'Tile Design',
  'Bathroom Ideas',
  'Living Room',
  'Kitchen Backsplash',
  'Installation Tips',
  'Maintenance & Care',
  'Showroom Tour',
];

export default function VideoFormModal({ isOpen, onClose, onSave, videoToEdit = null, saving = false }) {
  const [formData, setFormData] = useState({
    youtubeUrl: '',
    title: '',
    category: 'Buying Guide',
    customCategory: '',
    description: '',
    thumbnail: '',
    isFeatured: true,
    status: 'Published',
    displayOrder: 1,
  });

  const [youtubeId, setYoutubeId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (videoToEdit) {
      const isCustom = !PREDEFINED_CATEGORIES.includes(videoToEdit.category);
      setFormData({
        youtubeUrl: videoToEdit.youtubeUrl || '',
        title: videoToEdit.title || '',
        category: isCustom ? 'Other' : (videoToEdit.category || 'Buying Guide'),
        customCategory: isCustom ? videoToEdit.category : '',
        description: videoToEdit.description || '',
        thumbnail: videoToEdit.thumbnail || '',
        isFeatured: videoToEdit.isFeatured ?? true,
        status: videoToEdit.status || 'Published',
        displayOrder: videoToEdit.displayOrder || 1,
      });
      const id = extractYouTubeId(videoToEdit.youtubeUrl || '');
      setYoutubeId(id);
    } else {
      setFormData({
        youtubeUrl: '',
        title: '',
        category: 'Buying Guide',
        customCategory: '',
        description: '',
        thumbnail: '',
        isFeatured: true,
        status: 'Published',
        displayOrder: 1,
      });
      setYoutubeId('');
    }
    setErrors({});
  }, [videoToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle URL change & auto-extract video ID
  const handleUrlChange = (url) => {
    const id = extractYouTubeId(url);
    setYoutubeId(id);

    setFormData((prev) => {
      // If user hasn't set a custom thumbnail yet or it was auto-generated, auto-refresh thumbnail
      const autoThumb = id ? getYouTubeThumbnail(id, 'hqdefault') : prev.thumbnail;
      return {
        ...prev,
        youtubeUrl: url,
        thumbnail: autoThumb,
      };
    });

    if (errors.youtubeUrl) {
      setErrors((prev) => ({ ...prev, youtubeUrl: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.youtubeUrl.trim()) {
      newErrors.youtubeUrl = 'YouTube URL is required.';
    } else if (!extractYouTubeId(formData.youtubeUrl)) {
      newErrors.youtubeUrl = 'Invalid YouTube URL. Please check the link.';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    }

    if (formData.category === 'Other' && !formData.customCategory.trim()) {
      newErrors.category = 'Please enter a custom category name.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalCategory =
      formData.category === 'Other' ? formData.customCategory.trim() : formData.category;

    const payload = {
      ...formData,
      category: finalCategory,
      displayOrder: Number(formData.displayOrder) || 1,
    };

    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-card border border-border-subtle rounded-2xl md:rounded-3xl shadow-2xl p-5 sm:p-7 space-y-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <FaYoutube className="text-base" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-base">
                {videoToEdit ? 'Edit Video Guide' : 'Add New Video'}
              </h2>
              <p className="text-xs text-text-muted">
                {videoToEdit
                  ? 'Update YouTube video details, category, and display settings'
                  : 'Add YouTube tile guides, tutorials, and customer inspiration'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-base hover:bg-card-hover transition-colors cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* YouTube URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-base flex items-center justify-between">
              <span>YouTube URL *</span>
              {youtubeId && (
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <FaCheck className="text-[9px]" /> Video ID: {youtubeId}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=xxxxx or https://youtu.be/xxxxx"
                value={formData.youtubeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-bg-base border rounded-xl text-text-base placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.youtubeUrl ? 'border-rose-500' : 'border-border-subtle'
                }`}
              />
            </div>
            {errors.youtubeUrl && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <FaExclamationCircle className="text-[10px]" /> {errors.youtubeUrl}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-base">Title *</label>
            <input
              type="text"
              placeholder="e.g. How to Choose the Right Floor Tiles"
              value={formData.title}
              onChange={(e) => {
                setFormData((p) => ({ ...p, title: e.target.value }));
                if (errors.title) setErrors((p) => ({ ...p, title: null }));
              }}
              className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-bg-base border rounded-xl text-text-base placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.title ? 'border-rose-500' : 'border-border-subtle'
              }`}
            />
            {errors.title && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <FaExclamationCircle className="text-[10px]" /> {errors.title}
              </p>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-base">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-bg-base border border-border-subtle rounded-xl text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {PREDEFINED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">+ Custom Category...</option>
              </select>
            </div>

            {formData.category === 'Other' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-base">Custom Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Balcony Tiling"
                  value={formData.customCategory}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, customCategory: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-bg-base border border-border-subtle rounded-xl text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {/* Display Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-base">Display Order</label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, displayOrder: e.target.value }))
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-bg-base border border-border-subtle rounded-xl text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-base">Description</label>
            <textarea
              rows={3}
              placeholder="Brief summary or bullet points about what this video covers..."
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-bg-base border border-border-subtle rounded-xl text-text-base placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Thumbnail URL and Preview */}
          <div className="space-y-2 pt-1 border-t border-border-subtle">
            <label className="text-xs font-bold text-text-base block">Thumbnail URL</label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="https://example.com/thumbnail.jpg"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData((p) => ({ ...p, thumbnail: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs bg-bg-base border border-border-subtle rounded-xl text-text-base placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Thumbnail Live Preview */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black/80 border border-border-subtle shadow-xs flex items-center justify-center text-text-muted text-[11px]">
                {formData.thumbnail ? (
                  <img
                    src={formData.thumbnail}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>No Thumbnail</span>
                )}
              </div>
            </div>
          </div>

          {/* Status & Featured Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-subtle items-center">
            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-base">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-bg-base border border-border-subtle rounded-xl text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            {/* Featured Checkbox */}
            <div className="pt-4 sm:pt-6">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, isFeatured: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-xs font-bold text-text-base">
                  Featured on Home Page
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-base hover:bg-card-hover rounded-xl border border-border-subtle transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold bg-primary text-compli hover:bg-primary-hover rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <span className="animate-spin text-xs">⏳</span>}
              <span>{videoToEdit ? 'Save Changes' : 'Save Video'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
