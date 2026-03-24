import { queries } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';
import Navbar from '@/components/Navbar';
import HomeHero from '@/components/HomeHero';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import HomeMap from '@/components/HomeMap';
import ScrollAnimator from '@/components/ScrollAnimator';
import ContributorLogos from '@/components/ContributorLogos';
import FooterSocial from '@/components/FooterSocial';
import Link from 'next/link';
import { getLang, translations } from '@/lib/i18n/server';

export default async function HomePage() {
  noStore();
  const lang = await getLang();
  const t = translations[lang];
  const allPlaces = await queries.places.getAll({ status: 'published' }).catch(() => []);
  const featuredPlaces = allPlaces.slice(0, 8);

  const mapPlaces = allPlaces
    .filter((p: any) => p.latitude && p.longitude)
    .slice(0, 20)
    .map((p: any) => ({
      name: p.name,
      category: p.category,
      lat: parseFloat(p.latitude),
      lng: parseFloat(p.longitude),
      image_url: p.image_url ?? null,
      slug: p.slug,
    }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <HomeHero />

      {/* Contributor Section */}
      <section
        className="relative border-b-[5px] border-dashed border-text-dark overflow-hidden pt-[40px] px-4 pb-[40px] md:pt-[60px] md:px-[40px] md:pb-[60px]"
        style={{ background: 'white' }}
      >
        <div className="text-center mb-10">
          <h3
            className="font-script text-text-dark relative inline-block"
            style={{ fontSize: '36px', fontWeight: 700 }}
          >
            {t.home.contributorTitle}
          </h3>
          <p className="font-cute mt-4" style={{ fontSize: '16px', color: '#666', fontWeight: 500 }}>
            {t.home.contributorSub}
          </p>
        </div>
        <ContributorLogos />
      </section>

      {/* Featured Section */}
      <FeaturedCarousel places={featuredPlaces as any} />

      {/* Map Section */}
      <HomeMap places={mapPlaces} />

      {/* Footer */}
      <footer
        className="relative overflow-hidden"
        style={{
          background: '#6B9CFF',
          borderTop: '5px solid #2C3E50',
          color: 'white',
        }}
      >
        {/* Marquee */}
        <div
          className="overflow-hidden flex font-pixel font-bold"
          style={{
            background: '#FFE66D',
            color: '#2C3E50',
            padding: '10px 0',
            borderBottom: '4px solid #2C3E50',
            fontSize: '16px',
            whiteSpace: 'nowrap',
            letterSpacing: '2px',
          }}
        >
          <div style={{ display: 'inline-block', paddingLeft: '100%', animation: 'marquee 20s linear infinite' }}>
            {t.home.marquee}
          </div>
        </div>

        {/* Footer Content */}
        <div
          className="grid gap-[30px] px-5 py-[30px] md:p-[40px]"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 2px, transparent 2px)',
            backgroundSize: '20px 20px',
          }}
        >
          <div>
            <h2
              className="font-display text-accent-yellow inline-block"
              style={{
                fontSize: 'clamp(28px, 6vw, 36px)',
                textShadow: '3px 3px 0px #2C3E50',
                marginBottom: '12px',
                transform: 'rotate(-2deg)',
                display: 'inline-block',
              }}
            >
              Singgah Sekejap
            </h2>
            <p className="font-cute text-white" style={{ fontSize: '16px', lineHeight: 1.6, fontWeight: 500 }}>
              {t.home.footerDesc}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3
              className="font-pixel text-accent-pink"
              style={{
                fontSize: '18px',
                textShadow: '2px 2px 0px #2C3E50',
                borderBottom: '2px dashed rgba(255,255,255,0.3)',
                paddingBottom: '8px',
                display: 'inline-block',
                marginBottom: '5px',
              }}
            >
              {t.home.footerCategories}
            </h3>
            {[
              { href: '/makanan',  label: '🍔 Makanan Hits' },
              { href: '/pantai',   label: '🏖️ Wisata Pantai' },
              { href: '/taman',    label: '🌳 Taman Kota' },
              { href: '/shopping', label: '🛍️ Shopping' },
              { href: '/wisata',   label: '🎡 Wisata Seru' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-white font-cute font-semibold flex items-center gap-2 hover:text-accent-yellow transition-all hover:translate-x-2"
                style={{ textDecoration: 'none' }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div>
            <h3
              className="font-pixel text-accent-pink"
              style={{
                fontSize: '18px',
                textShadow: '2px 2px 0px #2C3E50',
                borderBottom: '2px dashed rgba(255,255,255,0.3)',
                paddingBottom: '8px',
                display: 'inline-block',
                marginBottom: '15px',
              }}
            >
              💻 CONNECT!
            </h3>
            <FooterSocial />
          </div>
        </div>

        {/* Footer Bottom */}
        <div
          className="text-center font-pixel text-white"
          style={{ background: '#2C3E50', padding: '15px', fontSize: '14px', letterSpacing: '1px' }}
        >
          © 2026 Singgah Sekejap. All Rights Reserved.
        </div>
      </footer>

      <ScrollAnimator />
    </div>
  );
}
