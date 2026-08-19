import React, { useState } from 'react';
import { HelpCircle, Copy, Check } from 'lucide-react';

export default function InterviewQuestions({ questions = [] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = questions.map((q, idx) => `${idx + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!questions || questions.length === 0) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.04), rgba(16, 185, 129, 0.04))',
      border: '1.5px solid rgba(79, 70, 229, 0.25)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'rgba(79, 70, 229, 0.12)',
            color: '#4f46e5',
            display: 'grid',
            placeItems: 'center'
          }}>
            <HelpCircle size={16} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Tailored Technical Interview Questions</h3>
        </div>

        <button
          onClick={handleCopy}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          <span>{copied ? 'Copied Questions!' : 'Copy for Screening'}</span>
        </button>
      </div>

      <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
        Questions automatically derived from candidate repository patterns to verify architecture ownership:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {questions.map((q, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '0.92rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <span style={{ color: '#4f46e5', fontFamily: 'var(--font-mono)' }}>0{i + 1}.</span>
            <span>"{q}"</span>
          </div>
        ))}
      </div>
    </div>
  );
}
