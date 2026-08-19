import React, { useState } from 'react';
import { Search, ArrowRight, Zap, Shield, HelpCircle, Sparkles } from 'lucide-react';

export default function HeroSearch({ onSearch, isLoading }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim());
    }
  };

  const handleQuickPick = (name) => {
    setUsername(name);
    onSearch(name);
  };

  return (
    <section style={{ textAlign: 'center', marginBottom: '44px' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        marginBottom: '18px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <Sparkles size={14} color="#10b981" />
        <span>Authenticity & Consistency Intelligence v2.0</span>
      </div>

      <h1 style={{
        fontSize: 'clamp(2rem, 5vw, 3.2rem)',
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: '-0.03em',
        marginBottom: '16px'
      }}>
        Is this developer's work<br />
        <span style={{
          background: 'linear-gradient(135deg, #0f172a 30%, #4f46e5 70%, #10b981 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          truly authentic?
        </span>
      </h1>

      <p style={{
        fontSize: '1.05rem',
        color: 'var(--text-muted)',
        maxWidth: '620px',
        margin: '0 auto 32px',
        lineHeight: 1.6
      }}>
        Deep-analyze public GitHub commit cadences, hour rhythms, author integrity signatures, and coursework vs. standalone project distributions.
      </p>

      {/* Search Card */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-md)',
        maxWidth: '680px',
        margin: '0 auto 36px',
        textAlign: 'left'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-subtle)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              fontSize: '1.05rem'
            }}>@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="github-username (e.g. torvalds)"
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 16px 14px 38px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                fontWeight: 500,
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            style={{
              padding: '14px 26px',
              borderRadius: 'var(--radius-md)',
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
              opacity: isLoading ? 0.6 : 1,
              transition: 'all 0.15s ease'
            }}
          >
            <span>{isLoading ? 'Analyzing…' : 'Analyze Profile'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '16px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Try sample:</span>
          {['gaearon', 'yyx990803', 'shadcn', 'torvalds'].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handleQuickPick(name)}
              disabled={isLoading}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Triad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        textAlign: 'left'
      }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#4f46e5',
            display: 'grid',
            placeItems: 'center',
            marginBottom: '10px'
          }}>
            <Zap size={18} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>Parallel Deep Crawl</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
            High-speed concurrent analysis across commits, message entropy, and language distributions.
          </div>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            display: 'grid',
            placeItems: 'center',
            marginBottom: '10px'
          }}>
            <Shield size={18} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>5-Signal Heuristics</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
            Evaluates commit cadence, message quality, author signatures, hour rhythms, and timeline growth.
          </div>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#f59e0b',
            display: 'grid',
            placeItems: 'center',
            marginBottom: '10px'
          }}>
            <HelpCircle size={18} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>Interview Prompt Gen</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
            Derives tailored technical screening questions automatically based on identified repository patterns.
          </div>
        </div>
      </div>
    </section>
  );
}
