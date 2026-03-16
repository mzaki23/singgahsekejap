'use client';

export default function FooterSocial() {
  return (
    <div className="flex gap-3">
      {['IG', 'TT', 'YT'].map((s) => (
        <a
          key={s}
          href="#"
          className="flex items-center justify-center font-display text-text-dark bg-white"
          style={{
            width: '45px', height: '45px',
            border: '3px solid #2C3E50',
            borderRadius: '12px',
            fontSize: '20px',
            textDecoration: 'none',
            boxShadow: '4px 4px 0px #2C3E50',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#FFB6C1';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px) rotate(5deg)';
            (e.currentTarget as HTMLElement).style.boxShadow = '6px 6px 0px #2C3E50';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'white';
            (e.currentTarget as HTMLElement).style.transform = '';
            (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0px #2C3E50';
          }}
        >
          {s}
        </a>
      ))}
    </div>
  );
}
