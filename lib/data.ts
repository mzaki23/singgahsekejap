import { Place, CategoryConfigMap } from '@/types';

// Category Configuration
export const CATEGORY_CONFIG: CategoryConfigMap = {
  makanan: {
    title: "MAKANAN HITS!",
    icon: "🍔",
    breadcrumb: "🍔 Makanan Hits",
    subtitle: "Tempat nongkrong & kuliner terenak di Batam",
    heroGradient: "linear-gradient(135deg, #FF6B6B 0%, #FFA07A 100%)",
    filters: [
      { label: "☕ Kopi", value: "kopi" },
      { label: "🍽️ Resto", value: "resto" },
      { label: "🍜 Street Food", value: "street-food" },
      { label: "🍰 Dessert", value: "dessert" },
      { label: "💰 Murah Meriah", value: "murah" }
    ]
  },
  pantai: {
    title: "PANTAI CAKEP!",
    icon: "🏖️",
    breadcrumb: "🏖️ Pantai Cakep",
    subtitle: "Pantai cantik & spot sunset terbaik di Batam",
    heroGradient: "linear-gradient(135deg, #4ECDC4 0%, #87CEEB 100%)",
    filters: [
      { label: "🏝️ Pasir Putih", value: "pasir-putih" },
      { label: "🌅 Sunset Spot", value: "sunset" },
      { label: "🤿 Snorkeling", value: "snorkeling" },
      { label: "🏊 Swimming", value: "swimming" },
      { label: "💰 Gratis", value: "gratis" }
    ]
  },
  taman: {
    title: "TAMAN ASIK!",
    icon: "🌳",
    breadcrumb: "🌳 Taman Asik",
    subtitle: "Taman kota & ruang hijau untuk santai",
    heroGradient: "linear-gradient(135deg, #95E1D3 0%, #BEEA9A 100%)",
    filters: [
      { label: "🏃 Jogging Track", value: "jogging" },
      { label: "🎠 Playground", value: "playground" },
      { label: "🐕 Pet Friendly", value: "pet-friendly" },
      { label: "🌸 Taman Bunga", value: "bunga" },
      { label: "💰 Gratis", value: "gratis" }
    ]
  },
  shopping: {
    title: "SHOPPING SERU!",
    icon: "🛍️",
    breadcrumb: "🛍️ Shopping Seru",
    subtitle: "Mall & tempat belanja paling hits",
    heroGradient: "linear-gradient(135deg, #FFB6C1 0%, #FFB3D9 100%)",
    filters: [
      { label: "🏬 Mall", value: "mall" },
      { label: "🏪 Traditional Market", value: "traditional" },
      { label: "🏷️ Outlet", value: "outlet" },
      { label: "📱 Electronics", value: "electronics" },
      { label: "👕 Fashion", value: "fashion" }
    ]
  },
  wisata: {
    title: "WISATA KEREN!",
    icon: "🎡",
    breadcrumb: "🎡 Wisata Keren",
    subtitle: "Aktivitas & tempat wisata seru di Batam",
    heroGradient: "linear-gradient(135deg, #FFE66D 0%, #FFA07A 100%)",
    filters: [
      { label: "👨‍👩‍👧 Family Friendly", value: "family" },
      { label: "🎢 Adventure", value: "adventure" },
      { label: "🏠 Indoor", value: "indoor" },
      { label: "🌲 Outdoor", value: "outdoor" },
      { label: "📸 Instagramable", value: "instagramable" }
    ]
  }
};

