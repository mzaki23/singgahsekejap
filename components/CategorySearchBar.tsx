'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

type SuggestionItem = {
  name: string;
  icon: string;
  slug: string;
};

interface Props {
  category: string;
  initialSearch?: string;
}

export default function CategorySearchBar({ category, initialSearch = '' }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialSearch);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [allPlaces, setAllPlaces] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/places?status=published&category=${category}`)
      .then(r => r.json())
      .then((res: any) => {
        setAllPlaces((res.data ?? []).map((p: any) => ({
          name: p.name,
          icon: p.category_badge?.split(' ')[0] ?? '📍',
          slug: p.slug,
        })));
      })
      .catch(() => {});
  }, [category]);

  useEffect(() => {
    if (!showSuggestions) return;
    function updateRect() {
      if (searchBoxRef.current) setDropdownRect(searchBoxRef.current.getBoundingClientRect());
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
    if (!val.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    timeoutRef.current = setTimeout(() => {
      const q = val.toLowerCase();
      const filtered = allPlaces.filter(p => p.name.toLowerCase().includes(q)).slice(0, 6);
      setSuggestions(filtered);
      if (searchBoxRef.current) setDropdownRect(searchBoxRef.current.getBoundingClientRect());
      setShowSuggestions(true);
    }, 200);
  }

  function doSearch() {
    setShowSuggestions(false);
    if (!query.trim()) {
      router.push(`/${category}`);
      return;
    }
    // Check exact slug match
    const matched = allPlaces.find(p => p.name.toLowerCase() === query.toLowerCase());
    if (matched?.slug) {
      router.push(`/${category}/${matched.slug}`);
    } else {
      router.push(`/${category}?search=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleSuggestionClick(p: SuggestionItem) {
    setShowSuggestions(false);
    router.push(`/${category}/${p.slug}`);
  }

  function handleClear() {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    router.push(`/${category}`);
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
        maxHeight: '280px',
        overflowY: 'auto',
        zIndex: 99999,
      }}
      onMouseDown={e => e.preventDefault()}
    >
      {suggestions.length > 0 ? suggestions.map((p, i) => (
        <div
          key={i}
          className="flex items-center gap-3 cursor-pointer hover:bg-[#E8F1FF] transition-colors"
          style={{ padding: '11px 18px', borderBottom: i < suggestions.length - 1 ? '2px dashed #E8F1FF' : 'none' }}
          onClick={() => handleSuggestionClick(p)}
        >
          <span style={{ fontSize: '18px' }}>{p.icon}</span>
          <span className="font-cute font-semibold text-text-dark" style={{ fontSize: '14px' }}>{p.name}</span>
        </div>
      )) : (
        <div className="flex items-center gap-3" style={{ padding: '11px 18px' }}>
          <span style={{ fontSize: '18px' }}>😅</span>
          <span className="font-cute text-gray-500" style={{ fontSize: '14px' }}>Tidak ditemukan di kategori ini</span>
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div
      className="px-4 py-5"
      style={{ background: 'linear-gradient(to bottom, #6B9CFF, #5A8DF3)', borderBottom: '4px solid #6B9CFF' }}
    >
      {/* OS Window */}
      <div
        style={{
          background: '#E8F1FF',
          border: '4px solid #6B9CFF',
          borderRadius: '12px',
          maxWidth: '600px',
          margin: '0 auto',
          boxShadow: '8px 8px 0 rgba(107,156,255,0.4)',
          transform: 'rotate(-0.4deg)',
          overflow: 'hidden',
        }}
      >
        {/* Title Bar */}
        <div
          className="flex justify-between items-center border-b-4 border-[#6B9CFF]"
          style={{ background: 'linear-gradient(to right, #4A83F6, #6B9CFF)', padding: '7px 14px' }}
        >
          <span className="font-pixel text-white" style={{ fontSize: '13px', letterSpacing: '1px', textShadow: '1px 1px 0px #3461C0' }}>
            🔍 cari_di_{category}.exe
          </span>
          <div className="flex gap-[5px]">
            {['_', '□', '×'].map((btn, i) => (
              <div
                key={i}
                className="flex items-center justify-center font-black"
                style={{
                  width: '20px', height: '20px',
                  background: i === 2 ? '#FFB3D9' : 'white',
                  color: i === 2 ? '#D84A8B' : '#6B9CFF',
                  borderRadius: '3px',
                  border: `2px solid ${i === 2 ? '#D84A8B' : '#6B9CFF'}`,
                  fontSize: '12px',
                  fontWeight: 900,
                }}
              >
                {btn}
              </div>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div
          className="px-5 py-4"
          style={{ background: 'linear-gradient(to bottom, #ffffff, #E8F1FF)' }}
        >
          <div
            ref={searchBoxRef}
            className="flex flex-col sm:flex-row"
            style={{
              background: 'white',
              border: '3px solid #6B9CFF',
              borderRadius: '35px',
              padding: '5px',
              gap: '6px',
              boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05)',
            }}
          >
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={query}
                onChange={e => handleInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder={`Cari di ${category}...`}
                autoComplete="off"
                className="font-cute font-semibold text-text-dark w-full"
                style={{ border: 'none', outline: 'none', padding: '10px 18px', fontSize: '15px', background: 'transparent' }}
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="mr-2 flex-shrink-0 font-bold"
                  style={{ color: '#aab4c8', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
                  title="Hapus pencarian"
                >
                  ×
                </button>
              )}
            </div>
            <button
              onClick={doSearch}
              className="font-cute font-bold transition-all hover:scale-105 w-full sm:w-auto"
              style={{
                background: '#BEEA9A',
                border: '3px solid #88C949',
                color: '#3D6A12',
                padding: '10px 26px',
                borderRadius: '30px',
                fontSize: '15px',
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

          {/* Active search indicator */}
          {initialSearch && (
            <p className="font-pixel text-center mt-3" style={{ fontSize: '11px', color: '#5579C9' }}>
              Menampilkan hasil untuk: <span style={{ background: 'white', border: '1px solid #6B9CFF', borderRadius: '4px', padding: '1px 6px' }}>"{initialSearch}"</span>
            </p>
          )}
        </div>
      </div>

      {dropdown}
    </div>
  );
}
