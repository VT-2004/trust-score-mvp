import React, { useState, useEffect } from 'react';
import { Bookmark, Star, Trash2, Edit3, ArrowUpRight, Plus, UserCheck, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ShortlistView({ onSelectReport }) {
  const { user } = useAuth();
  const [shortlist, setShortlist] = useState(() => {
    try {
      const saved = localStorage.getItem('trustscore_shortlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [editingId, setEditingId] = useState(null);
  const [editNote, setEditNote] = useState('');

  const saveList = (newList) => {
    setShortlist(newList);
    localStorage.setItem('trustscore_shortlist', JSON.stringify(newList));
  };

  const handleRemove = (id) => {
    const updated = shortlist.filter(item => item.id !== id);
    saveList(updated);
  };

  const handleSaveNote = (id) => {
    const updated = shortlist.map(item => {
      if (item.id === id) {
        return { ...item, recruiterNote: editNote };
      }
      return item;
    });
    saveList(updated);
    setEditingId(null);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
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
            <Bookmark size={24} color="#4f46e5" fill="#4f46e5" />
            <span>Recruiter Candidate Shortlist</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Starred candidate profiles and private recruiter evaluation notes for hiring decisions.
          </p>
        </div>

        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          <strong>{shortlist.length}</strong> shortlisted candidates
        </div>
      </div>

      {shortlist.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Bookmark size={36} color="var(--text-subtle)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            Your Shortlist is Empty
          </h3>
          <p style={{ fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto' }}>
            While viewing any candidate dossier, click the <strong>"Bookmark / Star Candidate"</strong> button to save them here with private recruiter notes.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {shortlist.map((item) => (
            <div
              key={item.id}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem' }}>
                    @{item.username}
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: item.score >= 70 ? 'var(--accent-text)' : 'var(--warn-text)',
                    background: item.score >= 70 ? 'var(--accent-dim)' : 'var(--warn-dim)'
                  }}>
                    {item.score}/100 Score
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Shortlisted on {new Date(item.addedAt).toLocaleDateString()}
                </div>

                {/* Recruiter Note Box */}
                <div style={{
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  fontSize: '0.84rem',
                  color: 'var(--text-main)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Private Recruiter Note
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditNote(item.recruiterNote || '');
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', padding: 0 }}
                    >
                      <Edit3 size={13} />
                    </button>
                  </div>

                  {editingId === item.id ? (
                    <div style={{ marginTop: '6px' }}>
                      <textarea
                        value={editNote}
                        onChange={e => setEditNote(e.target.value)}
                        rows={2}
                        placeholder="Add hiring notes or questions for interview..."
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg)',
                          fontSize: '0.82rem',
                          outline: 'none',
                          color: 'var(--text-main)'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <button
                          onClick={() => handleSaveNote(item.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: '#0f172a',
                            color: '#fff',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Save Note
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            fontSize: '0.76rem',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontStyle: item.recruiterNote ? 'normal' : 'italic', color: item.recruiterNote ? 'inherit' : 'var(--text-muted)' }}>
                      {item.recruiterNote || 'No private notes added yet. Click edit to add hiring thoughts.'}
                    </p>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '12px',
                borderTop: '1px solid var(--border)'
              }}>
                <button
                  onClick={() => handleRemove(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--danger-text)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>

                <button
                  onClick={() => onSelectReport(item.reportData)}
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
                  <span>Open Dossier</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
