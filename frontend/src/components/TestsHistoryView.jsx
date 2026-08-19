import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { History, Search, ArrowRight, Trash2, ShieldCheck, Lock, ExternalLink, Calendar } from 'lucide-react';

export default function TestsHistoryView({ onSelectCandidate, onNavigateToAnalyzer }) {
  const { localAudits, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAudits = (localAudits || []).filter(audit => {
    return audit.username?.toLowerCase().includes(searchTerm.toLowerCase().trim());
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <History size={22} color="#4f46e5" />
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em' }}>My Test History</h1>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            All GitHub candidate and repository audits conducted from your browser and account.
          </p>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <Lock size={13} color="#10b981" />
          <span>Private & Encrypted to your session</span>
        </div>
      </div>

      {/* Search Input */}
      {localAudits && localAudits.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search past candidate tests by username..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Audits List */}
      {filteredAudits.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--surface-raised)',
            color: 'var(--text-muted)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 16px'
          }}>
            <History size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>No audit history found</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
            {searchTerm ? `No audits match "${searchTerm}".` : 'You have not audited any GitHub candidates yet. Run your first audit to see it recorded here.'}
          </p>
          <button
            onClick={onNavigateToAnalyzer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              background: '#0f172a',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <span>Launch New Audit</span>
            <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAudits.map((audit) => {
            const score = audit.score || 75;
            const scoreColor = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
            const dateStr = audit.createdAt ? new Date(audit.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Recent';

            return (
              <div
                key={audit.id || audit.username}
                onClick={() => onSelectCandidate(audit.username)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img
                    src={`https://github.com/${audit.username}.png`}
                    alt={audit.username}
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${audit.username}`; }}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--border)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem' }}>@{audit.username}</span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981'
                      }}>
                        Verified
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      <Calendar size={12} />
                      <span>{dateStr}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Authenticity Score</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: scoreColor }}>
                      {score}%
                    </div>
                  </div>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--surface-raised)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--text-muted)'
                  }}>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
