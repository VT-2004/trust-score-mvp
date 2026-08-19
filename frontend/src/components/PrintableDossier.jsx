import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, HelpCircle, Star, Calendar, Code, GitCommit } from 'lucide-react';

export default function PrintableDossier({ reportData }) {
  if (!reportData) return null;

  const { username, aiReport, rawAnalysis, reportId, generatedAt } = reportData;
  const sp = rawAnalysis?.standaloneProjects || { repoAnalyses: [], repoCount: 0 };
  const ar = rawAnalysis?.assignmentRepos || { repoAnalyses: [], repoCount: 0 };
  const standaloneScore = sp.consistency ? sp.consistency.averageSignalScore : (sp.repoAnalyses.length ? sp.repoAnalyses[0].overallSignalScore : 70);
  const overallScore = standaloneScore || 70;
  const auditDate = generatedAt ? new Date(generatedAt).toLocaleDateString() : new Date().toLocaleDateString();

  const allRepos = [
    ...(sp.repoAnalyses || []).map(r => ({ ...r, type: 'Standalone' })),
    ...(ar.repoAnalyses || []).map(r => ({ ...r, type: 'Coursework' }))
  ].slice(0, 8); // Top 8 repositories for concise 2-page fit

  return (
    <div className="printable-dossier" style={{ display: 'none' }}>
      {/* PAGE 1: Executive Overview & Heuristic Signals */}
      <div className="dossier-page" style={{ padding: '16px 20px', background: '#fff', color: '#0f172a', fontFamily: 'var(--font-sans)' }}>
        {/* Letterhead */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#0f172a', borderRadius: '8px', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
              T
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em' }}>TrustScore AI</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>GitHub Authenticity & Plausibility Dossier</div>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#64748b' }}>
            <div>Audit Date: <strong>{auditDate}</strong></div>
            <div>Dossier ID: <strong>#{reportId || 'LIVE-AUDIT'}</strong></div>
          </div>
        </div>

        {/* Candidate Profile & Score Card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Audited Candidate</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>@{username}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              <span>{rawAnalysis?.totalNonForkRepos || 0} Repositories</span> · <span>{sp.repoCount || 0} Standalone Projects</span> · <span>{ar.repoCount || 0} Coursework/Assignments</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', background: '#fff', border: '1.5px solid #0f172a', borderRadius: '8px', padding: '10px 18px' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Authenticity Score</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: overallScore >= 70 ? '#047857' : (overallScore >= 45 ? '#b45309' : '#b91c1c') }}>
              {overallScore}<span style={{ fontSize: '0.9rem', color: '#64748b' }}>/100</span>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: overallScore >= 70 ? '#047857' : '#b45309' }}>
              {overallScore >= 70 ? 'High Consistency' : (overallScore >= 45 ? 'Moderate' : 'Needs Review')}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}>
            1. Executive Assessment
          </div>
          <p style={{ fontSize: '0.86rem', lineHeight: 1.55, color: '#334155', marginBottom: '8px' }}>
            <strong>Standalone Projects:</strong> {aiReport?.standalone_summary || 'Analyzed candidate standalone portfolio.'}
          </p>
          <p style={{ fontSize: '0.86rem', lineHeight: 1.55, color: '#334155' }}>
            <strong>Coursework Patterns:</strong> {aiReport?.assignment_summary || 'Normative coursework structures identified.'}
          </p>
        </div>

        {/* 2-Column Positive Signals vs Discussion Flags */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', background: '#f0fdf4' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#047857', marginBottom: '6px' }}>
              ✓ Verified Positive Signals
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.78rem', color: '#166534', lineHeight: 1.45 }}>
              {(aiReport?.positive_signals || []).map((s, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>• {s}</li>
              ))}
            </ul>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', background: '#fffbeb' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', marginBottom: '6px' }}>
              • Review Points & Flags
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.78rem', color: '#92400e', lineHeight: 1.45 }}>
              {(aiReport?.worth_reviewing || []).map((s, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>• {s}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Screening Interview Prompts */}
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px 16px', background: '#f8fafc', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            2. Tailored Technical Screening Questions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(aiReport?.interview_questions || []).slice(0, 3).map((q, i) => (
              <div key={i} style={{ fontSize: '0.8rem', color: '#1e293b', lineHeight: 1.4 }}>
                <strong>Q{i + 1}:</strong> "{q}"
              </div>
            ))}
          </div>
        </div>

        {/* Official Recommendation */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Hiring Recommendation</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
            {aiReport?.recommendation || 'Standard technical evaluation recommended.'}
          </div>
        </div>
      </div>

      {/* PAGE BREAK FOR 2-PAGE DOSSIER */}
      <div className="page-break" style={{ pageBreakBefore: 'always', height: '1px' }}></div>

      {/* PAGE 2: Repository Signals Breakdown & Verification Seal */}
      <div className="dossier-page" style={{ padding: '16px 20px', background: '#fff', color: '#0f172a', fontFamily: 'var(--font-sans)' }}>
        {/* Page 2 Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
            TrustScore AI Dossier: @{username} — Repository Audit Matrix
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Page 2 of 2</div>
        </div>

        {/* Repository Table */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a', marginBottom: '10px' }}>
            3. Key Repository Signals Matrix
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', color: '#0f172a' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', fontWeight: 700 }}>Repository</th>
                <th style={{ padding: '8px 6px', fontWeight: 700 }}>Type</th>
                <th style={{ padding: '8px 6px', fontWeight: 700 }}>Cadence</th>
                <th style={{ padding: '8px 6px', fontWeight: 700 }}>Authors</th>
                <th style={{ padding: '8px 6px', fontWeight: 700 }}>Entropy</th>
                <th style={{ padding: '8px 6px', fontWeight: 700 }}>Growth</th>
                <th style={{ padding: '8px 8px', fontWeight: 700, textAlign: 'right' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {allRepos.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.repo}</td>
                  <td style={{ padding: '8px 6px', color: '#64748b' }}>{r.type}</td>
                  <td style={{ padding: '8px 6px' }}>{r.signals.commitCadence.score}/100</td>
                  <td style={{ padding: '8px 6px' }}>{r.signals.authorConsistency.uniqueAuthorCount || 1} Auth</td>
                  <td style={{ padding: '8px 6px' }}>{r.signals.commitMessages.score}/100</td>
                  <td style={{ padding: '8px 6px' }}>{r.signals.timelinePlausibility.score}/100</td>
                  <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: r.overallSignalScore >= 70 ? '#047857' : '#b45309' }}>
                    {r.overallSignalScore}/100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Methodology Notes */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>
            4. Methodology & Plausibility Heuristics
          </div>
          <p style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45 }}>
            • <strong>Commit Cadence:</strong> Measures organic iteration across days vs instant bulk uploads.<br />
            • <strong>Message Quality:</strong> Evaluates commit message variance to detect generic placeholders.<br />
            • <strong>Author Signatures:</strong> Checks single vs team identities to verify solo ownership.<br />
            • <strong>Hour Rhythm:</strong> Evaluates UTC commit hours to differentiate human work from automated bots.
          </p>
        </div>

        {/* Seal & Disclaimer */}
        <div style={{ borderTop: '2px solid #0f172a', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', maxWidth: '420px', lineHeight: 1.4 }}>
            <strong>DISCLAIMER:</strong> This report represents automated statistical consistency heuristics from public commit metadata only. Private client work is invisible. Always use alongside direct technical screening.
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>TrustScore AI Verification Seal</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Verified Digital Dossier · trust-score-mvp.vercel.app</div>
          </div>
        </div>
      </div>
    </div>
  );
}
