'use client';

import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className="fixed bottom-6 right-6 z-50 font-pixel flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-95"
      style={{
        width: '48px',
        height: '48px',
        background: 'linear-gradient(to bottom, #8EB3FF, #5A8DF3)',
        border: '3px solid white',
        borderRadius: '8px',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.25)',
        color: 'white',
        fontSize: '18px',
        textShadow: '1px 1px 0 #3461C0',
        cursor: 'pointer',
      }}
    >
      ▲
    </button>
  );
}
