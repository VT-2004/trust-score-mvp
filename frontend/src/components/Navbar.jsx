import React from 'react';
import { ShieldCheck, Moon, Sun, User, Search, History, BarChart3, Star, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ activeTab, onSelectTab, theme, onToggleTheme, isOnline }) {
  const { user, setIsAuthModalOpen, logout } = useAuth();

  const navItems = [
    { id: 'analyzer', label: 'Analyzer', icon: Search },
    { id: 'history', label: 'Tests History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reviews', label: 'Reviews', icon: Star },
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
        maxWidth: '1080px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            onClick={() => onSelectTab('analyzer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: 'var(--text-main)',
              fontWeight: 800,
              fontSize: '1.2rem',
              letterSpacing: '-0.02em',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
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
          </button>

          {/* Section Navigation Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--surface-raised)' : 'transparent',
                    border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} color={isActive ? '#4f46e5' : 'currentColor'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            fontSize: '0.78rem',
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
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          <button
            onClick={onToggleTheme}
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-full)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User Account / Sign In */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px 4px 6px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                fontSize: '0.82rem',
                fontWeight: 600
              }}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                />
                <span>{user.name.split(' ')[0]}</span>
              </div>
              <button
                onClick={logout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px'
                }}
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                background: '#0f172a',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.82rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <User size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
