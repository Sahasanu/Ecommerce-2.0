import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";

const SITE_DOC = () => doc(fireDB, "configure", "site");
const TEAM_COL = () => collection(fireDB, "teamMembers");

/**
 * Curated default team members for Bengal Tiles showroom & consultation
 */
export const DEFAULT_TEAM_MEMBERS = [
  {
    id: "member_founder",
    name: "SK Abdul Ohid",
    designation: "Founder & Managing Director",
    phone: "+91 7384461098",
    photo:
      "https://firebasestorage.googleapis.com/v0/b/bengal-tiles---website.firebasestorage.app/o/company%2Fbengal_tiles_owner_1.jpeg?alt=media&token=e9760f80-9e5c-4462-8d95-78181928e15d",
    bio: "Guiding Bengal Tiles with over two decades of tile & marble curation experience.",
    isLeadership: true,
    status: "Active",
    displayOrder: 1,
  },
  {
    id: "member_architect",
    name: "Tanmay Roy",
    designation: "Head of Architectural Consultation",
    phone: "+91 98321 45678",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    bio: "Specializing in large-format vitrified slabs and precision layouts for villas.",
    isLeadership: false,
    status: "Active",
    displayOrder: 2,
  },
  {
    id: "member_specialist",
    name: "Priyanka Dey",
    designation: "Senior Surface & Design Specialist",
    phone: "+91 97490 12345",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    bio: "Advising discerning homeowners on finishes, Italian marble veining, and palettes.",
    isLeadership: false,
    status: "Active",
    displayOrder: 3,
  },
  {
    id: "member_logistics",
    name: "Rajesh Pramanik",
    designation: "Director of Logistics & Operations",
    phone: "+91 94342 67890",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    bio: "Supervising crate shipping, lot shade consistency, and regional deliveries.",
    isLeadership: false,
    status: "Active",
    displayOrder: 4,
  },
  {
    id: "member_experience",
    name: "Lucy Sen",
    designation: "Customer Success & Care Lead",
    phone: "+91 96478 54321",
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    bio: "Ensuring an effortless showroom visit, order tracking, and after-sales satisfaction.",
    isLeadership: false,
    status: "Active",
    displayOrder: 5,
  },
  {
    id: "member_inspection",
    name: "Amitabha Ghosh",
    designation: "Quality Assurance & Lot Inspector",
    phone: "+91 95471 89012",
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    bio: "Executing stringent dimensional calibration, edge polish, and glaze tests.",
    isLeadership: false,
    status: "Active",
    displayOrder: 6,
  },
];

export const teamService = {
  /**
   * Fetch all team members from configure/site (guaranteed permissions)
   * with fallback to teamMembers collection or local defaults
   */
  async getTeamMembers() {
    // 1. Try reading from configure/site doc
    try {
      const siteSnap = await getDoc(SITE_DOC());
      if (siteSnap.exists()) {
        const data = siteSnap.data();
        if (Array.isArray(data.teamMembers) && data.teamMembers.length > 0) {
          return [...data.teamMembers].sort(
            (a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999)
          );
        }
      }
    } catch (err) {
      console.warn("Could not read teamMembers from configure/site:", err);
    }

    // 2. Try reading from teamMembers collection
    try {
      const snap = await getDocs(TEAM_COL());
      if (!snap.empty) {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        return list.sort(
          (a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999)
        );
      }
    } catch (err) {
      console.warn("Could not read from teamMembers collection:", err);
    }

    // 3. Fallback to cached or defaults
    try {
      const cached = localStorage.getItem("cached_team_members");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    return DEFAULT_TEAM_MEMBERS;
  },

  /**
   * Fetch only active members for public display
   */
  async getActiveTeamMembers() {
    const all = await this.getTeamMembers();
    return all.filter((m) => m.status === "Active" || !m.status);
  },

  /**
   * Persist full team list to configure/site and local cache
   */
  async _saveTeamList(membersList) {
    const sorted = [...membersList].sort(
      (a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999)
    );

    try {
      localStorage.setItem("cached_team_members", JSON.stringify(sorted));
    } catch (e) {}

    // Save to configure/site (always authorized for admin)
    await setDoc(
      SITE_DOC(),
      {
        teamMembers: sorted,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return sorted;
  },

  /**
   * Add a new member
   */
  async addTeamMember(data) {
    const newId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newMember = {
      id: newId,
      name: data.name?.trim() || "Team Member",
      designation: data.designation?.trim() || "Staff",
      phone: data.phone?.trim() || "",
      photo:
        data.photo?.trim() ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      bio: data.bio?.trim() || "",
      isLeadership: Boolean(data.isLeadership),
      status: data.status || "Active",
      displayOrder: Number(data.displayOrder) || 99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = await this.getTeamMembers();
    const updated = [...current, newMember];
    await this._saveTeamList(updated);

    // Also attempt firestore collection write if permitted
    try {
      await addDoc(TEAM_COL(), newMember);
    } catch (e) {
      // Ignore if top-level collection rule is not configured
    }

    return newMember;
  },

  /**
   * Update an existing member
   */
  async updateTeamMember(id, data) {
    if (!id) throw new Error("Member ID is required");
    const current = await this.getTeamMembers();

    const updated = current.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          name: data.name?.trim() ?? m.name,
          designation: data.designation?.trim() ?? m.designation,
          phone: data.phone?.trim() ?? m.phone,
          photo: data.photo?.trim() ?? m.photo,
          bio: data.bio?.trim() ?? m.bio,
          isLeadership: data.isLeadership !== undefined ? Boolean(data.isLeadership) : m.isLeadership,
          status: data.status ?? m.status ?? "Active",
          displayOrder: Number(data.displayOrder) ?? m.displayOrder ?? 99,
          updatedAt: new Date().toISOString(),
        };
      }
      return m;
    });

    await this._saveTeamList(updated);

    // Also attempt firestore collection update if permitted
    try {
      const docRef = doc(fireDB, "teamMembers", id);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    } catch (e) {
      // Ignore if top-level collection rule is not configured
    }

    return updated.find((m) => m.id === id);
  },

  /**
   * Toggle Active / Inactive status
   */
  async toggleMemberStatus(id, currentStatus) {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    await this.updateTeamMember(id, { status: nextStatus });
    return nextStatus;
  },

  /**
   * Delete member without permission errors
   */
  async deleteTeamMember(id) {
    if (!id) throw new Error("Member ID is required");
    const current = await this.getTeamMembers();
    const updated = current.filter((m) => m.id !== id);

    // Save updated list to configure/site (guaranteed permission)
    await this._saveTeamList(updated);

    // Try deleting from top-level collection if it was stored there
    try {
      const docRef = doc(fireDB, "teamMembers", id);
      await deleteDoc(docRef);
    } catch (e) {
      // Ignore top-level collection rule permissions
    }

    return true;
  },

  /**
   * Seed default team members
   */
  async seedDefaultMembers() {
    await this._saveTeamList(DEFAULT_TEAM_MEMBERS);
    return DEFAULT_TEAM_MEMBERS;
  },
};
