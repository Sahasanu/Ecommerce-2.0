import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { fireDB } from '../../firebase/FirebaseConfig';
import { DEFAULT_BRANDS } from './defaultBrands';

const SITE_CONFIG_DOC = () => doc(fireDB, 'configure', 'site');

export const brandService = {
  /**
   * Fetch all brands and section metadata from configure/site
   */
  async getBrandsData() {
    try {
      const snap = await getDoc(SITE_CONFIG_DOC());
      if (snap.exists()) {
        const data = snap.data();
        const brands = Array.isArray(data.brands) && data.brands.length > 0
          ? data.brands
          : DEFAULT_BRANDS;
        const sectionConfig = {
          title: 'Brand Partner and Dealer',
          subtitle: '',
          enabled: true,
          ...(data.brandsSection || {}),
        };
        return { brands, sectionConfig };
      }
    } catch (err) {
      console.warn('Failed to load brands from Firestore, using default:', err);
    }
    return {
      brands: DEFAULT_BRANDS,
      sectionConfig: { title: 'Brand Partner and Dealer', subtitle: '', enabled: true },
    };
  },

  /**
   * Save the entire brands list and section settings
   */
  async saveBrandsData(brands, sectionConfig, adminUid = '') {
    const payload = {
      brands,
      brandsSection: sectionConfig,
      updatedAt: serverTimestamp(),
      updatedBy: adminUid,
    };
    await setDoc(SITE_CONFIG_DOC(), payload, { merge: true });
    return payload;
  },

  /**
   * Add a new brand
   */
  async addBrand(brand, currentBrands = [], sectionConfig = {}, adminUid = '') {
    const newBrand = {
      id: `brand_${Date.now()}`,
      name: brand.name?.trim() || 'New Brand Partner',
      logo: brand.logo || '',
      website: brand.website?.trim() || '',
      isActive: brand.isActive !== false,
      order: currentBrands.length + 1,
      createdAt: Date.now(),
    };
    const updatedBrands = [...currentBrands, newBrand];
    await this.saveBrandsData(updatedBrands, sectionConfig, adminUid);
    return newBrand;
  },

  /**
   * Update an existing brand
   */
  async updateBrand(brandId, patch, currentBrands = [], sectionConfig = {}, adminUid = '') {
    const updatedBrands = currentBrands.map((b) =>
      b.id === brandId ? { ...b, ...patch, updatedAt: Date.now() } : b
    );
    await this.saveBrandsData(updatedBrands, sectionConfig, adminUid);
    return updatedBrands;
  },

  /**
   * Delete a brand
   */
  async deleteBrand(brandId, currentBrands = [], sectionConfig = {}, adminUid = '') {
    const updatedBrands = currentBrands.filter((b) => b.id !== brandId);
    await this.saveBrandsData(updatedBrands, sectionConfig, adminUid);
    return updatedBrands;
  },

  /**
   * Toggle brand visibility
   */
  async toggleStatus(brandId, currentBrands = [], sectionConfig = {}, adminUid = '') {
    const updatedBrands = currentBrands.map((b) =>
      b.id === brandId ? { ...b, isActive: !b.isActive } : b
    );
    await this.saveBrandsData(updatedBrands, sectionConfig, adminUid);
    return updatedBrands;
  },

  /**
   * Reset to default initial 20 showroom brands
   */
  async resetToDefaults(sectionConfig = {}, adminUid = '') {
    await this.saveBrandsData(DEFAULT_BRANDS, sectionConfig, adminUid);
    return DEFAULT_BRANDS;
  },
};
