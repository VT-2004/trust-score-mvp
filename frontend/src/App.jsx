import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import HeroSearch from './components/HeroSearch.jsx';
import ReportView from './components/ReportView.jsx';
import RecentFeed from './components/RecentFeed.jsx';
import CandidateCompareView from './components/CandidateCompareView.jsx';
import ResumeVerifierView from './components/ResumeVerifierView.jsx';
import TestsHistoryView from './components/TestsHistoryView.jsx';
import AnalyticsDashboard from './components/AnalyticsDashboard.jsx';
import ReviewsView from './components/ReviewsView.jsx';
import AuthModal from './components/AuthModal.jsx';
import ReviewGateModal from './components/ReviewGateModal.jsx';
import { AlertCircle, CheckCircle2, ArrowRight, Sparkles, FileCheck, ShieldCheck } from 'lucide-react';

const RENDER_BACKEND = 'https://trust-score-mvp.onrender.com';
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = isLocal
  ? (window.location.port === '3001' ? '' : 'http://localhost:3001')
  : (window.location.hostname.includes('onrender.com') ? '' : RENDER_BACKEND);

function DashboardContent() {
  const { canPerformTest, requireAuthForLimit, recordTest } = useAuth();
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'result' | 'resume' | 'compare' | 'history'
  const [previousTab, setPreviousTab] = useState('analyzer');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [newlyCompletedUser, setNewlyCompletedUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Check health
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(res => res.json())
      .then(() => setIsOnline(true))
      .catch(() => setIsOnline(false));
  }, []);

  // Check permalink in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get('report');
    if (reportId) {
      setIsLoading(true);
      fetch(`${API_BASE}/api/report/${reportId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.report_json) {
            setReportData({ username: data.username, reportId: data.id, ...data.report_json });
            setActiveTab('result');
          }
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, []);

  const handleSearch = async (username, forceRefresh = false) => {
    if (!username || !username.trim()) return;

    if (!canPerformTest()) {
      requireAuthForLimit('You have used your 5 free analyses. Please create a free account to continue auditing GitHub candidates.');
      return;
    }

    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
      setNewlyCompletedUser(null);
    }
    setErrorMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, forceRefresh })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Analysis failed. Please check the username.');
      } else {
        setReportData(data);
        setNewlyCompletedUser(data.username);
        recordTest(data);
        if (data.reportId) {
          window.history.pushState({}, '', `${window.location.pathname}?report=${data.reportId}`);
        }
      }
    } catch (err) {
      setErrorMessage(`Request failed: ${err.message}. Backend might be waking up, please retry.`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSelectReport = (report) => {
    setReportData(report);
    setPreviousTab(activeTab);
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToResults = () => {
    setPreviousTab('analyzer');
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromResults = () => {
    setActiveTab(previousTab || 'analyzer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="no-print">
        <Navbar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setPreviousTab(activeTab);
            setActiveTab(tab);
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
          isOnline={isOnline}
          apiBase={API_BASE}
        />
      </div>

      <main style={{ flex: 1, maxWidth: '1080px', width: '100%', margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* TAB 1: Analyzer / Landing Page */}
        {activeTab === 'analyzer' && (
          <>
            <HeroSearch onSearch={(user) => handleSearch(user, false)} isLoading={isLoading} />

            {errorMessage && (
              <div style={{
                background: 'var(--danger-dim)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                color: 'var(--danger-text)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Running Crawl Indicator */}
            {isLoading && (
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '48px 24px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  border: '3px solid var(--border)',
                  borderTopColor: '#4f46e5',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '6px' }}>
                  Auditing Candidate Profile…
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
                  Concurrent repo crawl · commit entropy & rhythm analysis · PR collaboration check
                </div>
              </div>
            )}

            {/* Newly Completed Analysis Prompt */}
            {newlyCompletedUser && reportData && !isLoading && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(79, 70, 229, 0.08))',
                border: '1.5px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#10b981',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}>
                    <FileCheck size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                      Analysis Complete for @{newlyCompletedUser}!
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Consistency signals and interview questions are ready for review.
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGoToResults}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 'var(--radius-md)',
                    background: '#0f172a',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.94rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>View Full Analysis Results</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* 1. Private User's Recent Audits */}
            <div className="no-print">
              <RecentFeed onSelectCandidate={(user) => handleSearch(user, false)} />
            </div>

            {/* 2. Platform Analytics Dashboard on Landing Page */}
            <div style={{ marginTop: '48px' }}>
              <AnalyticsDashboard apiBase={API_BASE} />
            </div>

            {/* 3. Community Reviews & Ratings on Landing Page */}
            <div style={{ marginTop: '48px' }}>
              <ReviewsView
                apiBase={API_BASE}
                onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
              />
            </div>
          </>
        )}

        {/* TAB 2: Dedicated Results Page */}
        {activeTab === 'result' && reportData && (
          <ReportView
            reportData={reportData}
            onRefresh={() => handleSearch(reportData.username, true)}
            isRefreshing={isRefreshing}
            apiBase={API_BASE}
            onBack={handleBackFromResults}
            fromTab={previousTab}
          />
        )}

        {/* TAB 3: Resume Verifier Mode */}
        {activeTab === 'resume' && (
          <ResumeVerifierView
            apiBase={API_BASE}
          />
        )}

        {/* TAB 4: Candidate Compare Mode */}
        {activeTab === 'compare' && (
          <CandidateCompareView
            apiBase={API_BASE}
            onSelectReport={handleSelectReport}
          />
        )}

        {/* TAB 5: My Private Tests History */}
        {activeTab === 'history' && (
          <TestsHistoryView
            onSelectCandidate={(user) => {
              handleSearch(user, false);
            }}
            onNavigateToAnalyzer={() => setActiveTab('analyzer')}
          />
        )}

        {/* Feedback Modal */}
        <div className="no-print">
          <ReviewGateModal
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
            onFeedbackSubmitted={() => setIsFeedbackModalOpen(false)}
            candidateUsername={reportData?.username || 'Platform Review'}
            apiBase={API_BASE}
          />

          {/* Authentication Modal */}
          <AuthModal />
        </div>

        <footer className="no-print" style={{
          marginTop: '64px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          textAlign: 'center'
        }}>
          This tool generates <strong>consistency & plausibility signals</strong> from public commit histories, not proof of fraud. Private client work is invisible. Use alongside direct technical discussions with candidates.
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
