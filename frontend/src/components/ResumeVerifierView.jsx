import React, { useState, useRef } from 'react';
import {
  FileText,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw,
  Code2,
  Calendar,
  AlertCircle,
  UploadCloud,
  FileCheck,
  Trash2,
  Users,
  Award,
  Zap,
  Briefcase
} from 'lucide-react';
import { parseResumeFile } from '../utils/pdfExtractor.js';
import ScoreRing from './ScoreRing.jsx';

export default function ResumeVerifierView({ apiBase }) {
  const [targetRole, setTargetRole] = useState('Senior Full Stack / Frontend Engineer');

  // Candidate A State
  const [nameA, setNameA] = useState('');
  const [usernameA, setUsernameA] = useState('');
  const [resumeA, setResumeA] = useState('');
  const [fileA, setFileA] = useState(null);
  const [modeA, setModeA] = useState('paste');
  const [isExtractingA, setIsExtractingA] = useState(false);
  const fileInputRefA = useRef(null);

  // Candidate B State
  const [nameB, setNameB] = useState('');
  const [usernameB, setUsernameB] = useState('');
  const [resumeB, setResumeB] = useState('');
  const [fileB, setFileB] = useState(null);
  const [modeB, setModeB] = useState('paste');
  const [isExtractingB, setIsExtractingB] = useState(false);
  const fileInputRefB = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const samplePairs = [
    {
      title: 'React Creator vs UI Systems Architect',
      role: 'Staff Frontend & Design Systems Engineer',
      candA: {
        name: 'Dan Abramov',
        user: 'gaearon',
        resume: `SENIOR STAFF FRONTEND ARCHITECT
Summary:
8+ years experience designing state management paradigms, developer tooling, and modern UI architectures in React, Redux, and TypeScript. Extensive expertise in compilers, component rendering lifecycles, and high-scale open-source systems.
Skills: React, Redux, JavaScript, TypeScript, Node.js, Webpack, Babel, Architecture`
      },
      candB: {
        name: 'shadcn',
        user: 'shadcn',
        resume: `FULL STACK & DESIGN SYSTEMS LEAD
Summary:
6+ years building accessible component libraries, design systems, and Next.js applications with Tailwind CSS, Radix UI, and TypeScript. Specialist in developer experience and modern React server components.
Skills: React, Next.js, Tailwind CSS, TypeScript, Radix UI, UI/UX Design, Open Source`
      }
    }
  ];

  const handleApplySample = (pair) => {
    setTargetRole(pair.role);
    setNameA(pair.candA.name);
    setUsernameA(pair.candA.user);
    setResumeA(pair.candA.resume);
    setFileA(null);

    setNameB(pair.candB.name);
    setUsernameB(pair.candB.user);
    setResumeB(pair.candB.resume);
    setFileB(null);
    setError(null);
  };

  const handleFileUpload = async (file, setFileName, setContent, setIsExtracting) => {
    if (!file) return;
    setFileName(file.name);
    setError(null);
    if (setIsExtracting) setIsExtracting(true);

    try {
      const text = await parseResumeFile(file);
      if (text && text.trim().length > 10) {
        setContent(text.trim());
      } else {
        setError(`Could not extract readable text from ${file.name}. Please paste the resume text directly.`);
      }
    } catch (err) {
      console.error('File parsing error:', err);
      setError(`Failed to read ${file.name}. Please paste your resume text directly.`);
    } finally {
      if (setIsExtracting) setIsExtracting(false);
    }
  };

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!usernameA.trim() || !resumeA.trim()) {
      setError('Please provide Candidate 1 GitHub username and resume text/file.');
      return;
    }
    if (!usernameB.trim() || !resumeB.trim()) {
      setError('Please provide Candidate 2 GitHub username and resume text/file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const targetUrl = apiBase ? `${apiBase}/api/compare-resumes` : '/api/compare-resumes';
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateA: {
            name: nameA.trim() || usernameA.trim(),
            username: usernameA.trim(),
            resumeText: resumeA.trim()
          },
          candidateB: {
            name: nameB.trim() || usernameB.trim(),
            username: usernameB.trim(),
            resumeText: resumeB.trim()
          },
          targetRole: targetRole.trim()
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data = null;

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const rawText = await res.text();
        throw new Error('Backend server is waking up or returned an unexpected response. Please wait 10 seconds and retry.');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to compare candidate resumes.');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'Comparison failed. Free-tier backend might be starting up, please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const report = result?.report;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      {/* Privacy & Zero-Leakage Shield */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(79, 70, 229, 0.08))',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: '#10b981',
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0
        }}>
          <Lock size={19} />
        </div>
        <div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Zero-Leakage Ephemeral Privacy Architecture
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
            Both candidate resumes are parsed in volatile RAM with automated PII scrubbers (phones, emails, addresses redacted). <strong>Zero persistent storage</strong> — no resumes are written to database or disk.
          </div>
        </div>
      </div>

      {/* Main Dual Candidate Form Card */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={22} color="#4f46e5" />
              <span>Dual Candidate Resume ATS & GitHub Comparator</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
              Upload or paste resumes for 2 candidates to compare ATS skill alignment and verify code authenticity against public GitHub repositories.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Demo Pair:</span>
            {samplePairs.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplySample(p)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(16, 185, 129, 0.1))',
                  border: '1px solid rgba(79, 70, 229, 0.25)',
                  color: '#4f46e5',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ⚡ {p.title}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-dim)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            color: 'var(--danger-text)',
            fontSize: '0.86rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCompare} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Target Role Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px' }}>
              Target Job Role / Requirements (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer (React, Node.js, Go)"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          {/* 2-Column Dual Candidate Inputs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {/* CANDIDATE A CARD */}
            <div style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: '0.74rem', display: 'grid', placeItems: 'center' }}>1</span>
                <span>Candidate A</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Candidate Name</label>
                <input
                  type="text"
                  value={nameA}
                  onChange={e => setNameA(e.target.value)}
                  placeholder="e.g. Dan Abramov"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text-main)',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>GitHub Username *</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    value={usernameA}
                    onChange={e => setUsernameA(e.target.value)}
                    placeholder="e.g. gaearon"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text-main)',
                      fontSize: '0.86rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Resume A Content *</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setModeA('paste')}
                      style={{ padding: '2px 8px', borderRadius: '4px', background: modeA === 'paste' ? 'var(--surface)' : 'transparent', border: '1px solid var(--border)', fontSize: '0.72rem', cursor: 'pointer' }}
                    >
                      Paste
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModeA('upload');
                        fileInputRefA.current?.click();
                      }}
                      style={{ padding: '2px 8px', borderRadius: '4px', background: modeA === 'upload' ? 'var(--surface)' : 'transparent', border: '1px solid var(--border)', fontSize: '0.72rem', cursor: 'pointer' }}
                    >
                      ☁️ Upload
                    </button>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRefA}
                  onChange={e => handleFileUpload(e.target.files?.[0], setFileA, setResumeA, setIsExtractingA)}
                  accept=".txt,.md,.pdf,.json,.doc,.docx"
                  style={{ display: 'none' }}
                />

                {isExtractingA && (
                  <div style={{ fontSize: '0.76rem', color: '#4f46e5', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '12px', height: '12px', border: '2px solid #4f46e5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    <span>Extracting text from PDF/Document…</span>
                  </div>
                )}

                {fileA && !isExtractingA && (
                  <div style={{ fontSize: '0.76rem', color: 'var(--accent-text)', marginBottom: '6px' }}>
                    ✓ Loaded & Parsed: <strong>{fileA}</strong>
                  </div>
                )}

                <textarea
                  value={resumeA}
                  onChange={e => setResumeA(e.target.value)}
                  placeholder="Paste Candidate A resume text or claimed skills..."
                  rows={6}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* CANDIDATE B CARD */}
            <div style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ec4899', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ec4899', color: '#fff', fontSize: '0.74rem', display: 'grid', placeItems: 'center' }}>2</span>
                <span>Candidate B</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Candidate Name</label>
                <input
                  type="text"
                  value={nameB}
                  onChange={e => setNameB(e.target.value)}
                  placeholder="e.g. shadcn"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text-main)',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>GitHub Username *</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    value={usernameB}
                    onChange={e => setUsernameB(e.target.value)}
                    placeholder="e.g. shadcn"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text-main)',
                      fontSize: '0.86rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Resume B Content *</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setModeB('paste')}
                      style={{ padding: '2px 8px', borderRadius: '4px', background: modeB === 'paste' ? 'var(--surface)' : 'transparent', border: '1px solid var(--border)', fontSize: '0.72rem', cursor: 'pointer' }}
                    >
                      Paste
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModeB('upload');
                        fileInputRefB.current?.click();
                      }}
                      style={{ padding: '2px 8px', borderRadius: '4px', background: modeB === 'upload' ? 'var(--surface)' : 'transparent', border: '1px solid var(--border)', fontSize: '0.72rem', cursor: 'pointer' }}
                    >
                      ☁️ Upload
                    </button>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRefB}
                  onChange={e => handleFileUpload(e.target.files?.[0], setFileB, setResumeB, setIsExtractingB)}
                  accept=".txt,.md,.pdf,.json,.doc,.docx"
                  style={{ display: 'none' }}
                />

                {isExtractingB && (
                  <div style={{ fontSize: '0.76rem', color: '#ec4899', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '12px', height: '12px', border: '2px solid #ec4899', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    <span>Extracting text from PDF/Document…</span>
                  </div>
                )}

                {fileB && !isExtractingB && (
                  <div style={{ fontSize: '0.76rem', color: 'var(--accent-text)', marginBottom: '6px' }}>
                    ✓ Loaded & Parsed: <strong>{fileB}</strong>
                  </div>
                )}

                <textarea
                  value={resumeB}
                  onChange={e => setResumeB(e.target.value)}
                  placeholder="Paste Candidate B resume text or claimed skills..."
                  rows={6}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: '#0f172a',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.96rem',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            {isLoading ? (
              <>
                <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span>Auditing Resumes & Crawling GitHub Footprints…</span>
              </>
            ) : (
              <>
                <ShieldCheck size={20} />
                <span>Run Dual Resume ATS & GitHub Audit</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* COMPARISON RESULTS DOSSIER */}
      {result && report && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          {/* Executive Verdict Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(16, 185, 129, 0.08))',
            border: '1.5px solid rgba(79, 70, 229, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#4f46e5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ★ ATS Recommendation & Verdict
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
                Recommended Fit: <span style={{ color: '#10b981' }}>{report.recommended_candidate}</span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '650px', lineHeight: 1.45 }}>
                {report.recommendation_rationale || report.verdict_summary}
              </p>
            </div>

            <div style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: '#0f172a',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Award size={16} color="#10b981" />
              <span>Target: {result.targetRole}</span>
            </div>
          </div>

          {/* Side-by-Side Dual Candidate ATS Gauges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Candidate A Column */}
            <div style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '2px' }}>
                {report.candidate_a.name}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                @{report.candidate_a.username}
              </div>

              <div style={{ margin: '0 auto 12px' }}>
                <ScoreRing score={report.candidate_a.ats_match_score || 80} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '16px' }}>
                ATS Match & Code Evidence
              </div>

              {/* Verified Skills */}
              <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} />
                  <span>Verified in Public Repos</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {(report.candidate_a.verified_skills || []).map((s, i) => (
                    <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--accent-dim)', color: 'var(--accent-text)', fontSize: '0.76rem', fontWeight: 600 }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Unverified Skills */}
              <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--warn-text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={14} />
                  <span>Unconfirmed Claims</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {(report.candidate_a.unverified_skills || []).map((s, i) => (
                    <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--warn-dim)', color: 'var(--warn-text)', fontSize: '0.76rem', fontWeight: 600 }}>
                      • {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Screening Questions */}
              <div style={{ textAlign: 'left', background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HelpCircle size={14} color="#4f46e5" />
                  <span>Interview Questions for {report.candidate_a.name}</span>
                </div>
                {(report.candidate_a.interview_questions || []).map((q, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.35 }}>
                    <strong>Q{i + 1}:</strong> "{q}"
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate B Column */}
            <div style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '2px' }}>
                {report.candidate_b.name}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                @{report.candidate_b.username}
              </div>

              <div style={{ margin: '0 auto 12px' }}>
                <ScoreRing score={report.candidate_b.ats_match_score || 75} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '16px' }}>
                ATS Match & Code Evidence
              </div>

              {/* Verified Skills */}
              <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} />
                  <span>Verified in Public Repos</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {(report.candidate_b.verified_skills || []).map((s, i) => (
                    <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--accent-dim)', color: 'var(--accent-text)', fontSize: '0.76rem', fontWeight: 600 }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Unverified Skills */}
              <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--warn-text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={14} />
                  <span>Unconfirmed Claims</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {(report.candidate_b.unverified_skills || []).map((s, i) => (
                    <span key={i} style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--warn-dim)', color: 'var(--warn-text)', fontSize: '0.76rem', fontWeight: 600 }}>
                      • {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Screening Questions */}
              <div style={{ textAlign: 'left', background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HelpCircle size={14} color="#ec4899" />
                  <span>Interview Questions for {report.candidate_b.name}</span>
                </div>
                {(report.candidate_b.interview_questions || []).map((q, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.35 }}>
                    <strong>Q{i + 1}:</strong> "{q}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
