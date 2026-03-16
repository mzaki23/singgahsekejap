'use client';

import { useState, useEffect } from 'react';
import { X, Star, Sparkles } from 'lucide-react';

export default function WelcomeBanner() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('welcome-banner-dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setClosing(true);
    setTimeout(() => {
      sessionStorage.setItem('welcome-banner-dismissed', '1');
      setVisible(false);
      setClosing(false);
    }, 350);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0,0,0,0.55)',
        animation: closing ? 'backdropOut 0.35s ease forwards' : 'backdropIn 0.3s ease forwards',
      }}
      onClick={dismiss}
    >
      {/* Panel */}
      <div
        className="relative max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: closing
            ? 'popOut 0.35s cubic-bezier(0.36, 0, 0.66, -0.56) forwards'
            : 'welcomePopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        {/* Decorative emojis */}
        <span className="absolute -top-6 -left-5 text-2xl select-none pointer-events-none" style={{ animation: 'floatA 2.8s ease-in-out infinite' }}>⭐</span>
        <span className="absolute -top-4 -right-6 text-xl select-none pointer-events-none" style={{ animation: 'floatB 2.2s ease-in-out infinite' }}>✨</span>
        <span className="absolute -bottom-5 -left-6 text-lg select-none pointer-events-none" style={{ animation: 'floatA 3s ease-in-out infinite 0.8s' }}>🌴</span>
        <span className="absolute -bottom-4 -right-5 text-xl select-none pointer-events-none" style={{ animation: 'floatB 2.5s ease-in-out infinite 0.4s' }}>💫</span>

        {/* Main card */}
        <div
          className="relative bg-[#fffbe6] border-[3px] border-gray-900 rounded-2xl overflow-hidden"
          style={{ boxShadow: '6px 6px 0px 0px #1a1a1a' }}
        >
          {/* Top stripe — animated scroll */}
          <div
            className="h-3 w-full overflow-hidden"
          >
            <div style={{
              height: '100%',
              width: '200%',
              background: 'repeating-linear-gradient(45deg, #4d96ff, #4d96ff 8px, #1e6fd9 8px, #1e6fd9 16px, #7eb8ff 16px, #7eb8ff 24px, #2563eb 24px, #2563eb 32px)',
              animation: 'stripeScroll 1.2s linear infinite',
            }} />
          </div>

          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-3 w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
            style={{ animation: 'spinIn 0.5s 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
            aria-label="Tutup"
          >
            <X size={14} />
          </button>

          {/* Content */}
          <div className="px-6 pt-5 pb-6">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-1.5 bg-[#2563eb] border-2 border-gray-900 rounded-full px-3 py-1 mb-4"
              style={{
                boxShadow: '2px 2px 0px #1a1a1a',
                animation: 'slideDown 0.4s 0.2s ease both',
              }}
            >
              <Star size={11} fill="white" className="text-white" style={{ animation: 'spinStar 3s linear infinite' }} />
              <span className="text-white font-bold text-[11px] tracking-wide uppercase" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                Halo, Selamat Datang!
              </span>
              <Star size={11} fill="white" className="text-white" style={{ animation: 'spinStar 3s linear infinite reverse' }} />
            </div>

            {/* Headline */}
            <p
              className="text-gray-900 text-xl leading-snug mb-4"
              style={{
                fontFamily: 'Fredoka, sans-serif',
                fontWeight: 700,
                animation: 'slideUp 0.4s 0.3s ease both',
              }}
            >
              Website ini dibuat untuk kamu yang bingung mau kemana saat di Batam 🌴
            </p>

            {/* Divider */}
            <div
              className="flex items-center gap-2 mb-4"
              style={{ animation: 'slideUp 0.4s 0.38s ease both' }}
            >
              <div className="flex-1 h-[2px] bg-gray-200" />
              <Sparkles size={14} className="text-[#ffd93d]" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div className="flex-1 h-[2px] bg-gray-200" />
            </div>

            {/* Body text */}
            <p
              className="text-gray-700 text-sm leading-relaxed mb-5"
              style={{
                fontFamily: 'Fredoka, sans-serif',
                animation: 'slideUp 0.4s 0.46s ease both',
              }}
            >
              Databasenya mungkin saja tidak terlalu akurat, jadi aku ingin masukan dari kamu untuk memberikan laporan jika ada informasi yang kurang valid :)
            </p>

            {/* Signature + CTA */}
            <div
              className="flex items-center justify-between"
              style={{ animation: 'slideUp 0.4s 0.54s ease both' }}
            >
              <span
                className="text-[#2563eb] text-lg"
                style={{ fontFamily: 'Caveat, cursive', fontWeight: 700 }}
              >
                —{' '}
                <a
                  href="https://www.instagram.com/mzakii__/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#1e6fd9] transition-colors"
                >
                  Zaki
                </a>
              </span>

              <button
                onClick={dismiss}
                className="px-4 py-2 bg-[#ffd93d] border-2 border-gray-900 rounded-xl text-gray-900 text-sm font-bold transition-all hover:scale-105 hover:-translate-y-0.5 active:scale-95 active:shadow-none"
                style={{ fontFamily: 'Fredoka, sans-serif', boxShadow: '3px 3px 0px #1a1a1a' }}
              >
                Siap, mengerti! ✌️
              </button>
            </div>
          </div>

          {/* Bottom stripe — animated scroll opposite direction */}
          <div className="h-2 w-full overflow-hidden">
            <div style={{
              height: '100%',
              width: '200%',
              background: 'repeating-linear-gradient(45deg, #2563eb, #2563eb 8px, #4d96ff 8px, #4d96ff 16px, #1e6fd9 16px, #1e6fd9 24px, #7eb8ff 24px, #7eb8ff 32px)',
              animation: 'stripeScroll 1.2s linear infinite reverse',
            }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes backdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes backdropOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes welcomePopIn {
          0%   { opacity: 0; transform: scale(0.6) rotate(-6deg) translateY(40px); }
          70%  { transform: scale(1.04) rotate(1deg) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) rotate(0deg) translateY(0); }
        }
        @keyframes popOut {
          0%   { opacity: 1; transform: scale(1) rotate(0deg); }
          100% { opacity: 0; transform: scale(0.7) rotate(6deg) translateY(30px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinIn {
          from { opacity: 0; transform: scale(0) rotate(-180deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes spinStar {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50%       { transform: translateY(-10px) rotate(8deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(5deg) scale(1); }
          50%       { transform: translateY(-12px) rotate(-8deg) scale(1.15); }
        }
        @keyframes stripeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
