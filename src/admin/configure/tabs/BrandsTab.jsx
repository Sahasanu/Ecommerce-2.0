import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaUndo,
  FaSave,
  FaExternalLinkAlt,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaUpload,
  FaTimes,
  FaStore,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { brandService } from "../../../services/brands/brandService";
import { DEFAULT_BRANDS } from "../../../services/brands/defaultBrands";
import { uploadService } from "../../../services/upload/uploadService";
import { useSiteConfig } from "../../../context/SiteConfigContext";
import useAuth from "../../../hooks/auth/useAuth";

export default function BrandsTab({ draft, updateDraft, onSave, isDirty, saving: parentSaving, savedData }) {
  const { config, setConfig } = useSiteConfig();
  const { user } = useAuth();

  // Local state for brands and section settings
  const [brands, setBrands] = useState([]);
  const [sectionConfig, setSectionConfig] = useState({
    title: "Brand Partner and Dealer",
    subtitle: "",
    enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [internalSaving, setInternalSaving] = useState(false);
  const saving = parentSaving !== undefined ? parentSaving : internalSaving;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null); // null = Add, object = Edit
  const [brandForm, setBrandForm] = useState({
    name: "",
    logo: "",
    website: "",
    isActive: true,
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize from draft/context or fetch from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      try {
        if (Array.isArray(draft?.brands) && draft.brands.length > 0) {
          if (isMounted) {
            setBrands(draft.brands);
            setSectionConfig(draft.brandsSection || { title: "Brand Partner and Dealer", subtitle: "", enabled: true });
          }
        } else {
          const data = await brandService.getBrandsData();
          if (isMounted) {
            setBrands(data.brands);
            setSectionConfig(data.sectionConfig);
          }
        }
      } catch (err) {
        console.error("Error loading brands:", err);
        if (isMounted) setBrands(DEFAULT_BRANDS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initData();
    return () => {
      isMounted = false;
    };
  }, []); // Run on initial mount only

  // Sync if savedData reverts/resets from parent (e.g. Discard / Cancel)
  useEffect(() => {
    if (savedData?.brands) {
      setBrands(savedData.brands);
    }
    if (savedData?.brandsSection) {
      setSectionConfig(savedData.brandsSection);
    }
  }, [savedData]);

  // Sync back to parent draft
  const syncWithDraft = (newBrands, newSection) => {
    setBrands(newBrands);
    setSectionConfig(newSection);
    if (updateDraft) {
      updateDraft({
        brands: newBrands,
        brandsSection: newSection,
      });
    }
  };

  // Save changes explicitly to Firestore
  const handleSaveAll = async () => {
    if (onSave) {
      await onSave();
      return;
    }
    setInternalSaving(true);
    try {
      await brandService.saveBrandsData(brands, sectionConfig, user?.uid || "");
      if (setConfig) {
        setConfig((prev) => ({
          ...prev,
          brands,
          brandsSection: sectionConfig,
        }));
      }
      toast.success("Brands & Dealers saved successfully!");
    } catch (err) {
      console.error("Failed to save brands:", err);
      toast.error(err?.message || "Failed to save brands");
    } finally {
      setInternalSaving(false);
    }
  };

  // Reset to default 20 brand partners
  const handleResetDefaults = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset to the default 20 showroom brand partners? Custom brands will be replaced."
      )
    ) {
      try {
        setSaving(true);
        await brandService.resetToDefaults(sectionConfig, user?.uid || "");
        syncWithDraft(DEFAULT_BRANDS, sectionConfig);
        if (setConfig) {
          setConfig((prev) => ({
            ...prev,
            brands: DEFAULT_BRANDS,
          }));
        }
        toast.info("Reset to 20 default brand partners!");
      } catch (err) {
        toast.error("Failed to reset defaults");
      } finally {
        setSaving(false);
      }
    }
  };

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingBrand(null);
    setBrandForm({
      name: `Brand Partner ${brands.length + 1}`,
      logo: "",
      website: "",
      isActive: true,
    });
    setUploadProgress(0);
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name || "",
      logo: brand.logo || brand.img || "",
      website: brand.website || "",
      isActive: brand.isActive !== false,
    });
    setUploadProgress(0);
    setModalOpen(true);
  };

  // Handle Logo file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setUploadProgress(0);
    try {
      const url = await uploadService.uploadCompanyAsset(file, setUploadProgress);
      setBrandForm((prev) => ({ ...prev, logo: url }));
      toast.success("Brand logo uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save Modal Form (Add or Edit)
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!brandForm.name.trim()) {
      toast.warning("Please provide a brand name");
      return;
    }
    if (!brandForm.logo.trim()) {
      toast.warning("Please upload a brand logo or provide an image URL");
      return;
    }

    let updatedBrands;
    if (editingBrand) {
      // Update
      updatedBrands = brands.map((b) =>
        b.id === editingBrand.id
          ? {
              ...b,
              name: brandForm.name.trim(),
              logo: brandForm.logo.trim(),
              website: brandForm.website.trim(),
              isActive: brandForm.isActive,
              updatedAt: Date.now(),
            }
          : b
      );
      toast.success(`Updated ${brandForm.name}`);
    } else {
      // Add
      const newBrand = {
        id: `brand_${Date.now()}`,
        name: brandForm.name.trim(),
        logo: brandForm.logo.trim(),
        website: brandForm.website.trim(),
        isActive: brandForm.isActive,
        order: brands.length + 1,
        createdAt: Date.now(),
      };
      updatedBrands = [newBrand, ...brands];
      toast.success(`Added ${newBrand.name}`);
    }

    syncWithDraft(updatedBrands, sectionConfig);
    setModalOpen(false);

    // Auto-save to Firestore in background
    try {
      await brandService.saveBrandsData(updatedBrands, sectionConfig, user?.uid || "");
      if (setConfig) {
        setConfig((prev) => ({ ...prev, brands: updatedBrands }));
      }
    } catch (err) {
      console.error("Auto-sync error:", err);
    }
  };

  // Delete a brand
  const handleDeleteBrand = async (brandId, brandName) => {
    if (window.confirm(`Delete "${brandName}" from brands & dealers?`)) {
      const updated = brands.filter((b) => b.id !== brandId);
      syncWithDraft(updated, sectionConfig);
      toast.info(`Deleted ${brandName}`);
      try {
        await brandService.saveBrandsData(updated, sectionConfig, user?.uid || "");
        if (setConfig) {
          setConfig((prev) => ({ ...prev, brands: updated }));
        }
      } catch (err) {
        console.error("Failed to persist delete:", err);
      }
    }
  };

  // Toggle single brand visibility
  const handleToggleStatus = async (brandId) => {
    const updated = brands.map((b) =>
      b.id === brandId ? { ...b, isActive: !b.isActive } : b
    );
    syncWithDraft(updated, sectionConfig);
    try {
      await brandService.saveBrandsData(updated, sectionConfig, user?.uid || "");
      if (setConfig) {
        setConfig((prev) => ({ ...prev, brands: updated }));
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Filtered list
  const filteredBrands = brands.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? b.isActive !== false
        : b.isActive === false;
    return matchesSearch && matchesStatus;
  });

  const activeCount = brands.filter((b) => b.isActive !== false).length;
  const inactiveCount = brands.length - activeCount;

  if (loading) {
    return (
      <div className="py-12 text-center text-text-muted text-xs font-bold flex items-center justify-center gap-2">
        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading Brands & Dealers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">verified</span>
            <h2 className="text-lg sm:text-xl font-black text-text-base tracking-wide">
              Brand Partners & Authorized Dealers
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                sectionConfig.enabled !== false
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {sectionConfig.enabled !== false ? "Active on Home" : "Section Hidden"}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Manage partner logos scrolling horizontally in the marquee section on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-subtle hover:bg-card-hover text-text-muted hover:text-text-base text-xs font-bold transition cursor-pointer"
            title="Restore original 20 showroom brand partners"
          >
            <FaUndo size={11} />
            <span>Reset 20 Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-primary/50 text-text-base text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <FaPlus size={11} className="text-primary" />
            <span>Add Brand</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-compli font-bold text-xs shadow-md shadow-primary/20 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-compli border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave size={13} />
                <span>Save All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section Global Settings (Title, Subtitle, Visibility) */}
      <div className="bg-bg-surface p-4 sm:p-5 rounded-2xl border border-border-subtle space-y-4">
        <h3 className="text-xs font-bold text-text-base uppercase tracking-wider flex items-center gap-1.5">
          <FaStore className="text-primary" /> Marquee Section Headlines & Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1 md:col-span-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Section Title</label>
            <input
              type="text"
              value={sectionConfig.title}
              onChange={(e) => {
                const updated = { ...sectionConfig, title: e.target.value };
                syncWithDraft(brands, updated);
              }}
              placeholder="e.g. Brand Partner and Dealer"
              className="w-full h-10 px-3 rounded-xl border border-border-subtle bg-bg-base text-text-base text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1 md:col-span-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Subtitle (Optional)</label>
            <input
              type="text"
              value={sectionConfig.subtitle || ""}
              onChange={(e) => {
                const updated = { ...sectionConfig, subtitle: e.target.value };
                syncWithDraft(brands, updated);
              }}
              placeholder="e.g. Authorized distributors for premium ceramic & vitrified brands"
              className="w-full h-10 px-3 rounded-xl border border-border-subtle bg-bg-base text-text-base text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-bg-base border border-border-subtle md:col-span-1">
            <div>
              <span className="text-xs font-bold text-text-base block">Section Visibility</span>
              <span className="text-[10px] text-text-muted">Display marquee on homepage</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sectionConfig.enabled !== false}
                onChange={(e) => {
                  const updated = { ...sectionConfig, enabled: e.target.checked };
                  syncWithDraft(brands, updated);
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-border-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Live Marquee Preview Box */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-bg-base border-b border-border-subtle flex items-center justify-between">
          <span className="text-xs font-bold text-text-base flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live Marquee Preview ({activeCount} Active)
          </span>
          <span className="text-[10px] text-text-muted italic">Hover to pause preview scroll</span>
        </div>

        <div className="p-4 sm:p-6 overflow-hidden bg-black/40">
          <div className="relative w-full overflow-hidden group">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-bg-base via-bg-base/60 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-bg-base via-bg-base/60 to-transparent z-10" />

            <div className="flex w-max animate-brand-marquee group-hover:[animation-play-state:paused] py-1 gap-3 select-none">
              {(brands.filter((b) => b.isActive !== false).length > 0
                ? [
                    ...brands.filter((b) => b.isActive !== false),
                    ...brands.filter((b) => b.isActive !== false),
                  ]
                : []
              ).map((brand, idx) => (
                <div
                  key={`preview-${brand.id}-${idx}`}
                  className="w-[120px] h-[64px] rounded-xl bg-card border border-border-subtle flex items-center justify-center p-2.5 shrink-0 shadow-2xs"
                >
                  <img
                    src={brand.logo || brand.img}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain filter contrast-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats & Search Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* KPI Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              statusFilter === "all"
                ? "bg-primary text-compli border-primary shadow-xs"
                : "bg-card border-border-subtle text-text-muted hover:text-text-base"
            }`}
          >
            All Brands ({brands.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              statusFilter === "active"
                ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                : "bg-card border-border-subtle text-text-muted hover:text-text-base"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              statusFilter === "inactive"
                ? "bg-red-500 text-white border-red-500 shadow-xs"
                : "bg-card border-border-subtle text-text-muted hover:text-text-base"
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand name..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {filteredBrands.map((brand) => {
          const isActive = brand.isActive !== false;
          return (
            <div
              key={brand.id}
              className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-card ${
                isActive
                  ? "border-border-subtle hover:border-primary/40 shadow-xs"
                  : "border-border-subtle/40 opacity-60 bg-bg-base"
              }`}
            >
              {/* Logo Area */}
              <div className="h-24 sm:h-28 flex items-center justify-center p-3.5 bg-bg-surface/50 border-b border-border-subtle/50 relative">
                <img
                  src={brand.logo || brand.img}
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain filter contrast-105 group-hover:scale-105 transition-transform"
                />

                {/* Status Indicator */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(brand.id)}
                  className={`absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs transition cursor-pointer shadow-xs ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  }`}
                  title={isActive ? "Visible in marquee (click to hide)" : "Hidden (click to show)"}
                >
                  {isActive ? <FaEye size={11} /> : <FaEyeSlash size={11} />}
                </button>
              </div>

              {/* Info & Action Controls */}
              <div className="p-2.5 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-text-base truncate" title={brand.name}>
                    {brand.name}
                  </p>
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-primary transition shrink-0"
                      title={brand.website}
                    >
                      <FaExternalLinkAlt size={10} />
                    </a>
                  )}
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-border-subtle/40">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(brand)}
                    className="flex-1 h-7 rounded-lg bg-card-hover hover:bg-primary/20 text-text-muted hover:text-primary text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer border border-border-subtle"
                  >
                    <FaEdit size={10} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBrand(brand.id, brand.name)}
                    className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs flex items-center justify-center transition cursor-pointer border border-rose-500/20"
                    title="Delete Brand"
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Brand Card Button */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="h-full min-h-[140px] rounded-2xl border-2 border-dashed border-border-subtle hover:border-primary/50 bg-bg-surface/30 hover:bg-bg-surface/60 transition flex flex-col items-center justify-center p-4 gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center text-primary transition">
            <FaPlus size={14} />
          </div>
          <span className="text-xs font-bold text-text-muted group-hover:text-text-base transition">
            Add Brand Partner
          </span>
        </button>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-card border border-border-subtle rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-5 p-6 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-sm font-extrabold text-text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  {editingBrand ? "edit_note" : "add_business"}
                </span>
                <span>{editingBrand ? "Edit Brand Partner" : "Add New Brand Partner"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-bg-base hover:bg-card-hover text-text-muted hover:text-text-base flex items-center justify-center transition cursor-pointer"
              >
                <FaTimes size={12} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Brand Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                  Brand / Dealer Name *
                </label>
                <input
                  type="text"
                  required
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  placeholder="e.g. Kajaria Ceramics"
                  className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Brand Logo Upload & URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                  Brand Logo Image *
                </label>

                {/* Logo Preview */}
                <div className="relative h-28 rounded-xl border border-border-subtle bg-bg-base flex items-center justify-center overflow-hidden p-3">
                  {brandForm.logo ? (
                    <img
                      src={brandForm.logo}
                      alt="Brand preview"
                      className="max-h-full max-w-full object-contain filter contrast-105"
                    />
                  ) : (
                    <span className="text-xs text-text-muted">No logo selected</span>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadingLogo && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-text-muted font-semibold">
                      <span>Uploading logo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-base overflow-hidden border border-border-subtle">
                      <div
                        className="h-full bg-primary transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Action & URL Input */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 h-10 rounded-xl bg-card border border-border-subtle hover:bg-card-hover text-text-base text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition">
                    <FaUpload size={11} className="text-primary" />
                    <span>Upload Logo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingLogo}
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted font-bold pl-0.5">Or direct image URL:</span>
                  <input
                    type="text"
                    value={brandForm.logo}
                    onChange={(e) => setBrandForm({ ...brandForm, logo: e.target.value })}
                    placeholder="https://... logo URL"
                    className="w-full h-10 px-3 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Website URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                  Partner Website URL (Optional)
                </label>
                <input
                  type="text"
                  value={brandForm.website}
                  onChange={(e) => setBrandForm({ ...brandForm, website: e.target.value })}
                  placeholder="https://brandpartner.com"
                  className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-base border border-border-subtle">
                <span className="text-xs font-bold text-text-base">Active in Marquee</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brandForm.isActive}
                    onChange={(e) => setBrandForm({ ...brandForm, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-border-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border-subtle bg-card hover:bg-card-hover text-text-muted hover:text-text-base text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingLogo}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-compli font-bold text-xs shadow-md shadow-primary/20 transition cursor-pointer disabled:opacity-50"
                >
                  {editingBrand ? "Save Brand" : "Add Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
