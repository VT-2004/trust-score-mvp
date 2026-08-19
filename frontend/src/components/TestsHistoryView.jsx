import React, { useState, useEffect } from 'react';
import { History, Search, ExternalLink, Calendar, ShieldCheck, Filter, ArrowUpRight } from 'lucide-react';

export default function TestsHistoryView({ apiBase, onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiBase}/api/dashboard?limit=100`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReports(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [apiBase]);

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
        fontSize: '0.8rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        color,
        background: bg
      }}>
        {score}/100
      </span>
    );
  };

  let filtered = reports.filter(r => {
    const matchUser = r.username.toLowerCase().includes(search.toLowerCase());
    const score = r.report_json?.rawAnalysis?.standaloneProjects?.consistency?.averageSignalScore || 70;
    if (scoreFilter === 'high') return matchUser && score >= 70;
    if (scoreFilter === 'moderate') return matchUser && score >= 45 && score < 70;
    if (scoreFilter === 'review') return matchUser && score < 45;
    return matchUser;
  });

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={24} color="#4f46e5" />
            <span>Audited Candidates & Test Results</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Browse through completed candidate audits, consistency index scores, and deep breakdowns.
          </p>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search candidate..."
              style={{
                width: '100%',
                padding: '8px 10px 8px 32px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-main)',
                fontSize: '0.86rem',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={scoreFilter}
            onChange={e => setScoreFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              fontSize: '0.86rem',
              outline: 'none'
            }}
          >
            <option value="all">All Scores</option>
            <option value="high">High Consistency (70+)</option>
            <option value="moderate">Moderate (45-69)</option>
            <option value="review">Needs Review (&lt;45)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '48px',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          Loading test records…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '48px',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          No test records matching your query.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map((r, i) => {
            const rj = r.report_json;
            const sp = rj.rawAnalysis?.standaloneProjects;
            const ar = rj.rawAnalysis?.assignmentRepos;
            const score = sp?.consistency ? sp.consistency.averageSignalScore : 70;
            const dateStr = new Date(r.created_at).toLocaleDateString();
            const timeStr = new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={r.id || i}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.05rem' }}>
                      @{r.username}
                    </span>
                    {getScoreBadge(score)}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Audited {dateStr} at {timeStr}
                  </div>

                  <p style={{
                    fontSize: '0.86rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {rj.aiReport?.recommendation || 'Assessment signals generated.'}
                  </p>
                </div>

                <div style={{
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>{sp?.repoCount || 0} Standalone · {ar?.repoCount || 0} Coursework</span>
                  </div>

                  <button
                    onClick={() => onSelectReport({ username: r.username, reportId: r.id, ...r.report_json })}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--surface-raised)',
                      border: '1px solid var(--border)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>View Result</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
