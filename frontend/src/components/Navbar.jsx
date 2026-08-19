import React from 'react';
import { ShieldCheck, Moon, Sun, Activity } from 'lucide-react';

export default function Navbar({ theme, onToggleTheme, isOnline }) {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(12px)',
      backgroundColor: 'var(--surface-glass)',
      borderBottom: '1px solid var(--border)',
      transition: 'all 0.2s ease'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <a href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          color: 'var(--text-main)',
          fontWeight: 800,
          fontSize: '1.2rem',
          letterSpacing: '-0.02em'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            background: 'linear-gradient(135deg, #4f46e5, #10b981)',
            borderRadius: '10px',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
          }}>
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <span>TrustScore <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.92rem' }}>AI</span></span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-muted)'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isOnline ? 'var(--accent)' : 'var(--warn)',
              boxShadow: isOnline ? '0 0 6px var(--accent)' : 'none'
            }} />
            <span>{isOnline ? 'Engine Online' : 'Connecting'}</span>
          </div>

          <button
            onClick={onToggleTheme}
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
