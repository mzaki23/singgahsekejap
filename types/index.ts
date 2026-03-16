// Place Types
export interface Place {
  id: string;
  category: 'makanan' | 'pantai' | 'taman' | 'shopping' | 'wisata';
  subcategory: string;
  name: string;
  categoryBadge: string;
  location: string;
  rating: number;
  distance: number;
  tags: string[];
  image: string;
  lat: number;
  lng: number;
}

// Category Config Types
export interface CategoryFilter {
  label: string;
  value: string;
}

export interface CategoryConfig {
  title: string;
  icon: string;
  breadcrumb: string;
  subtitle: string;
  heroGradient: string;
  filters: CategoryFilter[];
}

export type CategoryType = 'makanan' | 'pantai' | 'taman' | 'shopping' | 'wisata';

export interface CategoryConfigMap {
  [key: string]: CategoryConfig;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Search Types
export interface SearchSuggestion {
  name: string;
  category: string;
  icon: string;
  type: string;
  categoryType: CategoryType;
}
