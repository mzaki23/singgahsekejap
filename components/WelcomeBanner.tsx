'use client';

import { useState, useEffect } from 'react';
import { X, Star, Sparkles } from 'lucide-react';

export default function WelcomeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('welcome-banner-dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('welcome-banner-dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={dismiss}
    >
      {/* Panel */}
      <div
        className="relative max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'welcomePopIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        {/* Decorative stars outside */}
        <span className="absolute -top-5 -left-4 text-2xl select-none pointer-events-none" style={{ animation: 'floatY2K 2.8s ease-in-out infinite' }}>⭐</span>
        <span className="absolute -top-3 -right-5 text-xl select-none pointer-events-none" style={{ animation: 'floatY2K 2.2s ease-in-out infinite 0.6s' }}>✨</span>
        <span className="absolute -bottom-4 -left-5 text-lg select-none pointer-events-none" style={{ animation: 'floatY2K 3s ease-in-out infinite 1s' }}>🌴</span>
        <span className="absolute -bottom-3 -right-4 text-xl select-none pointer-events-none" style={{ animation: 'floatY2K 2.5s ease-in-out infinite 0.3s' }}>💫</span>

        {/* Main card */}
        <div
          className="relative bg-[#fffbe6] border-[3px] border-gray-900 rounded-2xl overflow-hidden"
          style={{ boxShadow: '6px 6px 0px 0px #1a1a1a' }}
        >
          {/* Top stripe */}
          <div
            className="h-3 w-full"
            style={{
              background: 'repeating-linear-gradient(45deg, #ff6b9d, #ff6b9d 8px, #ffd93d 8px, #ffd93d 16px, #6bcb77 16px, #6bcb77 24px, #4d96ff 24px, #4d96ff 32px)',
            }}
          />

          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-3 w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
            aria-label="Tutup"
          >
            <X size={14} />
          </button>

          {/* Content */}
          <div className="px-6 pt-5 pb-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#ff6b9d] border-2 border-gray-900 rounded-full px-3 py-1 mb-4"
              style={{ boxShadow: '2px 2px 0px #1a1a1a' }}>
              <Star size={11} fill="white" className="text-white" />
              <span className="text-white font-bold text-[11px] tracking-wide uppercase" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                Halo, Selamat Datang!
              </span>
              <Star size={11} fill="white" className="text-white" />
            </div>

            {/* Headline */}
            <p
              className="text-gray-900 text-xl leading-snug mb-4"
              style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700 }}
            >
              Website ini dibuat untuk kamu yang bingung mau kemana saat di Batam 🌴
            </p>

            {/* Divider */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-[2px] bg-gray-200" />
              <Sparkles size={14} className="text-[#ffd93d]" />
              <div className="flex-1 h-[2px] bg-gray-200" />
            </div>

            {/* Body text */}
            <p
              className="text-gray-700 text-sm leading-relaxed mb-5"
              style={{ fontFamily: 'Fredoka, sans-serif' }}
            >
              Databasenya mungkin saja tidak terlalu akurat, jadi aku ingin masukan dari kamu untuk memberikan laporan jika ada informasi yang kurang valid :)
            </p>

            {/* Signature */}
            <div className="flex items-center justify-between">
              <span
                className="text-[#ff6b9d] text-lg"
                style={{ fontFamily: 'Caveat, cursive', fontWeight: 700 }}
              >
                — Zaki
              </span>

              {/* CTA button */}
              <button
                onClick={dismiss}
                className="px-4 py-2 bg-[#ffd93d] border-2 border-gray-900 rounded-xl text-gray-900 text-sm font-bold transition-all hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none"
                style={{ fontFamily: 'Fredoka, sans-serif', boxShadow: '3px 3px 0px #1a1a1a' }}
              >
                Siap, mengerti! ✌️
              </button>
            </div>
          </div>

          {/* Bottom stripe */}
          <div
            className="h-2 w-full"
            style={{
              background: 'repeating-linear-gradient(45deg, #4d96ff, #4d96ff 8px, #ff6b9d 8px, #ff6b9d 16px, #ffd93d 16px, #ffd93d 24px, #6bcb77 24px, #6bcb77 32px)',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes welcomePopIn {
          0% { opacity: 0; transform: scale(0.7) rotate(-4deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
