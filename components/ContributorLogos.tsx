'use client';

const LOGOS = [
  { label: 'LOGO 1', bg: '#FFE66D', rot: '-2deg' },
  { label: 'LOGO 2', bg: '#FFB6C1', rot: '1deg' },
  { label: 'LOGO 3', bg: '#95E1D3', rot: '-1deg' },
  { label: 'LOGO 4', bg: '#4ECDC4', rot: '2deg' },
  { label: 'LOGO 5', bg: '#FFE66D', rot: '-1.5deg' },
];

export default function ContributorLogos() {
  return (
    <div className="flex justify-center items-center flex-wrap gap-4 md:gap-[30px] max-w-[900px] mx-auto">
      {LOGOS.map((c, i) => (
        <div
          key={i}
          className="flex items-center justify-center relative cursor-pointer"
          style={{
            background: c.bg,
            border: '4px solid #2C3E50',
            borderRadius: '15px',
            padding: '15px 20px',
            boxShadow: '4px 4px 0px #2C3E50',
            minWidth: '110px',
            height: '80px',
            transform: `rotate(${c.rot})`,
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) translateY(-8px) scale(1.1)';
            (e.currentTarget as HTMLElement).style.boxShadow = '6px 6px 0px #2C3E50';
            (e.currentTarget as HTMLElement).style.zIndex = '10';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = `rotate(${c.rot})`;
            (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0px #2C3E50';
            (e.currentTarget as HTMLElement).style.zIndex = '1';
          }}
        >
          <div
            className="absolute"
            style={{
              top: '-8px', left: '50%',
              transform: 'translateX(-50%) rotate(3deg)',
              width: '60px', height: '20px',
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          />
          <span className="font-handwritten text-text-dark text-center" style={{ fontSize: '16px', lineHeight: 1.3 }}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
