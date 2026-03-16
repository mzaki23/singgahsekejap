'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCookieLang, translations } from '@/lib/i18n/client';

type PlaceItem = {
  name: string;
  category: string;
  icon: string;
  categoryType: string;
  slug: string;
};

const FOLDERS = [
  { label: 'MAKANAN', href: '/makanan', icon: '📁' },
  { label: 'PANTAI',  href: '/pantai',  icon: '📁' },
  { label: 'TAMAN',   href: '/taman',   icon: '📁' },
  { label: 'SHOPPING',href: '/shopping',icon: '📁' },
  { label: 'WISATA',  href: '/wisata',  icon: '📁' },
];

export default function HomeHero() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [dbPlaces, setDbPlaces] = useState<PlaceItem[]>([]);
  const [suggestions, setSuggestions] = useState<PlaceItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [clock, setClock] = useState('');
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setLang(getCookieLang()); }, []);

  useEffect(() => {
    function tick() {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setClock(`${h}:${m} ${ampm}`);
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  // Fetch places from DB on mount
  useEffect(() => {
    fetch('/api/places?status=published')
      .then(r => r.json())
      .then((res: any) => {
        const mapped = (res.data ?? []).map((p: any) => ({
          name: p.name,
          category: p.category.charAt(0).toUpperCase() + p.category.slice(1),
          icon: p.category_badge?.split(' ')[0] ?? '📍',
          categoryType: p.category,
          slug: p.slug,
        }));
        setDbPlaces(mapped);
      })
      .catch(() => {});
  }, []);

  // Update dropdown position when shown or on scroll/resize
  useEffect(() => {
    if (!showSuggestions) return;

    function updateRect() {
      if (searchBoxRef.current) {
        setDropdownRect(searchBoxRef.current.getBoundingClientRect());
      }
    }

    updateRect();
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [showSuggestions]);

  function handleInput(val: string) {
    setQuery(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      const q = val.toLowerCase();
      const filtered = dbPlaces.filter(p =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      ).slice(0, 5);
      setSuggestions(filtered);
      if (searchBoxRef.current) {
        setDropdownRect(searchBoxRef.current.getBoundingClientRect());
      }
      setShowSuggestions(true);
    }, 200);
  }

  function doSearch(place?: PlaceItem) {
    setShowSuggestions(false);
    if (place?.slug) {
      router.push(`/${place.categoryType}/${place.slug}`);
    } else {
      const cat = place?.categoryType ?? 'makanan';
      const q = place?.name ?? query;
      router.push(`/${cat}?search=${encodeURIComponent(q)}`);
    }
  }

  function handleSearchBtn() {
    if (!query.trim()) return;
    const matched = dbPlaces.find(p => p.name.toLowerCase() === query.toLowerCase());
    if (matched?.slug) {
      doSearch(matched);
    } else {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  const t = translations[lang].hero;

  const dropdown = showSuggestions && dropdownRect ? createPortal(
    <div
      style={{
        position: 'fixed',
        top: dropdownRect.bottom + 5,
        left: Math.min(dropdownRect.left, Math.max(16, window.innerWidth - dropdownRect.width - 16)),
        width: dropdownRect.width,
        background: 'white',
        border: '3px solid #6B9CFF',
        borderRadius: '20px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
        maxHeight: '300px',
        overflowY: 'auto',
        zIndex: 99999,
      }}
      onMouseDown={e => e.preventDefault()}
    >
      {suggestions.length > 0 ? suggestions.map((p, i) => (
        <div
          key={i}
          className="flex items-center gap-[10px] cursor-pointer hover:bg-[#E8F1FF] transition-colors"
          style={{
            padding: '12px 20px',
            borderBottom: i < suggestions.length - 1 ? '2px dashed #E8F1FF' : 'none',
          }}
          onClick={() => doSearch(p)}
        >
          <div style={{ fontSize: '20px' }}>{p.icon}</div>
          <div>
            <div className="font-bold text-text-dark" style={{ fontSize: '15px' }}>{p.name}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{p.category}</div>
          </div>
        </div>
      )) : (
        <div className="flex items-center gap-[10px]" style={{ padding: '12px 20px' }}>
          <div style={{ fontSize: '20px' }}>😅</div>
          <div>
            <div className="font-bold text-text-dark" style={{ fontSize: '15px' }}>{t.notFound}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{t.notFoundSub}</div>
          </div>
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden pt-[30px] px-4 pb-20 md:pt-[50px] md:px-[40px] md:pb-[90px]"
      style={{
        backgroundColor: '#6B9CFF',
        backgroundImage: `
          linear-gradient(to bottom, transparent 65%, #BEEA9A 65%),
          conic-gradient(#8EB3FF 90deg, transparent 90deg 180deg, #8EB3FF 180deg 270deg, transparent 270deg)
        `,
        backgroundSize: '100% 100%, 20px 20px',
        minHeight: '550px',
        borderBottom: '5px solid #6B9CFF',
      }}
    >
      {/* Floating sparkles */}
      {[
        { top: '15%', right: '15%', delay: '0s',   size: '30px', symbol: '⭐' },
        { top: '40%', left: '20%',  delay: '1s',   size: '20px', symbol: '✨' },
        { bottom: '25%', right: '25%', delay: '0.5s', size: '40px', symbol: '🌟' },
      ].map((s, i) => (
        <div
          key={i}
          className="absolute pointer-events-none z-[5]"
          style={{
            top: s.top, right: (s as any).right, left: (s as any).left, bottom: (s as any).bottom,
            fontSize: s.size,
            animation: `floatY2K 3s ease-in-out ${s.delay} infinite`,
            filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.1))',
          }}
        >
          {s.symbol}
        </div>
      ))}

      {/* Desktop folder icons */}
      <div
        className="absolute z-[5] flex-col gap-[25px] hidden md:flex"
        style={{ left: '30px', top: '40px' }}
      >
        {FOLDERS.map(f => (
          <Link key={f.label} href={f.href} style={{ textDecoration: 'none' }}>
            <div className="flex flex-col items-center gap-[5px] cursor-pointer transition-transform hover:scale-110">
              <div style={{ fontSize: '45px', filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.2))' }}>
                {f.icon}
              </div>
              <div
                className="font-pixel text-white"
                style={{
                  background: '#6B9CFF',
                  padding: '2px 10px',
                  fontSize: '14px',
                  border: '2px solid white',
                  borderRadius: '4px',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.2)',
                  letterSpacing: '1px',
                }}
              >
                {f.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile folder row */}
      <div className="md:hidden flex flex-row flex-wrap justify-center gap-[15px] w-full mb-5">
        {FOLDERS.map(f => (
          <Link key={f.label} href={f.href} style={{ textDecoration: 'none' }}>
            <div className="flex flex-col items-center gap-1">
              <div style={{ fontSize: '35px' }}>{f.icon}</div>
              <div
                className="font-pixel text-white"
                style={{
                  background: '#6B9CFF',
                  padding: '2px 8px',
                  fontSize: '12px',
                  border: '2px solid white',
                  borderRadius: '4px',
                }}
              >
                {f.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main OS Window */}
      <div
        className="relative z-[10] w-full overflow-hidden transition-transform hover:rotate-0"
        style={{
          background: '#E8F1FF',
          border: '4px solid #6B9CFF',
          borderRadius: '12px',
          maxWidth: '650px',
          boxShadow: '10px 10px 0 rgba(107, 156, 255, 0.4)',
          transform: 'rotate(-1deg)',
        }}
      >
        {/* Title Bar */}
        <div
          className="flex justify-between items-center border-b-4 border-[#6B9CFF]"
          style={{
            background: 'linear-gradient(to right, #4A83F6, #6B9CFF)',
            padding: '8px 15px',
          }}
        >
          <div className="font-pixel text-white flex items-center gap-2" style={{ fontSize: '16px', letterSpacing: '1px', textShadow: '1px 1px 0px #3461C0' }}>
            ★ jelajah_batam.exe
          </div>
          <div className="flex gap-[6px]">
            {['_', '□', '×'].map((btn, i) => (
              <div
                key={i}
                className="flex items-center justify-center font-black cursor-pointer"
                style={{
                  width: '22px', height: '22px',
                  background: i === 2 ? '#FFB3D9' : 'white',
                  color: i === 2 ? '#D84A8B' : '#6B9CFF',
                  borderRadius: '4px',
                  border: `2px solid ${i === 2 ? '#D84A8B' : '#6B9CFF'}`,
                  fontSize: '14px',
                  boxShadow: 'inset -2px -2px 0px rgba(0,0,0,0.1)',
                }}
              >
                {btn}
              </div>
            ))}
          </div>
        </div>

        {/* Window Content */}
        <div
          className="text-center relative px-4 py-[25px] md:px-[30px] md:py-[40px]"
          style={{
            background: 'linear-gradient(to bottom, #FFFFFF, #E8F1FF)',
          }}
        >
          {/* Speech Bubble */}
          <div
            className="absolute font-cute font-bold text-[#6B9CFF] z-[15] hidden sm:block"
            style={{
              top: '-25px', left: '-20px',
              background: '#FFF176',
              border: '3px solid #6B9CFF',
              padding: '10px 15px',
              borderRadius: '20px',
              transform: 'rotate(-10deg)',
              boxShadow: '4px 4px 0 rgba(107, 156, 255, 0.3)',
              animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            NEW PICK! ✨
          </div>

          

          <div
            className="font-pixel text-[#5579C9] inline-block"
            style={{
              fontSize: 'clamp(13px, 3.5vw, 18px)',
              marginBottom: '30px',
              background: 'white',
              padding: '8px 20px',
              border: '2px dashed #8EB3FF',
              borderRadius: '20px',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.05)',
            }}
          >
            {t.tagline}
          </div>

          {/* Search Box */}
          <div
            ref={searchBoxRef}
            className="flex flex-col sm:flex-row relative mx-auto"
            style={{
              background: 'white',
              border: '3px solid #6B9CFF',
              borderRadius: '35px',
              padding: '6px',
              gap: '8px',
              boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05)',
              maxWidth: '500px',
            }}
          >
            <input
              type="text"
              value={query}
              onChange={e => handleInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchBtn()}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder={t.placeholder}
              autoComplete="off"
              className="font-cute font-semibold text-text-dark"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '12px 20px',
                fontSize: '16px',
                background: 'transparent',
              }}
            />
            <button
              onClick={handleSearchBtn}
              className="font-cute font-bold transition-all hover:scale-105 w-full sm:w-auto"
              style={{
                background: '#BEEA9A',
                border: '3px solid #88C949',
                color: '#3D6A12',
                padding: '12px 30px',
                borderRadius: '30px',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.1)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#FFF176';
                (e.currentTarget as HTMLElement).style.borderColor = '#D4C53C';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = '#BEEA9A';
                (e.currentTarget as HTMLElement).style.borderColor = '#88C949';
              }}
            >
              {t.searchBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <div
        className="absolute bottom-0 left-0 w-full flex items-center z-[20] font-pixel text-white"
        style={{
          height: '45px',
          background: 'linear-gradient(to bottom, #BEEA9A, #88C949)',
          borderTop: '3px solid white',
          padding: '0 15px',
          gap: '15px',
          textShadow: '1px 1px 0 #5E8A32',
        }}
      >
        <div
          className="flex items-center gap-2 cursor-pointer font-bold"
          style={{
            background: 'linear-gradient(to bottom, #8EB3FF, #5A8DF3)',
            border: '2px solid white',
            borderRadius: '20px',
            padding: '4px 18px',
            fontSize: '16px',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
          }}
        >
          ★ START
        </div>
        <div
          className="flex items-center gap-2"
          style={{
            background: 'white',
            color: '#6B9CFF',
            padding: '4px 15px',
            borderRadius: '4px',
            border: '2px solid #6B9CFF',
            fontSize: '14px',
            fontWeight: 'bold',
            textShadow: 'none',
            boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.1)',
          }}
        >
          <span>📁</span> jelajah_batam
        </div>
        {clock && (
          <div
            className="ml-auto"
            style={{
              background: '#7DBA3F',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            {clock}
          </div>
        )}
      </div>

      {/* Portal dropdown — rendered to document.body, tidak ter-clip apapun */}
      {dropdown}
    </section>
  );
}
