import React, { useState } from 'react';
import { GitCompare, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Award, Zap, Code, Users } from 'lucide-react';
import ScoreRing from './ScoreRing.jsx';

export default function CandidateCompareView({ apiBase, onSelectReport }) {
  const [userA, setUserA] = useState('');
  const [userB, setUserB] = useState('');
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [errorA, setErrorA] = useState(null);
  const [errorB, setErrorB] = useState(null);

  const fetchCandidate = async (username, isSlotA) => {
    if (!username.trim()) return;
    const cleanUser = username.trim().replace(/^@/, '');
    if (isSlotA) {
      setLoadingA(true);
      setErrorA(null);
    } else {
      setLoadingB(true);
      setErrorB(null);
    }

    try {
      const res = await fetch(`${apiBase}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze');
      }
      if (isSlotA) setDataA(data);
      else setDataB(data);
    } catch (err) {
      if (isSlotA) setErrorA(err.message);
      else setErrorB(err.message);
    } finally {
      if (isSlotA) setLoadingA(false);
      else setLoadingB(false);
    }
  };

  const getScore = (data) => {
    if (!data) return 0;
    const sp = data.rawAnalysis?.standaloneProjects;
    return sp?.consistency?.averageSignalScore || (sp?.repoAnalyses?.[0]?.overallSignalScore) || 70;
  };

  const scoreA = getScore(dataA);
  const scoreB = getScore(dataB);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #4f46e5, #ec4899)',
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          margin: '0 auto 12px',
          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
        }}>
          <GitCompare size={24} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          Candidate Head-to-Head Comparison
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '540px', margin: '6px auto 0' }}>
          Evaluate two candidate GitHub profiles side-by-side to compare code authenticity, standalone projects, and commit entropy.
        </p>
      </div>

      {/* Compare Inputs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Slot A */}
        <div style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.86rem', marginBottom: '8px' }}>
            Candidate A
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={userA}
              onChange={e => setUserA(e.target.value)}
              placeholder="e.g. gaearon"
              onKeyDown={e => e.key === 'Enter' && fetchCandidate(userA, true)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
            <button
              onClick={() => fetchCandidate(userA, true)}
              disabled={loadingA}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                background: '#0f172a',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.84rem',
                border: 'none',
                cursor: loadingA ? 'not-allowed' : 'pointer'
              }}
            >
              {loadingA ? 'Analyzing…' : 'Load A'}
            </button>
          </div>
          {errorA && <div style={{ color: 'var(--danger-text)', fontSize: '0.8rem', marginTop: '8px' }}>{errorA}</div>}
        </div>

        {/* Slot B */}
        <div style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.86rem', marginBottom: '8px' }}>
            Candidate B
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={userB}
              onChange={e => setUserB(e.target.value)}
              placeholder="e.g. shadcn"
              onKeyDown={e => e.key === 'Enter' && fetchCandidate(userB, false)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
            <button
              onClick={() => fetchCandidate(userB, false)}
              disabled={loadingB}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                background: '#0f172a',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.84rem',
                border: 'none',
                cursor: loadingB ? 'not-allowed' : 'pointer'
              }}
            >
              {loadingB ? 'Analyzing…' : 'Load B'}
            </button>
          </div>
          {errorB && <div style={{ color: 'var(--danger-text)', fontSize: '0.8rem', marginTop: '8px' }}>{errorB}</div>}
        </div>
      </div>

      {/* Side-by-Side Assessment Grid */}
      {dataA && dataB && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '24px',
            marginBottom: '24px'
          }}>
            {/* Candidate A Header */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>@{dataA.username}</div>
              <ScoreRing score={scoreA} />
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={() => onSelectReport(dataA)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  View Full Dossier →
                </button>
              </div>
            </div>

            {/* Candidate B Header */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>@{dataB.username}</div>
              <ScoreRing score={scoreB} />
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={() => onSelectReport(dataB)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  View Full Dossier →
                </button>
              </div>
            </div>
          </div>

          {/* Metric Comparison Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Standalone Projects */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: dataA.rawAnalysis.standaloneProjects.repoCount >= dataB.rawAnalysis.standaloneProjects.repoCount ? 'var(--accent-text)' : 'inherit' }}>
                {dataA.rawAnalysis.standaloneProjects.repoCount} Standalone Repos
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, background: 'var(--surface-raised)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                Standalone Repos
              </div>
              <div style={{ textAlign: 'left', fontWeight: 700, fontSize: '1.1rem', color: dataB.rawAnalysis.standaloneProjects.repoCount >= dataA.rawAnalysis.standaloneProjects.repoCount ? 'var(--accent-text)' : 'inherit' }}>
                {dataB.rawAnalysis.standaloneProjects.repoCount} Standalone Repos
              </div>
            </div>

            {/* Coursework Repos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)' }}>
                {dataA.rawAnalysis.assignmentRepos.repoCount} Coursework
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, background: 'var(--surface-raised)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                Coursework
              </div>
              <div style={{ textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>
                {dataB.rawAnalysis.assignmentRepos.repoCount} Coursework
              </div>
            </div>

            {/* Account Age */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right', fontWeight: 600 }}>
                Joined {new Date(dataA.rawAnalysis.profileCreatedAt).getFullYear()}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, background: 'var(--surface-raised)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                Account Age
              </div>
              <div style={{ textAlign: 'left', fontWeight: 600 }}>
                Joined {new Date(dataB.rawAnalysis.profileCreatedAt).getFullYear()}
              </div>
            </div>

            {/* Top Languages */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                {(dataA.rawAnalysis.standaloneProjects.consistency?.languageSpread || []).slice(0, 3).join(', ') || 'N/A'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, background: 'var(--surface-raised)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                Top Stacks
              </div>
              <div style={{ textAlign: 'left', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                {(dataB.rawAnalysis.standaloneProjects.consistency?.languageSpread || []).slice(0, 3).join(', ') || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
