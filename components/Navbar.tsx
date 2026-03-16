'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookieLang, translations } from '@/lib/i18n/client';

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setLang(getCookieLang()); }, []);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function toggleLang() {
    const next = lang === 'id' ? 'en' : 'id';
    document.cookie = `lang=${next}; path=/; max-age=31536000`;
    setLang(next);
    router.refresh();
  }

  const t = translations[lang].nav;
  const navLinks = [
    { href: '/', label: t.home },
    { href: '/jelajah', label: t.explore },
    { href: '/admin/login', label: t.login },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      <nav
        className="flex justify-between items-center transition-all duration-300"
        style={{
          padding: '15px 30px',
          background: scrolled ? 'white' : 'transparent',
          borderBottom: scrolled ? '4px solid #2C3E50' : 'none',
          boxShadow: scrolled ? '4px 4px 0px #FFE66D, 0 4px 20px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        {/* Logo */}
        <div
          className="font-display transition-colors duration-300"
          style={{
            fontSize: 'clamp(24px, 4vw, 30px)',
            letterSpacing: '2px',
            color: scrolled ? 'var(--color-primary, #6B9CFF)' : 'white',
          }}
        >
          Singgah Sekejap
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-5 items-center">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-text-dark font-semibold transition-all border-3 border-text-dark rounded-[20px] bg-accent-yellow hover:bg-accent-pink"
              style={{
                fontSize: '16px',
                padding: '8px 16px',
                border: '3px solid #2C3E50',
                borderRadius: '20px',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'rotate(-3deg) translateY(-3px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0px #2C3E50';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={toggleLang}
            className="font-semibold cursor-pointer transition-all"
            style={{
              background: '#4ECDC4',
              padding: '8px 16px',
              border: '3px solid #2C3E50',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '700',
              transform: 'rotate(2deg)',
              display: 'inline-block',
            }}
          >
            {lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-text-dark"
          style={{ fontSize: '28px', cursor: 'pointer', background: 'none', border: 'none', padding: '8px' }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden bg-white border-b-4 border-text-dark flex flex-col gap-3"
          style={{ padding: '15px 20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="text-text-dark font-semibold text-center bg-accent-yellow"
              style={{
                padding: '12px 16px',
                border: '3px solid #2C3E50',
                borderRadius: '20px',
                textDecoration: 'none',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => { toggleLang(); setMobileOpen(false); }}
            className="font-semibold text-center"
            style={{
              padding: '12px 16px',
              border: '3px solid #2C3E50',
              borderRadius: '20px',
              background: '#4ECDC4',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            {lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
          </button>
        </div>
      )}
    </div>
  );
}
