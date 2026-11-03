import { create } from 'zustand';
import { api } from '../services/api';

export interface CompanyProfile {
  companyNameAr: string;
  companyNameEn: string;
  slogan: string;
  commercialRegistration: string;
  taxNumber: string;
  phone: string;
  mobile: string;
  whatsApp: string;
  email: string;
  website: string;
  address: string;
  city: string;
  logoBase64: string | null;
  bankAccounts: string;
  invoiceTerms: string;
  activeTemplate: 'modern' | 'classic' | 'minimal' | 'bold';
  primaryColor: string;
  accentColor: string;
  showLogo: boolean;
  showTaxNumber: boolean;
  showBankDetails: boolean;
  defaultPrintSize: '80mm' | 'a4' | 'a5';
}

interface BrandState {
  profile: CompanyProfile;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<CompanyProfile>) => Promise<void>;
}

const DEFAULT_PROFILE: CompanyProfile = {
  companyNameAr: 'مؤسسة توزيع المياه والعصائر المركزية',
  companyNameEn: 'Central Beverage & Water Distribution Co.',
  slogan: 'تبريد فائق، توزيع موثوق، وتوريد ميداني دقيق',
  commercialRegistration: '1010-998877',
  taxNumber: '300123456700003',
  phone: '01-234567',
  mobile: '777000111',
  whatsApp: '967777000111',
  email: 'info@centralbeverage.local',
  website: 'www.centralbeverage.local',
  address: 'صنعاء - شارع الستين الجنوبي - جوار جولة المصباحي',
  city: 'صنعاء',
  logoBase64: null,
  bankAccounts: 'بنك الكريمي: 123456789 | بنك التضامن: 987654321',
  invoiceTerms: 'البضاعة المباعة لا ترد بعد 3 أيام إلا بحالتها السليمة. الأسعار تشمل ضريبة المبيعات.',
  activeTemplate: 'modern',
  primaryColor: '#2563eb',
  accentColor: '#0284c7',
  showLogo: true,
  showTaxNumber: true,
  showBankDetails: true,
  defaultPrintSize: '80mm',
};

export const useBrandStore = create<BrandState>((set, get) => ({
  profile: (() => {
    try {
      const cached = localStorage.getItem('beverage_brand_profile');
      return cached ? { ...DEFAULT_PROFILE, ...JSON.parse(cached) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  })(),
  isLoading: false,

  loadProfile: async () => {
    set({ isLoading: true });
    try {
      const data = await api.getCompanyProfile();
      if (data) {
        const mapped: CompanyProfile = {
          companyNameAr: data.companyNameAr || DEFAULT_PROFILE.companyNameAr,
          companyNameEn: data.companyNameEn || DEFAULT_PROFILE.companyNameEn,
          slogan: data.slogan || DEFAULT_PROFILE.slogan,
          commercialRegistration: data.commercialRegistration || DEFAULT_PROFILE.commercialRegistration,
          taxNumber: data.taxNumber || DEFAULT_PROFILE.taxNumber,
          phone: data.phone || DEFAULT_PROFILE.phone,
          mobile: data.mobile || DEFAULT_PROFILE.mobile,
          whatsApp: data.whatsApp || DEFAULT_PROFILE.whatsApp,
          email: data.email || DEFAULT_PROFILE.email,
          website: data.website || DEFAULT_PROFILE.website,
          address: data.address || DEFAULT_PROFILE.address,
          city: data.city || DEFAULT_PROFILE.city,
          logoBase64: data.logoBase64 || null,
          bankAccounts: data.bankAccounts || DEFAULT_PROFILE.bankAccounts,
          invoiceTerms: data.invoiceTerms || DEFAULT_PROFILE.invoiceTerms,
          activeTemplate: (data.activeTemplate as any) || DEFAULT_PROFILE.activeTemplate,
          primaryColor: data.primaryColor || DEFAULT_PROFILE.primaryColor,
          accentColor: data.accentColor || DEFAULT_PROFILE.accentColor,
          showLogo: data.showLogo ?? DEFAULT_PROFILE.showLogo,
          showTaxNumber: data.showTaxNumber ?? DEFAULT_PROFILE.showTaxNumber,
          showBankDetails: data.showBankDetails ?? DEFAULT_PROFILE.showBankDetails,
          defaultPrintSize: (data.defaultPrintSize as any) || DEFAULT_PROFILE.defaultPrintSize,
        };
        localStorage.setItem('beverage_brand_profile', JSON.stringify(mapped));
        set({ profile: mapped });
      }
    } catch (e) {
      console.warn('Using local cached company profile:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (partial) => {
    const updated: CompanyProfile = { ...get().profile, ...partial };
    set({ profile: updated });
    try {
      localStorage.setItem('beverage_brand_profile', JSON.stringify(updated));
      await api.updateCompanyProfile(updated);
    } catch (e) {
      console.error('Failed to sync brand profile to backend:', e);
    }
  },
}));

