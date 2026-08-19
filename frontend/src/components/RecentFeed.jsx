import React, { useState, useEffect } from 'react';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';
import ReportView from './ReportView.jsx';

export default function RecentFeed({ apiBase }) {
  const [reports, setReports] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiBase}/api/dashboard?limit=25`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReports(data);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [apiBase]);

  const toggleCard = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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
    <section style={{ marginTop: '56px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#4f46e5" />
          <span>Recent Public Analyses</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>
            ({reports.length})
          </span>
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live Feed</span>
      </div>

      {isLoading ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          Loading live feed…
        </div>
      ) : reports.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          No analyses recorded yet. Run your first query above!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {reports.map((r, i) => {
            const rj = r.report_json;
            const sp = rj.rawAnalysis?.standaloneProjects;
            const score = sp?.consistency ? sp.consistency.averageSignalScore : 75;
            const isExpanded = expandedIndex === i;

            return (
              <div
                key={r.id || i}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div
                  onClick={() => toggleCard(i)}
                  style={{
                    padding: '14px 18px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none'
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem' }}>
                      @{r.username}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                      {new Date(r.created_at).toLocaleDateString()} · {new Date(r.created_at).toLocaleTimeString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getScoreBadge(score)}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)' }}>
                    <ReportView reportData={{ username: r.username, reportId: r.id, ...r.report_json }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