// Places Database
export const PLACES_DATA: Place[] = [
  // ==================== MAKANAN ====================
  {
    id: "kopi-kenangan",
    category: "makanan",
    subcategory: "kopi",
    name: "Kopi Kenangan",
    categoryBadge: "☕ KOPI",
    location: "Nagoya Hill",
    rating: 4.8,
    distance: 2.5,
    tags: ["Free WiFi", "Instagramable"],
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    lat: 1.1217,
    lng: 104.0305
  },
  {
    id: "warung-pak-kumis",
    category: "makanan",
    subcategory: "street-food",
    name: "Warung Pak Kumis",
    categoryBadge: "🍜 STREET FOOD",
    location: "Batu Aji",
    rating: 4.6,
    distance: 3.8,
    tags: ["Murah Meriah", "Lokal Banget"],
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    lat: 1.0600,
    lng: 103.9800
  },
  {
    id: "the-bay-resto",
    category: "makanan",
    subcategory: "resto",
    name: "The Bay Resto",
    categoryBadge: "🍽️ RESTO",
    location: "Harbour Bay",
    rating: 4.9,
    distance: 5.2,
    tags: ["Seafood", "View Laut"],
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    lat: 1.1300,
    lng: 104.0100
  },
  {
    id: "janji-jiwa",
    category: "makanan",
    subcategory: "kopi",
    name: "Janji Jiwa Coffee",
    categoryBadge: "☕ KOPI",
    location: "Batam Centre",
    rating: 4.7,
    distance: 1.8,
    tags: ["Cozy", "Free WiFi"],
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    lat: 1.0800,
    lng: 104.0500
  },
  {
    id: "mie-ayam-bangka",
    category: "makanan",
    subcategory: "street-food",
    name: "Mie Ayam Pangsit Bangka",
    categoryBadge: "🍜 STREET FOOD",
    location: "Nagoya",
    rating: 4.5,
    distance: 2.1,
    tags: ["Murah Meriah", "Halal"],
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
    lat: 1.1150,
    lng: 104.0250
  },
  
  // ==================== PANTAI ====================
  {
    id: "pantai-melur",
    category: "pantai",
    subcategory: "pasir-putih",
    name: "Pantai Melur",
    categoryBadge: "🏖️ PANTAI",
    location: "Nongsa",
    rating: 4.7,
    distance: 8.5,
    tags: ["Pasir Putih", "Sunset", "Swimming"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    lat: 1.1500,
    lng: 104.0800
  },
  {
    id: "pantai-nongsa",
    category: "pantai",
    subcategory: "sunset",
    name: "Pantai Nongsa",
    categoryBadge: "🏖️ PANTAI",
    location: "Nongsa",
    rating: 4.6,
    distance: 9.2,
    tags: ["Sunset", "Snorkeling", "Gratis"],
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80",
    lat: 1.1620,
    lng: 104.0950
  },
  
  // ==================== TAMAN ====================
  {
    id: "taman-engku-putri",
    category: "taman",
    subcategory: "jogging",
    name: "Taman Engku Putri",
    categoryBadge: "🌳 TAMAN",
    location: "Batam Centre",
    rating: 4.5,
    distance: 3.2,
    tags: ["Jogging", "Gratis", "Playground"],
    image: "https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&w=800&q=80",
    lat: 1.0800,
    lng: 104.0500
  },
  {
    id: "ocarina-park",
    category: "taman",
    subcategory: "playground",
    name: "Ocarina Park",
    categoryBadge: "🌳 TAMAN",
    location: "Batam Centre",
    rating: 4.6,
    distance: 2.8,
    tags: ["Playground", "Pet Friendly", "Gratis"],
    image: "https://images.unsplash.com/photo-1588392382834-a891154bca4d?auto=format&fit=crop&w=800&q=80",
    lat: 1.0850,
    lng: 104.0480
  },
  
  // ==================== SHOPPING ====================
  {
    id: "harbour-bay-mall",
    category: "shopping",
    subcategory: "mall",
    name: "Harbour Bay Mall",
    categoryBadge: "🛍️ MALL",
    location: "Harbour Bay",
    rating: 4.6,
    distance: 5.5,
    tags: ["Mall", "Fashion", "Food Court"],
    image: "https://images.unsplash.com/photo-1519567281799-9e5105b53cb2?auto=format&fit=crop&w=800&q=80",
    lat: 1.1300,
    lng: 104.0100
  },
  {
    id: "nagoya-hill-mall",
    category: "shopping",
    subcategory: "mall",
    name: "Nagoya Hill Mall",
    categoryBadge: "🛍️ MALL",
    location: "Nagoya",
    rating: 4.7,
    distance: 2.2,
    tags: ["Mall", "Luxury", "Food Court"],
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
    lat: 1.1200,
    lng: 104.0300
  },
  
  // ==================== WISATA ====================
  {
    id: "batam-miniature-park",
    category: "wisata",
    subcategory: "family",
    name: "Batam Miniature Park",
    categoryBadge: "🎡 WISATA",
    location: "Batam Centre",
    rating: 4.5,
    distance: 3.5,
    tags: ["Family Friendly", "Outdoor", "Instagramable"],
    image: "https://images.unsplash.com/photo-1594818379496-da1e345b0ded?auto=format&fit=crop&w=800&q=80",
    lat: 1.0820,
    lng: 104.0520
  },
  {
    id: "go-kart-batam",
    category: "wisata",
    subcategory: "adventure",
    name: "Go-Kart Batam",
    categoryBadge: "🎡 WISATA",
    location: "Muka Kuning",
    rating: 4.7,
    distance: 6.8,
    tags: ["Adventure", "Outdoor", "Seru"],
    image: "https://images.unsplash.com/photo-1547038577-196e6b106d85?auto=format&fit=crop&w=800&q=80",
    lat: 1.0650,
    lng: 104.0750
  }
];

// Helper Functions
export function getPlaceById(id: string): Place | undefined {
  return PLACES_DATA.find(place => place.id === id);
}

export function getPlacesByCategory(category: string): Place[] {
  return PLACES_DATA.filter(place => place.category === category);
}

export function searchPlaces(query: string): Place[] {
  const q = query.toLowerCase();
  return PLACES_DATA.filter(place => 
    place.name.toLowerCase().includes(q) ||
    place.category.toLowerCase().includes(q) ||
    place.subcategory.toLowerCase().includes(q) ||
    place.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export function getRelatedPlaces(placeId: string, limit: number = 3): Place[] {
  const place = getPlaceById(placeId);
  if (!place) return [];
  
  return PLACES_DATA
    .filter(p => p.category === place.category && p.id !== placeId)
    .slice(0, limit);
}
