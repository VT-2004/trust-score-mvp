import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSearch from './components/HeroSearch.jsx';
import ReportView from './components/ReportView.jsx';
import RecentFeed from './components/RecentFeed.jsx';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const RENDER_BACKEND = 'https://trust-score-mvp.onrender.com';
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = isLocal
  ? (window.location.port === '3001' ? '' : 'http://localhost:3001')
  : (window.location.hostname.includes('onrender.com') ? '' : RENDER_BACKEND);

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

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
          }
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, []);

  const handleSearch = async (username, forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
      setReportData(null);
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
        if (data.reportId) {
          window.history.pushState({}, '', `${window.location.pathname}?report=${data.reportId}`);
        }
      }
    } catch (err) {
      setErrorMessage(`Request failed: ${err.message}. Backend might be spinning up, please retry.`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar theme={theme} onToggleTheme={toggleTheme} isOnline={isOnline} />

      <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '48px 24px 80px' }}>
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
              Analyzing Candidate Portfolio…
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
              Concurrent repo crawl · commit entropy & rhythm checking · synthesizing report
            </div>
          </div>
        )}

        {reportData && (
          <ReportView
            reportData={reportData}
            onRefresh={() => handleSearch(reportData.username, true)}
            isRefreshing={isRefreshing}
          />
        )}

        <RecentFeed apiBase={API_BASE} />

        <footer style={{
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
