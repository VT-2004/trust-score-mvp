import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Moon,
  Sun,
  User,
  Search,
  History,
  LogOut,
  GitCompare,
  Activity,
  FileText,
  Zap,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ activeTab, onSelectTab, theme, onToggleTheme, isOnline, apiBase }) {
  const { user, openLogin, logout, remainingFreeTests } = useAuth();
  const [rateLimit, setRateLimit] = useState(null);

  useEffect(() => {
    if (apiBase) {
      fetch(`${apiBase}/api/rate-limit`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.remaining === 'number') {
            setRateLimit(data);
          }
        })
        .catch(() => {});
    }
  }, [apiBase, activeTab]);

  const navItems = [
    { id: 'analyzer', label: 'Analyzer', icon: Search },
    { id: 'resume', label: 'Resume Verifier', icon: FileText },
    { id: 'compare', label: 'Compare Repos', icon: GitCompare },
    { id: 'history', label: 'My History', icon: History },
  ];

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
        maxWidth: '1140px',
        margin: '0 auto',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Brand & Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onSelectTab('analyzer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: 'inherit',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5, #10b981)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                Trust<span style={{ color: '#4f46e5' }}>Score</span>
              </span>
              <span style={{
                marginLeft: '6px',
                fontSize: '0.66rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'var(--surface-raised)',
                color: 'var(--text-subtle)',
                border: '1px solid var(--border)',
                textTransform: 'uppercase'
              }}>
                PRO
              </span>
            </div>
          </button>

          {/* Nav Items */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--surface-raised)',
            padding: '3px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
            gap: '2px',
            overflowX: 'auto'
          }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: isActive ? '#0f172a' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={14} color={isActive ? '#38bdf8' : 'currentColor'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Actions: Free Attempts, Live Quota, Theme & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Guest Free Quota Badge */}
          {!user && (
            <button
              onClick={openLogin}
              title="Sign in or register for unlimited tests"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                background: remainingFreeTests > 0
                  ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(16, 185, 129, 0.1))'
                  : 'rgba(239, 68, 68, 0.1)',
                border: remainingFreeTests > 0
                  ? '1px solid rgba(79, 70, 229, 0.25)'
                  : '1px solid rgba(239, 68, 68, 0.3)',
                color: remainingFreeTests > 0 ? '#4f46e5' : 'var(--danger-text)',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Zap size={13} color={remainingFreeTests > 0 ? '#10b981' : '#ef4444'} />
              <span>{remainingFreeTests}/5 Free Tests</span>
            </button>
          )}

          {/* GitHub API Rate-Limit Indicator */}
          {rateLimit && (
            <div
              title={`Live GitHub API limit: ${rateLimit.remaining}/${rateLimit.limit}. Resets at ${new Date(rateLimit.reset * 1000).toLocaleTimeString()}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                fontSize: '0.74rem',
                color: rateLimit.remaining < 200 ? 'var(--warn-text)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}
            >
              <Activity size={12} color={rateLimit.remaining < 200 ? '#f59e0b' : '#10b981'} />
              <span>GH: {rateLimit.remaining.toLocaleString()}</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            style={{
              padding: '7px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--surface-raised)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center'
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* User Auth Info */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                  alt={user.name}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid var(--border)', objectFit: 'cover' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{user.name}</span>
                  <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>Unlimited</span>
                </div>
              </div>

              <button
                onClick={logout}
                style={{
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-raised)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
                title="Log Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={openLogin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-md)',
                background: '#0f172a',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.84rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)'
              }}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
