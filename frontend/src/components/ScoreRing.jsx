import React from 'react';

export default function ScoreRing({ score = 70, size = 80 }) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;

  let strokeColor = '#10b981';
  let badgeText = 'High Consistency';
  let badgeColor = 'var(--accent-text)';
  let bgTint = 'var(--accent-dim)';

  if (score < 45) {
    strokeColor = '#ef4444';
    badgeText = 'Needs Review';
    badgeColor = 'var(--danger-text)';
    bgTint = 'var(--danger-dim)';
  } else if (score < 70) {
    strokeColor = '#f59e0b';
    badgeText = 'Moderate Consistency';
    badgeColor = 'var(--warn-text)';
    bgTint = 'var(--warn-dim)';
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      background: 'var(--surface-raised)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 18px'
    }}>
      <div>
        <div style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          Authenticity Index
        </div>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: badgeColor, marginTop: '2px' }}>
          {badgeText}
        </div>
      </div>

      <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        <span style={{
          position: 'absolute',
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          fontSize: '1.25rem',
          color: 'var(--text-main)'
        }}>
          {score}
        </span>
      </div>
    </div>
  );
}
