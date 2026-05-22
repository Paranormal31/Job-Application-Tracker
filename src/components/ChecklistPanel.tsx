import React, { useState } from 'react';
import type { Application, ApplicationStatus, ChecklistItem, Resume } from '../types';

interface Props {
  application: Application;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateApplication?: (id: string, updates: Partial<Application>) => void;
  onToggleItem: (appId: string, itemId: string) => void;
  onAddItem: (appId: string, label: string) => void;
  onDeleteItem: (appId: string, itemId: string) => void;
  onUpdateItem: (appId: string, itemId: string, newLabel: string) => void;
  onDeleteApplication?: (id: string) => void;
  resumes?: Resume[];
  onLinkResume?: (id: string, resumeId: string | undefined) => void;
}

export const ChecklistPanel: React.FC<Props> = ({
  application,
  onClose,
  onUpdateStatus,
  onUpdateNotes,
  onUpdateApplication,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onUpdateItem,
  onDeleteApplication,
  resumes = [],
  onLinkResume,
}) => {
  const [newItemLabel, setNewItemLabel] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const [notes, setNotes] = useState(application.notes || '');

  // Edit job info state
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [editCompany, setEditCompany] = useState(application.company);
  const [editPosition, setEditPosition] = useState(application.position);
  const [editLocation, setEditLocation] = useState(application.location || '');
  const [editSalary, setEditSalary] = useState(application.salary || '');
  const [editJobUrl, setEditJobUrl] = useState(application.jobUrl || '');
  const [editDateApplied, setEditDateApplied] = useState(application.dateApplied || '');

  const handleSaveJobEdit = () => {
    if (onUpdateApplication) {
      onUpdateApplication(application.id, {
        company: editCompany.trim() || application.company,
        position: editPosition.trim() || application.position,
        location: editLocation.trim(),
        salary: editSalary.trim(),
        jobUrl: editJobUrl.trim(),
        dateApplied: editDateApplied.trim(),
      });
    }
    setIsEditingJob(false);
  };

  const handleCancelJobEdit = () => {
    setEditCompany(application.company);
    setEditPosition(application.position);
    setEditLocation(application.location || '');
    setEditSalary(application.salary || '');
    setEditJobUrl(application.jobUrl || '');
    setEditDateApplied(application.dateApplied || '');
    setIsEditingJob(false);
  };

  const completedCount = application.checklist ? application.checklist.filter((item) => item.completed).length : 0;
  const totalCount = application.checklist ? application.checklist.length : 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const statuses: ApplicationStatus[] = ['Wishlist', 'Applied', 'Interviewing', 'Offered', 'Rejected', 'Accepted'];

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemLabel.trim()) return;
    onAddItem(application.id, newItemLabel.trim());
    setNewItemLabel('');
  };

  const startEditing = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.label);
  };

  const saveEditing = (itemId: string) => {
    if (!editingItemText.trim()) return;
    onUpdateItem(application.id, itemId, editingItemText.trim());
    setEditingItemId(null);
  };

  const handleNotesBlur = () => {
    if (notes !== application.notes) {
      onUpdateNotes(application.id, notes);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detail-modal-grid" onClick={(e) => e.stopPropagation()}>
        
        {/* SIDEBAR: Job Details & Status Controls */}
        <aside className="detail-info-sidebar">

          {/* Job Header + Edit Toggle */}
          {isEditingJob ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ✏️ Editing Job Info
                </span>
                <button
                  onClick={handleCancelJobEdit}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1, padding: '0.1rem 0.25rem' }}
                  title="Cancel editing"
                >✕</button>
              </div>
              {([
                { label: 'Position', value: editPosition, setter: setEditPosition, placeholder: 'e.g. Frontend Developer Intern' },
                { label: 'Company', value: editCompany, setter: setEditCompany, placeholder: 'e.g. Vercel' },
                { label: 'Location', value: editLocation, setter: setEditLocation, placeholder: 'e.g. Remote / Bangalore' },
                { label: 'Salary', value: editSalary, setter: setEditSalary, placeholder: 'e.g. ₹30,000/month' },
                { label: 'Date Applied', value: editDateApplied, setter: setEditDateApplied, placeholder: 'e.g. May 18' },
                { label: 'Job URL', value: editJobUrl, setter: setEditJobUrl, placeholder: 'https://...' },
              ] as { label: string; value: string; setter: (v: string) => void; placeholder: string }[]).map(({ label, value, setter, placeholder }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(139, 92, 246, 0.35)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      padding: '0.4rem 0.6rem',
                      outline: 'none',
                      width: '100%',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.7)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)'}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  onClick={handleSaveJobEdit}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}
                >
                  Save Changes ✓
                </button>
                <button
                  onClick={handleCancelJobEdit}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <h3 className="detail-job-title">{application.position}</h3>
                  <p className="detail-company">{application.company}</p>
                </div>
                <button
                  onClick={() => setIsEditingJob(true)}
                  title="Edit job details"
                  style={{
                    flexShrink: 0,
                    background: 'rgba(139, 92, 246, 0.08)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#a78bfa',
                    cursor: 'pointer',
                    padding: '0.35rem 0.55rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    marginTop: '0.25rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.18)';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.25)';
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
              </div>

              <div className="detail-sidebar-section">
                <span className="detail-sidebar-label">Current Status</span>
                <div className={`status-badge ${application.status.toLowerCase()}`}>
                  <span className="column-dot"></span>
                  {application.status}
                </div>
                <div className="quick-status-selector">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      className={`quick-status-btn ${application.status === s ? 'active' : ''} ${s.toLowerCase()}`}
                      onClick={() => onUpdateStatus(application.id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {application.location && (
                <div className="detail-sidebar-section">
                  <span className="detail-sidebar-label">Location</span>
                  <span className="detail-sidebar-val">{application.location}</span>
                </div>
              )}

              {application.salary && (
                <div className="detail-sidebar-section">
                  <span className="detail-sidebar-label">Salary Range</span>
                  <span className="detail-sidebar-val">{application.salary}</span>
                </div>
              )}

              {application.dateApplied && (
                <div className="detail-sidebar-section">
                  <span className="detail-sidebar-label">Date Applied</span>
                  <span className="detail-sidebar-val">{application.dateApplied}</span>
                </div>
              )}

              {application.jobUrl && (
                <div className="detail-sidebar-section">
                  <span className="detail-sidebar-label">Job Posting</span>
                  <span className="detail-sidebar-val">
                    <a
                      href={application.jobUrl.startsWith('http') ? application.jobUrl : `https://${application.jobUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="meta-url"
                      style={{ fontSize: '0.9rem' }}
                    >
                      View Job Listing
                    </a>
                  </span>
                </div>
              )}
            </>
          )}

          <div className="detail-sidebar-section">
            <span className="detail-sidebar-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Linked Resume
            </span>
            {resumes && resumes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <select
                  className="filter-select"
                  value={application.resumeId || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (onLinkResume) {
                      onLinkResume(application.id, val ? val : undefined);
                    }
                  }}
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
                  title="Select resume from your Vault"
                >
                  <option value="">-- No Resume Linked --</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {application.resumeId && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      const linked = resumes.find(r => r.id === application.resumeId);
                      if (linked) {
                        const link = document.createElement('a');
                        link.href = linked.dataUrl;
                        link.download = linked.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}
                    style={{
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.75rem',
                      justifyContent: 'center',
                      background: 'rgba(6, 182, 212, 0.05)',
                      borderColor: 'rgba(6, 182, 212, 0.25)',
                      color: '#06b6d4',
                      cursor: 'pointer'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '0.25rem' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Linked File
                  </button>
                )}
              </div>
            ) : (
              <span className="detail-sidebar-val" style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                No resumes in Vault.
              </span>
            )}
          </div>

          <div className="detail-sidebar-section" style={{ flexGrow: 1 }}>
            <span className="detail-sidebar-label">Application Notes</span>
            <textarea
              className="form-control"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Keep track of interview feedback, contacts, requirements..."
              style={{ height: '100%', minHeight: '120px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.25rem', width: '100%' }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
              Close Details
            </button>
            {onDeleteApplication && (
              <button
                className="btn btn-secondary delete-app-btn"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete the job application for ${application.position} at ${application.company}? This cannot be undone.`)) {
                    onDeleteApplication(application.id);
                    onClose();
                  }
                }}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.35rem' }}>
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete Position
              </button>
            )}
          </div>
        </aside>

        {/* MAIN PANEL: Action Checklist */}
        <section className="checklist-pane">
          <div className="checklist-header-area" style={{ borderBottom: 'none', paddingBottom: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)' }}>
              <h2 style={{
                color: 'var(--primary)',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: '700',
                margin: 0
              }}>
                Milestone Checklist
              </h2>
            </div>
            <button className="btn-close" onClick={onClose} title="Close details modal" style={{ marginTop: '-1rem' }}>&times;</button>
          </div>

          <div className="checklist-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1, overflowY: 'auto', marginTop: '1.25rem' }}>
            {/* Checklist Progress Ring/Summary */}
            <div className="checklist-progress-container">
              <div className="checklist-progress-meta">
                <span className="progress-text">Checklist Tasks Completion</span>
                <span className="progress-pct">{completedCount} of {totalCount} completed ({progressPct}%)</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '8px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)',
                  }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="checklist-items-list" style={{ flexGrow: 1 }}>
              {application.checklist && application.checklist.length === 0 ? (
                <p className="no-data" style={{ padding: '1rem', fontStyle: 'italic', fontSize: '0.85rem' }}>
                  No milestones defined. Add a custom step below to get started!
                </p>
              ) : (
                application.checklist?.map((item) => (
                  <div key={item.id} className="checklist-item-row">
                    <button
                      className={`checklist-checkbox-btn ${item.completed ? 'completed' : ''}`}
                      onClick={() => onToggleItem(application.id, item.id)}
                      title={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {item.completed && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </button>

                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        className="checklist-item-edit-input"
                        value={editingItemText}
                        onChange={(e) => setEditingItemText(e.target.value)}
                        onBlur={() => saveEditing(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditing(item.id);
                          if (e.key === 'Escape') setEditingItemId(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`checklist-item-text ${item.completed ? 'completed' : ''}`}
                        onClick={() => onToggleItem(application.id, item.id)}
                        onDoubleClick={() => startEditing(item)}
                        title="Double-click to edit milestone"
                      >
                        {item.label}
                      </span>
                    )}

                    <div className="checklist-item-actions">
                      {editingItemId !== item.id && (
                        <button
                          className="btn-icon-xs"
                          onClick={() => startEditing(item)}
                          title="Edit milestone name"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      )}
                      <button
                        className="btn-icon-xs delete"
                        onClick={() => onDeleteItem(application.id, item.id)}
                        title="Delete milestone"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add custom checklist item Form */}
          <form className="add-checklist-item-form" onSubmit={handleAddItemSubmit} style={{ marginTop: '1rem' }}>
            <input
              type="text"
              className="add-checklist-input"
              value={newItemLabel}
              onChange={(e) => setNewItemLabel(e.target.value)}
              placeholder="Create a custom milestone step (e.g. Schedule call with Sarah)..."
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1rem' }}>
              Add Step
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
