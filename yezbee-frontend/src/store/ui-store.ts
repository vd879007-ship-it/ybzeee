import { create } from 'zustand';

interface UIState {
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  isCartDrawerOpen: boolean;
  isScrolled: boolean;
  activeModal: string | null;
  activeDropdown: string | null;
  isNewsletterOpen: boolean;
  isQuickViewOpen: boolean;
  quickViewProductId: string | null;

  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleCartDrawer: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  setScrolled: (value: boolean) => void;
  openModal: (name: string) => void;
  closeModal: () => void;
  setActiveDropdown: (name: string | null) => void;
  openNewsletter: () => void;
  closeNewsletter: () => void;
  openQuickView: (productId: string) => void;
  closeQuickView: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isSearchOpen: false,
  isMobileMenuOpen: false,
  isCartDrawerOpen: false,
  isScrolled: false,
  activeModal: null,
  activeDropdown: null,
  isNewsletterOpen: false,
  isQuickViewOpen: false,
  quickViewProductId: null,

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  toggleCartDrawer: () => set((s) => ({ isCartDrawerOpen: !s.isCartDrawerOpen })),
  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),

  setScrolled: (value) => set({ isScrolled: value }),

  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),

  setActiveDropdown: (name) => set({ activeDropdown: name }),

  openNewsletter: () => set({ isNewsletterOpen: true }),
  closeNewsletter: () => set({ isNewsletterOpen: false }),

  openQuickView: (productId) => set({ isQuickViewOpen: true, quickViewProductId: productId }),
  closeQuickView: () => set({ isQuickViewOpen: false, quickViewProductId: null }),
}));
