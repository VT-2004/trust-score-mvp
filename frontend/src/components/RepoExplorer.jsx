import React, { useState } from 'react';
import { FolderGit2, Search, Code, GitCommit, Clock, Users, Calendar } from 'lucide-react';

export default function RepoExplorer({ standaloneRepos = [], assignmentRepos = [] }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'standalone' | 'assignment'
  const [searchQuery, setSearchQuery] = useState('');

  const allRepos = [
    ...standaloneRepos.map(r => ({ ...r, category: 'standalone' })),
    ...assignmentRepos.map(r => ({ ...r, category: 'assignment' }))
  ];

  let filtered = allRepos;
  if (activeTab === 'standalone') {
    filtered = allRepos.filter(r => r.category === 'standalone');
  } else if (activeTab === 'assignment') {
    filtered = allRepos.filter(r => r.category === 'assignment');
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(r => r.repo.toLowerCase().includes(q));
  }

  const getScoreBadge = (score) => {
    let color = 'var(--accent-text)';
    let bg = 'var(--accent-dim)';
    if (score < 45) {
      color = 'var(--danger-text)';
      bg = 'var(--danger-dim)';
    } else if (score < 70) {
      color = 'var(--warn-text)';
      bg = 'var(--warn-dim)';
    }
    return (
      <span style={{
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.78rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        color,
        background: bg
      }}>
        {score}/100
      </span>
    );
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderGit2 size={20} color="#4f46e5" />
          <span>Repository Explorer</span>
        </h3>

        {/* Live Search */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repo..."
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'all' ? '#0f172a' : 'var(--surface-raised)',
            color: activeTab === 'all' ? '#fff' : 'var(--text-muted)',
            border: '1px solid var(--border)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          All Repositories ({allRepos.length})
        </button>
        <button
          onClick={() => setActiveTab('standalone')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'standalone' ? '#0f172a' : 'var(--surface-raised)',
            color: activeTab === 'standalone' ? '#fff' : 'var(--text-muted)',
            border: '1px solid var(--border)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          🚀 Standalone ({standaloneRepos.length})
        </button>
        <button
          onClick={() => setActiveTab('assignment')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'assignment' ? '#0f172a' : 'var(--surface-raised)',
            color: activeTab === 'assignment' ? '#fff' : 'var(--text-muted)',
            border: '1px solid var(--border)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          📋 Coursework/Assignments ({assignmentRepos.length})
        </button>
      </div>

      {/* Repos List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No repositories found matching your filter.
          </div>
        ) : (
          filtered.map((r, i) => (
            <div
              key={i}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                background: 'var(--surface)',
                transition: 'border-color 0.15s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.94rem' }}>
                    {r.repo}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: r.category === 'standalone' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: r.category === 'standalone' ? '#4f46e5' : '#10b981',
                    fontWeight: 600
                  }}>
                    {r.category === 'standalone' ? 'Standalone' : 'Coursework'}
                  </span>
                </div>
                {getScoreBadge(r.overallSignalScore)}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '8px',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                paddingTop: '10px',
                borderTop: '1px solid var(--border)'
              }}>
                <div><strong>Cadence:</strong> {r.signals.commitCadence.note}</div>
                <div><strong>Message Entropy:</strong> {r.signals.commitMessages.note}</div>
                <div><strong>Authorship:</strong> {r.signals.authorConsistency.note}</div>
                <div><strong>Timeline Growth:</strong> {r.signals.timelinePlausibility.note}</div>
                {r.signals.commitRhythm && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Hour Rhythm Pattern:</strong> {r.signals.commitRhythm.note}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
