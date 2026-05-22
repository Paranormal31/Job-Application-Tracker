import React from 'react';
import type { Application } from '../types';

interface Props {
  application: Application;
  onClick: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const ApplicationCard: React.FC<Props> = ({ application, onClick, onDelete }) => {
  const completedCount = application.checklist ? application.checklist.filter(item => item.completed).length : 0;
  const totalCount = application.checklist ? application.checklist.length : 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Format date nicely
  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div 
      className={`job-card ${application.status.toLowerCase()}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onClick(); } }}
    >
      <div className="card-header-info">
        <span className="card-company">{application.company}</span>
        <h4 className="card-position" title={application.position}>
          {application.position}
        </h4>
      </div>

      <div className="card-meta">
        <div className="meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Applied: {formatDate(application.dateApplied)}</span>
        </div>

        {application.location && (
          <div className="meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{application.location}</span>
          </div>
        )}

        {application.salary && (
          <div className="meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12"></path>
              <path d="M6 8h12"></path>
              <path d="m6 13 8.5 8"></path>
              <path d="M6 13h3"></path>
              <path d="M9 13c6.667 0 6.667-10 0-10"></path>
            </svg>
            <span>{application.salary}</span>
          </div>
        )}

        {application.jobUrl && (
          <div className="meta-item" onClick={(e) => e.stopPropagation()}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <a href={application.jobUrl.startsWith('http') ? application.jobUrl : `https://${application.jobUrl}`} target="_blank" rel="noopener noreferrer" className="meta-url">
              Job Details
            </a>
          </div>
        )}
      </div>

      <div className="card-progress-section">
        <div className="progress-labels">
          <span className="progress-text">Checklist</span>
          <span className="progress-pct">{completedCount}/{totalCount} ({progressPct}%)</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="card-actions-quick">
        <button 
          className="btn-icon-sm delete" 
          onClick={(e) => onDelete(application.id, e)}
          title="Delete application"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};
