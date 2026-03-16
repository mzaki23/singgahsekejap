'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

const FALLBACK_EXAMPLES = [
  'Pantai Nongsa', 'Nagoya Hill', 'Harbour Bay', 'Mie Tarempa',
  'Batam Center', 'Waterfront City', 'Pantai Melur', 'Bengkong',
];

function useTypingPlaceholder(examples: string[]) {
  const [text, setText] = useState('');
  const idxRef = useRef(0);
  const charRef = useRef(0);
  const deletingRef = useRef(false);
  const pauseRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tick = useCallback(() => {
    const list = examples.length > 0 ? examples : FALLBACK_EXAMPLES;
    const current = list[idxRef.current % list.length];

    if (pauseRef.current) {
      pauseRef.current = false;
      timerRef.current = setTimeout(tick, deletingRef.current ? 80 : 1400);
      return;
    }

    if (!deletingRef.current) {
      charRef.current += 1;
      setText(current.slice(0, charRef.current));
      if (charRef.current === current.length) {
        deletingRef.current = true;
        pauseRef.current = true;
        timerRef.current = setTimeout(tick, 1800);
      } else {
        timerRef.current = setTimeout(tick, 90);
      }
    } else {
      charRef.current -= 1;
      setText(current.slice(0, charRef.current));
      if (charRef.current === 0) {
        deletingRef.current = false;
        pauseRef.current = true;
        idxRef.current += 1;
        timerRef.current = setTimeout(tick, 400);
      } else {
        timerRef.current = setTimeout(tick, 50);
      }
    }
  }, [examples]);

  useEffect(() => {
    timerRef.current = setTimeout(tick, 800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [tick]);

  return text;
}

type PlaceItem = {
  name: string;
  category: string;
  icon: string;
  categoryType: string;
  slug: string;
};

export default function JelajahSearchWindow() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [dbPlaces, setDbPlaces] = useState<PlaceItem[]>([]);
  const [suggestions, setSuggestions] = useState<PlaceItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const [exampleNames, setExampleNames] = useState<string[]>([]);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingText = useTypingPlaceholder(exampleNames);

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
        const names = mapped.map((p: PlaceItem) => p.name);
        const shuffled = names.sort(() => Math.random() - 0.5).slice(0, 12);
        setExampleNames(shuffled);
      })
      .catch(() => {});
  }, []);

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
            <div className="font-bold text-text-dark" style={{ fontSize: '15px' }}>Tempat tidak ditemukan</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Coba kata kunci lain</div>
          </div>
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div
      className="px-4 py-8"
      style={{ background: 'linear-gradient(to bottom, #6B9CFF, #4A83F6)', borderBottom: '5px solid #6B9CFF' }}
    >
      {/* OS Window */}
      <div
        className="relative overflow-hidden transition-transform hover:rotate-0"
        style={{
          background: '#E8F1FF',
          border: '4px solid #6B9CFF',
          borderRadius: '12px',
          maxWidth: '600px',
          margin: '0 auto',
          boxShadow: '10px 10px 0 rgba(107,156,255,0.4)',
          transform: 'rotate(-0.5deg)',
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
          <span className="font-pixel text-white" style={{ fontSize: '15px', letterSpacing: '1px', textShadow: '1px 1px 0px #3461C0' }}>
            ★ cari_tempat.exe
          </span>
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
                  fontWeight: 900,
                  boxShadow: 'inset -2px -2px 0px rgba(0,0,0,0.1)',
                }}
              >
                {btn}
              </div>
            ))}
          </div>
        </div>

        {/* Search Content */}
        <div
          className="px-6 py-6"
          style={{ background: 'linear-gradient(to bottom, #ffffff, #E8F1FF)' }}
        >
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
            }}
          >
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={query}
                onChange={e => handleInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchBtn()}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder=""
                autoComplete="off"
                className="font-cute font-semibold text-text-dark w-full"
                style={{
                  border: 'none',
                  outline: 'none',
                  padding: '12px 20px',
                  fontSize: '16px',
                  background: 'transparent',
                }}
              />
              {!query && (
                <div
                  className="absolute left-5 pointer-events-none select-none flex items-center"
                  style={{ fontSize: '16px', color: '#aab4c8', fontFamily: 'inherit' }}
                >
                  <span>{typingText}</span>
                  <span style={{ animation: 'caretBlink 1s step-end infinite', marginLeft: '1px' }}>|</span>
                </div>
              )}
              <style jsx>{`
                @keyframes caretBlink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0; }
                }
              `}</style>
            </div>
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
              CARI
            </button>
          </div>
        </div>
      </div>

      {dropdown}
    </div>
  );
}
