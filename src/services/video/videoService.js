import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";

// Dedicated document for videos (guaranteed permissions under configure collection)
const VIDEOS_CONFIG_DOC = () => doc(fireDB, "configure", "videos");
// Secondary / fallback document (legacy)
const SITE_DOC = () => doc(fireDB, "configure", "site");

/**
 * Extracts a YouTube Video ID from any standard YouTube URL:
 * - https://www.youtube.com/watch?v=XXXXX
 * - https://youtu.be/XXXXX
 * - https://www.youtube.com/embed/XXXXX
 * - https://www.youtube.com/shorts/XXXXX
 */
export function extractYouTubeId(url = "") {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  const regExp =
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[1].length === 11 ? match[1] : "";
}

/**
 * Generates high quality YouTube thumbnail URL from Video ID
 */
export function getYouTubeThumbnail(videoId, quality = "hqdefault") {
  if (!videoId) return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Curated fallback/seed video guides for Bengal Tiles
 * Using real working tile, stone, and architectural design videos
 */
export const DEFAULT_TILE_VIDEOS = [
  {
    id: "seed_video_1",
    youtubeUrl: "https://www.youtube.com/watch?v=L_LUpnjgPso",
    youtubeId: "L_LUpnjgPso",
    title: "How to Choose the Right Floor Tiles for Your Home",
    category: "Buying Guide",
    description:
      "A complete guide to selecting the perfect vitrified, ceramic, and marble finish tiles for your living rooms and bedrooms.",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    status: "Published",
    displayOrder: 1,
    duration: "6:45",
  },
  {
    id: "seed_video_2",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    title: "Modern Living Room Tile Design Trends",
    category: "Tile Design",
    description:
      "Explore trending large-format Italian marble look tiles, contrasting grout lines, and minimalist luxury flooring designs.",
    thumbnail: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    status: "Published",
    displayOrder: 2,
    duration: "8:20",
  },
  {
    id: "seed_video_3",
    youtubeUrl: "https://www.youtube.com/watch?v=kYJqD9Pz2B0",
    youtubeId: "kYJqD9Pz2B0",
    title: "Luxury Bathroom Tile Concepts & Anti-Skid Layouts",
    category: "Bathroom Ideas",
    description:
      "Tips for anti-skid floor tiles, glossy feature walls, niche tiling, and seamless modern wet room inspirations.",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    status: "Published",
    displayOrder: 3,
    duration: "5:30",
  },
  {
    id: "seed_video_4",
    youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    youtubeId: "jNQXAC9IVRw",
    title: "Kitchen Backsplash & Wall Tile Inspiration",
    category: "Design Ideas",
    description:
      "Stunning herringbone, subway, and geometric tile layouts designed for durable and grease-resistant kitchen backsplashes.",
    thumbnail: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    isFeatured: true,
    status: "Published",
    displayOrder: 4,
    duration: "7:15",
  },
];

export const videoService = {
  /**
   * Persist full videos array to Firestore and local cache
   * Saves to dedicated configure/videos doc (isolated from configure/site settings)
   * and mirrors to configure/site doc for compatibility.
   */
  async _saveVideosList(videosList) {
    const sorted = [...videosList].sort(
      (a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999)
    );

    // 1. Immediately cache in localStorage
    try {
      localStorage.setItem("cached_site_videos", JSON.stringify(sorted));
      localStorage.setItem("cached_videos_initialized", "true");
    } catch (e) {}

    // 2. Save to dedicated configure/videos document
    try {
      await setDoc(
        VIDEOS_CONFIG_DOC(),
        {
          videos: sorted,
          initialized: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Could not save to configure/videos:", err);
    }

    // 3. Mirror to configure/site document for backward compatibility
    try {
      await setDoc(
        SITE_DOC(),
        {
          videos: sorted,
          videosInitialized: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Could not sync videos to configure/site:", err);
    }

    return sorted;
  },

  /**
   * Fetch all videos:
   * 1. Checks dedicated configure/videos doc (primary)
   * 2. Checks configure/site doc (fallback/migration)
   * 3. Checks localStorage cache
   * 4. Only if store has never been initialized, seeds DEFAULT_TILE_VIDEOS
   */
  async getVideos() {
    // 1. Primary: Dedicated configure/videos document
    try {
      const vSnap = await getDoc(VIDEOS_CONFIG_DOC());
      if (vSnap.exists()) {
        const data = vSnap.data();
        if (Array.isArray(data.videos)) {
          try {
            localStorage.setItem("cached_site_videos", JSON.stringify(data.videos));
            localStorage.setItem("cached_videos_initialized", "true");
          } catch (e) {}

          return [...data.videos].sort(
            (a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999)
          );
        }
      }
    } catch (err) {
      console.warn("Could not read from configure/videos:", err);
    }

    // 2. Fallback: configure/site document
    try {
      const siteSnap = await getDoc(SITE_DOC());
      if (siteSnap.exists()) {
        const data = siteSnap.data();
        if (Array.isArray(data.videos) && (data.videos.length > 0 || data.videosInitialized)) {
          // Self-heal: populate configure/videos doc so future reads are isolated
          try {
            setDoc(
              VIDEOS_CONFIG_DOC(),
              {
                videos: data.videos,
                initialized: true,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
          } catch (e) {}

          try {
            localStorage.setItem("cached_site_videos", JSON.stringify(data.videos));
            localStorage.setItem("cached_videos_initialized", "true");
          } catch (e) {}

          return [...data.videos].sort(
            (a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999)
          );
        }
      }
    } catch (err) {
      console.warn("Could not read videos from configure/site:", err);
    }

    // 3. Fallback: Local Cache
    try {
      const cached = localStorage.getItem("cached_site_videos");
      const isInitialized = localStorage.getItem("cached_videos_initialized") === "true";
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && (parsed.length > 0 || isInitialized)) {
          return parsed;
        }
      }
    } catch (e) {}

    // 4. First-time initialization only: Seed defaults and persist
    try {
      await this._saveVideosList(DEFAULT_TILE_VIDEOS);
    } catch (e) {
      console.warn("Could not auto-seed default videos:", e);
    }

    return DEFAULT_TILE_VIDEOS;
  },

  /**
   * Fetch only published videos for visitor views
   */
  async getPublishedVideos() {
    const all = await this.getVideos();
    return all.filter((v) => v.status === "Published" || !v.status);
  },

  /**
   * Fetch featured videos for home page section
   */
  async getFeaturedVideos() {
    const published = await this.getPublishedVideos();
    const featured = published.filter((v) => v.isFeatured);
    return featured.length > 0 ? featured : published.slice(0, 4);
  },

  /**
   * Get single video by ID
   */
  async getVideoById(videoId) {
    if (!videoId) return null;
    const all = await this.getVideos();
    return all.find((v) => v.id === videoId) || null;
  },

  /**
   * Add new video
   */
  async addVideo(data) {
    const rawUrl = (data.youtubeUrl || "").trim();
    const youtubeId = extractYouTubeId(rawUrl);
    const thumbnail =
      (data.thumbnail || "").trim() ||
      (youtubeId ? getYouTubeThumbnail(youtubeId, "hqdefault") : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80");

    const newVideo = {
      id: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      youtubeUrl: rawUrl,
      youtubeId: youtubeId,
      title: (data.title || "Untitled Video").trim(),
      category: (data.category || "General").trim(),
      description: (data.description || "").trim(),
      thumbnail: thumbnail,
      isFeatured: Boolean(data.isFeatured),
      status: data.status || "Published",
      displayOrder: Number(data.displayOrder) || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = await this.getVideos();
    const updated = [...current, newVideo];
    await this._saveVideosList(updated);

    return newVideo;
  },

  /**
   * Update video
   */
  async updateVideo(videoId, data) {
    if (!videoId) throw new Error("Video ID is required");
    const current = await this.getVideos();

    const rawUrl = (data.youtubeUrl || "").trim();
    const youtubeId = rawUrl ? extractYouTubeId(rawUrl) : undefined;
    const thumbnail =
      (data.thumbnail || "").trim() ||
      (youtubeId ? getYouTubeThumbnail(youtubeId, "hqdefault") : undefined);

    const updated = current.map((v) => {
      if (v.id === videoId) {
        return {
          ...v,
          youtubeUrl: rawUrl || v.youtubeUrl,
          youtubeId: youtubeId !== undefined ? (youtubeId || v.youtubeId) : v.youtubeId,
          title: data.title !== undefined ? data.title.trim() : v.title,
          category: data.category !== undefined ? data.category.trim() : v.category,
          description: data.description !== undefined ? data.description.trim() : v.description,
          thumbnail: thumbnail || v.thumbnail,
          isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : v.isFeatured,
          status: data.status || v.status || "Published",
          displayOrder: Number(data.displayOrder) || v.displayOrder || 1,
          updatedAt: new Date().toISOString(),
        };
      }
      return v;
    });

    await this._saveVideosList(updated);
    return updated.find((v) => v.id === videoId);
  },

  /**
   * Toggle published / draft status
   */
  async toggleStatus(videoId, currentStatus) {
    const newStatus = currentStatus === "Published" ? "Draft" : "Published";
    await this.updateVideo(videoId, { status: newStatus });
    return newStatus;
  },

  /**
   * Toggle featured status
   */
  async toggleFeatured(videoId, currentFeatured) {
    const newFeatured = !currentFeatured;
    await this.updateVideo(videoId, { isFeatured: newFeatured });
    return newFeatured;
  },

  /**
   * Delete video
   */
  async deleteVideo(videoId) {
    if (!videoId) throw new Error("Video ID is required");
    const current = await this.getVideos();
    const updated = current.filter((v) => v.id !== videoId);

    // Save updated list to dedicated document and sync
    await this._saveVideosList(updated);
    return true;
  },
};
