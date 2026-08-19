import React, { useState } from 'react';
import { Star, X, Download, MessageSquare, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ReviewGateModal({ isOpen, onClose, onFeedbackSubmitted, candidateUsername, apiBase }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerRole, setReviewerRole] = useState(user?.role || 'Hiring Client');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a brief sentence of feedback to unlock your download.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await fetch(`${apiBase}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user?.name || 'Verified Tester',
          rating: Number(rating),
          reviewerRole,
          comment: comment.trim(),
          candidateAnalyzed: candidateUsername || 'General'
        })
      });
      setIsSubmitting(false);
      onFeedbackSubmitted();
    } catch (err) {
      // Even if network fails, let tester download
      setIsSubmitting(false);
      onFeedbackSubmitted();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'grid',
      placeItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '480px',
        padding: '30px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '16px',
            top: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
          }}>
            <Download size={24} />
          </div>
          <h2 style={{ fontSize: '1.28rem', fontWeight: 800 }}>
            Tester Feedback & Rating
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Please leave a quick rating & review for <strong>TrustScore AI</strong> to unlock your full downloadable report for <strong>@{candidateUsername}</strong>.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-dim)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            color: 'var(--danger-text)',
            fontSize: '0.84rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Star Rating */}
          <div style={{ textAlign: 'center' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '8px' }}>
              How accurate & useful was this audit?
            </label>
            <div style={{ display: 'inline-flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <Star
                    size={30}
                    fill={(hoverRating || rating) >= star ? '#f59e0b' : 'transparent'}
                    color={(hoverRating || rating) >= star ? '#f59e0b' : 'var(--border-hover)'}
                  />
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
              {rating === 5 ? '⭐⭐⭐⭐⭐ Exceptional insights' : (rating >= 4 ? '⭐⭐⭐⭐ Very helpful' : '⭐⭐⭐ Fair')}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Your Role / Evaluation Perspective
            </label>
            <select
              value={reviewerRole}
              onChange={e => setReviewerRole(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            >
              <option value="Hiring Client">Hiring Client / Freelance Client</option>
              <option value="Engineering Recruiter">Engineering Recruiter</option>
              <option value="CTO / Tech Lead">CTO / Tech Lead</option>
              <option value="Developer Self-Audit">Developer (Self-Audit)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Tester Review & Comments <span style={{ color: 'var(--danger-text)' }}>*</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="What signals were most useful? (e.g. 'The commit hour breakdown and tailored interview questions helped us evaluate ownership accurately.')"
              required
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-main)',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '13px',
              borderRadius: 'var(--radius-md)',
              background: '#0f172a',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.94rem',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
            }}
          >
            <Download size={17} />
            <span>{isSubmitting ? 'Submitting Review…' : 'Submit Review & Download Report'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
