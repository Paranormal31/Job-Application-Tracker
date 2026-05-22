import React from 'react';
import type { Application } from '../types';

interface Props {
  applications: Application[];
}

export const DashboardStats: React.FC<Props> = ({ applications }) => {
  const total = applications.length;
  
  const interviewing = applications.filter(app => app.status === 'Interviewing').length;
  const offers = applications.filter(app => app.status === 'Offered' || app.status === 'Accepted').length;
  
  // Calculate total checklist progress
  let totalTasks = 0;
  let completedTasks = 0;
  
  applications.forEach(app => {
    if (app.checklist && app.checklist.length > 0) {
      totalTasks += app.checklist.length;
      completedTasks += app.checklist.filter(item => item.completed).length;
    }
  });
  
  const checklistCompletionPct = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  return (
    <div className="stats-grid">
      <div className="stat-card total">
        <div className="stat-icon-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total Applied</span>
        </div>
      </div>

      <div className="stat-card interviewing">
        <div className="stat-icon-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-value">{interviewing}</span>
          <span className="stat-label">Interviews Prep</span>
        </div>
      </div>

      <div className="stat-card offers">
        <div className="stat-icon-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-value">{offers}</span>
          <span className="stat-label">Offers Won</span>
        </div>
      </div>

      <div className="stat-card checklist">
        <div className="stat-icon-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-value">{checklistCompletionPct}%</span>
          <span className="stat-label">Checklist Tasks</span>
        </div>
      </div>
    </div>
  );
};
