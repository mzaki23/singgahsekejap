# 🌴 Singgah Sekejap — Explore Batam

> Website panduan wisata & kuliner Kota Batam. Temukan hidden gem, cafe hits, dan pantai cakep di satu tempat.

**Live:** [projectbatam.vercel.app](https://projectbatam.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?style=flat-square&logo=vercel)

---

## ✨ Fitur

### 🏖️ Publik

| Fitur | Deskripsi |
|-------|-----------|
| **Homepage** | Hero search bar, featured carousel, interactive map, footer dengan marquee |
| **Kategori** | 5 kategori — Makanan, Pantai, Taman, Shopping, Wisata |
| **Halaman Detail** | Foto, rating, ulasan, tags, jarak, koordinat + link Google Maps |
| **Pencarian** | Full-text search nama, area, dan tags |
| **Jelajah** | Halaman eksplorasi semua kategori sekaligus |
| **Peta Interaktif** | Leaflet.js — pin tiap tempat dengan popup info |
| **Ulasan** | Pengunjung bisa submit ulasan + rating bintang |
| **Laporan** | Tombol laporan tempat yang bermasalah |
| **Jarak Otomatis** | Badge jarak dihitung real-time dari GPS pengunjung |
| **Bilingual** | Antarmuka Indonesia / English (i18n server-side) |
| **Desain Y2K Retro** | Aesthetic playful & nostalgic, mobile-first |

### 🔧 Admin Panel (`/admin`)

| Fitur | Deskripsi |
|-------|-----------|
| **Auth** | Login & register dengan password hashing (bcrypt) |
| **Dashboard** | Ringkasan statistik tempat, ulasan, pengguna |
| **Kelola Tempat** | CRUD lengkap — tambah, edit, hapus, publish/draft |
| **Form Tempat** | Input lengkap dengan GPS button + **live map pin picker** |
| **Live Map Pin Picker** | Drag marker atau klik peta untuk set koordinat secara presisi |
| **Audit History** | Log perubahan setiap tempat |
| **Kelola Ulasan** | Approve / reject ulasan pengunjung |
| **Kelola Laporan** | Tinjau dan tindak laporan dari pengunjung |
| **Kelola Pengguna** | Tabel pengguna + tambah user baru via modal |
| **Analytics** | Grafik: tempat terpopuler, distribusi kategori, event terkini |
| **CSV Import/Export** | Upload data tempat via CSV, export semua data |
| **Settings** | Konfigurasi aplikasi |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS |
| Maps | Leaflet.js + React Leaflet |
| Auth | NextAuth.js v4 |
| Database | Vercel Postgres (PostgreSQL) |
| Cache | Vercel KV (Redis) |
| Image | Cloudinary |
| Charts | Recharts |
| UI | Radix UI + Lucide Icons + react-hot-toast |
| Deploy | Vercel |

---

## 📁 Struktur Proyek

```
projectbatam/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── [category]/
│   │   ├── page.tsx                # Halaman kategori
│   │   └── [slug]/page.tsx         # Halaman detail tempat
│   ├── search/page.tsx             # Hasil pencarian
│   ├── jelajah/page.tsx            # Halaman jelajah
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── places/                 # CRUD tempat
│   │   ├── reviews/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── users/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── api/                        # API routes
│       ├── places/
│       ├── reviews/
│       ├── reports/
│       ├── users/
│       └── auth/
├── components/
│   ├── HomeHero.tsx                # Hero + search bar
│   ├── HomeMap.tsx                 # Map wrapper (dynamic import)
│   ├── HomeMapInner.tsx            # Leaflet map component
│   ├── FeaturedCarousel.tsx        # Carousel tempat featured
│   ├── ReviewForm.tsx              # Form ulasan publik
│   ├── DistanceBadge.tsx           # Badge jarak GPS
│   ├── ReportButton.tsx            # Tombol lapor
│   └── admin/
│       ├── PlaceForm.tsx           # Form tambah/edit tempat
│       ├── LocationPickerMap.tsx   # Live map pin picker
│       ├── AnalyticsCharts.tsx     # Chart recharts
│       ├── CsvImportExport.tsx     # CSV upload/download
│       └── ...
├── lib/
│   ├── db.ts                       # Query database
│   ├── auth.ts                     # NextAuth config
│   └── i18n/                       # Terjemahan ID/EN
├── database/
│   └── schema.sql                  # Skema database
└── types/
    └── index.ts
```

---

## 🤝 Kontribusi

1. Fork repo ini
2. Buat branch fitur: `git checkout -b feat/nama-fitur`
3. Commit perubahan
4. Push & buat Pull Request

---

## 📄 Lisensi

MIT License

---

Made with ☕ in Batam | Powered by Vercel ▲
