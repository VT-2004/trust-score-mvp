import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { X, ShieldCheck, User, Mail, Sparkles, Briefcase } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, loginDemo } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Recruiter / Hiring Manager');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      login({
        name: name.trim() || email.split('@')[0],
        email: email.trim(),
        role: role,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email.trim()}`
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(6px)',
      display: 'grid',
      placeItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '440px',
        padding: '28px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }}>
        <button
          onClick={() => setIsAuthModalOpen(false)}
          style={{
            position: 'absolute',
            right: '16px',
            top: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5, #10b981)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
          }}>
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            {isSignUp ? 'Create Auditor Account' : 'Sign in to TrustScore'}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Access saved reports, tests history, and candidate audits
          </p>
        </div>

        {/* Demo Login Shortcut */}
        <button
          type="button"
          onClick={() => loginDemo()}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(16, 185, 129, 0.1))',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            color: '#4f46e5',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '18px',
            transition: 'all 0.15s ease'
          }}
        >
          <Sparkles size={16} color="#10b981" />
          <span>Instant One-Click Demo Login</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--text-subtle)',
          fontSize: '0.78rem',
          margin: '16px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <span style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span>or with email</span>
          <span style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Work Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Your Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            >
              <option value="Recruiter / Hiring Manager">Recruiter / Hiring Manager</option>
              <option value="Engineering Manager">Engineering Manager / CTO</option>
              <option value="Freelance Client">Freelance Client</option>
              <option value="Software Developer">Software Developer (Auditing Self)</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              marginTop: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: '#0f172a',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.92rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer' }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
