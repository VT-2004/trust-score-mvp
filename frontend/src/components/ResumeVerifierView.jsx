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
  Trash2
} from 'lucide-react';
import ScoreRing from './ScoreRing.jsx';

export default function ResumeVerifierView({ apiBase }) {
  const [username, setUsername] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'upload'
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const sampleResumes = {
    fullstack: `SENIOR FULL STACK ENGINEER
Summary:
5+ years of experience building high-throughput web applications and microservices in Go, React, and Python. Specialized in distributed databases, Docker, Kubernetes, and Next.js frontend architectures. Led development of real-time trading dashboards and GraphQL API gateways.

Key Technical Skills:
- Languages: Go, Python, TypeScript, JavaScript
- Frameworks: React, Next.js, Node.js, Express, PyTorch
- Tools: Docker, Kubernetes, PostgreSQL, Redis, AWS, Git`,
    frontend: `FRONTEND ARCHITECT & REACT SPECIALIST
Summary:
4+ years creating accessible design systems, UI component libraries, and performant web apps in React, Tailwind CSS, and TypeScript. Core contributor to open-source UI tooling.

Key Technical Skills:
- Languages: TypeScript, JavaScript, CSS3, HTML5
- Frameworks: React, Next.js, Radix UI, TailwindCSS, Vite
- Tools: Jest, Cypress, Storybook, GitHub Actions`,
    backend: `BACKEND & DISTRIBUTED SYSTEMS ENGINEER
Summary:
6 years developing cloud-native microservices, message queues, and high-concurrency data pipelines using Rust, Python, and Go.

Key Technical Skills:
- Languages: Python, Go, Rust, SQL
- Technologies: Kafka, RabbitMQ, PostgreSQL, Docker, AWS Lambda`
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      if (typeof text === 'string' && text.trim()) {
        setResumeText(text);
      } else {
        setError('Could not extract text from this file. Please paste text directly.');
      }
    };
    reader.onerror = () => {
      setError('Error reading file. Please paste your resume text directly.');
    };

    // For plain text, markdown, json, etc.
    reader.readAsText(file);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!username.trim() || !resumeText.trim()) {
      setError('Please provide both candidate GitHub username and resume text (or uploaded file).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${apiBase}/api/verify-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          resumeText: resumeText.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify resume claims.');
      }
      setResult(data);
    } catch (err) {
      setError(err.message || 'Verification failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const report = result?.report;
  const matchScore = report?.match_score || 75;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      {/* Privacy & Anti-Leakage Shield Notice */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(79, 70, 229, 0.08))',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: '28px',
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
            Zero-Leakage Anti-Leak Privacy Architecture
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
            Resumes are processed purely in ephemeral RAM with automated PII redaction (phones, emails, addresses stripped). <strong>Zero persistent storage</strong> — no candidate resume data is saved to disk or database.
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '28px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={22} color="#4f46e5" />
            <span>Verify Resume Claims Against Real GitHub Footprint</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Upload a resume file or paste skill claims to cross-examine against the candidate's real repositories, languages, and commit history.
          </p>
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

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Candidate Username */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px' }}>
              Candidate GitHub Username
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. gaearon, shadcn, or candidate username"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Input Method Toggle: File Upload vs Paste */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 700 }}>
                Candidate Resume / Claimed Skills
              </label>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: inputMode === 'paste' ? 'var(--surface-raised)' : 'transparent',
                    border: '1px solid var(--border)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: inputMode === 'paste' ? 'var(--text-main)' : 'var(--text-muted)'
                  }}
                >
                  📋 Paste Text
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('upload');
                    fileInputRef.current?.click();
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: inputMode === 'upload' ? 'var(--surface-raised)' : 'transparent',
                    border: '1px solid var(--border)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: inputMode === 'upload' ? 'var(--text-main)' : 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <UploadCloud size={13} />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.pdf,.json,.doc,.docx"
              style={{ display: 'none' }}
            />

            {/* Upload File Banner if file chosen */}
            {selectedFileName && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                marginBottom: '10px',
                fontSize: '0.84rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCheck size={16} color="#10b981" />
                  <span>Selected File: <strong>{selectedFileName}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFileName(null);
                    setResumeText('');
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--danger-text)', cursor: 'pointer', padding: 0 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {/* Quick Sample Selector Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Quick Samples:</span>
              <button
                type="button"
                onClick={() => {
                  setResumeText(sampleResumes.fullstack);
                  setSelectedFileName(null);
                }}
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', cursor: 'pointer' }}
              >
                Full-Stack Engineer
              </button>
              <button
                type="button"
                onClick={() => {
                  setResumeText(sampleResumes.frontend);
                  setSelectedFileName(null);
                }}
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', cursor: 'pointer' }}
              >
                Frontend Architect
              </button>
              <button
                type="button"
                onClick={() => {
                  setResumeText(sampleResumes.backend);
                  setSelectedFileName(null);
                }}
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', cursor: 'pointer' }}
              >
                Backend & Distributed
              </button>
            </div>

            {/* Resume Textarea */}
            <textarea
              value={resumeText}
              onChange={e => {
                setResumeText(e.target.value);
                setSelectedFileName(null);
              }}
              placeholder="Paste candidate resume text, project summaries, or technical skill claims here..."
              rows={6}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.86rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '13px',
              borderRadius: 'var(--radius-md)',
              background: '#0f172a',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.94rem',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            {isLoading ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span>Cross-Examining Claims Against GitHub Footprint…</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Verify Resume vs. GitHub Claims</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Verification Output Dossier */}
      {result && report && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          {/* Header & Score Gauge */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '20px',
            flexWrap: 'wrap',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Resume Verification Audit
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '2px' }}>
                @{result.username}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px', maxWidth: '520px', lineHeight: 1.5 }}>
                {report.summary}
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                Claims Match Fidelity
              </div>
              <ScoreRing score={matchScore} />
            </div>
          </div>

          {/* 2-Column Skills Breakdown: Verified vs Unverified */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* Verified Skills */}
            <div style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.94rem', fontWeight: 700, color: 'var(--accent-text)', marginBottom: '10px' }}>
                <CheckCircle2 size={16} />
                <span>Verified Public Code Evidence</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(report.verified_skills || []).map((skill, i) => (
                  <span key={i} style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-dim)',
                    color: 'var(--accent-text)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)'
                  }}>
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Unverified Claims */}
            <div style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.94rem', fontWeight: 700, color: 'var(--warn-text)', marginBottom: '10px' }}>
                <AlertTriangle size={16} />
                <span>Unconfirmed in Public Repositories</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(report.unverified_skills || []).map((skill, i) => (
                  <span key={i} style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--warn-dim)',
                    color: 'var(--warn-text)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)'
                  }}>
                    • {skill}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '8px' }}>
                May have been used exclusively in private client/company codebases.
              </div>
            </div>
          </div>

          {/* Timeline Consistency */}
          <div style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.94rem', fontWeight: 700, marginBottom: '6px' }}>
              <Calendar size={16} color="#4f46e5" />
              <span>Experience Timeline Consistency</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {report.timeline_consistency || 'Timeline analysis calculated against first commit timestamp.'}
            </p>
          </div>

          {/* Cross-Examination Interview Prompts */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.04), rgba(16, 185, 129, 0.04))',
            border: '1.5px solid rgba(79, 70, 229, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
              <HelpCircle size={18} color="#4f46e5" />
              <span>Targeted Cross-Examination Screening Questions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(report.cross_examination_questions || []).map((q, i) => (
                <div key={i} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.45
                }}>
                  <strong>Q{i + 1}:</strong> "{q}"
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
