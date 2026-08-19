import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Clock, ShieldCheck, ArrowRight, Lock, Trash2 } from 'lucide-react';

export default function RecentFeed({ onSelectCandidate }) {
  const { localAudits, user } = useAuth();

  if (!localAudits || localAudits.length === 0) {
    return (
      <div style={{
        marginTop: '28px',
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
          <Lock size={14} color="#10b981" />
          <span>Privacy Guaranteed: Your audit history is 100% private to your browser session & account.</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '36px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="#4f46e5" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Your Recent Analyses</h3>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)'
          }}>
            {localAudits.length} Private {localAudits.length === 1 ? 'Audit' : 'Audits'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          <Lock size={12} color="#10b981" />
          <span>Only visible to you</span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '12px'
      }}>
        {localAudits.slice(0, 6).map((item) => {
          const score = item.score || 75;
          const scoreColor = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
          const formattedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently';

          return (
            <div
              key={item.id || item.username}
              onClick={() => onSelectCandidate(item.username)}
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={`https://github.com/${item.username}.png`}
                  alt={item.username}
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${item.username}`; }}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>@{item.username}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formattedDate}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  color: scoreColor,
                  background: 'var(--bg)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)'
                }}>
                  {score}%
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
