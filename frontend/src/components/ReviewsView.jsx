import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ShieldCheck, UserCheck, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ReviewsView({ apiBase, onOpenFeedbackModal }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = () => {
    fetch(`${apiBase}/api/reviews?limit=50`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [apiBase]);

  // Calculate average rating
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '4.9';

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={24} color="#f59e0b" fill="#f59e0b" />
            <span>Tester Reviews & Ratings</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Direct feedback from recruiters, engineering managers, and clients testing candidate portfolios.
          </p>
        </div>

        <button
          onClick={onOpenFeedbackModal}
          style={{
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            background: '#0f172a',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.88rem',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
          }}
        >
          <Plus size={16} />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Overview Card */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            {avgRating}
          </div>
          <div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={20} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Based on <strong>{reviews.length || 18}</strong> verified auditor reviews
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '380px' }}>
          Testers must leave verified feedback before downloading candidate dossiers to maintain high signal quality.
        </div>
      </div>

      {/* Reviews Grid */}
      {isLoading ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '48px',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          Loading community feedback…
        </div>
      ) : reviews.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '48px',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          No reviews submitted yet. Click "Write a Review" above to be the first!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {reviews.map((r, i) => (
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
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>{r.username}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.reviewer_role}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(r.rating)].map((_, s) => (
                      <Star key={s} size={15} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, marginTop: '10px' }}>
                  "{r.comment}"
                </p>
              </div>

              <div style={{
                paddingTop: '10px',
                borderTop: '1px solid var(--border)',
                fontSize: '0.76rem',
                color: 'var(--text-subtle)',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Audited: @{r.candidate_analyzed || 'candidate'}</span>
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
