import React, { useState } from 'react';
import type { ApplicationStatus } from '../types';

interface Props {
  onAdd: (
    app: {
      company: string;
      position: string;
      status: ApplicationStatus;
      dateApplied: string;
      notes: string;
      location: string;
      salary: string;
      jobUrl: string;
    },
    checklistTemplate: string[] | undefined
  ) => void;
  onClose: () => void;
  defaultChecklistTemplates: string[];
}

export const ApplicationForm: React.FC<Props> = ({ onAdd, onClose, defaultChecklistTemplates }) => {
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !position.trim()) return;
    
    onAdd(
      {
        company: company.trim(),
        position: position.trim(),
        status,
        dateApplied,
        notes: notes.trim(),
        location: location.trim(),
        salary: salary.trim(),
        jobUrl: jobUrl.trim(),
      },
      useTemplate ? defaultChecklistTemplates : []
    );
    
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Track New Position</h3>
          <button className="btn-close" onClick={onClose} title="Close form modal">&times;</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="form-company">Company *</label>
              <input
                id="form-company"
                type="text"
                className="form-control"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Stripe"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="form-position">Position/Title *</label>
              <input
                id="form-position"
                type="text"
                className="form-control"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="form-status">Initial Stage</label>
              <select
                id="form-status"
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              >
                <option value="Wishlist">Wishlist / Backlog</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected/Closed</option>
                <option value="Accepted">Accepted / Joined</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="form-date">Date Applied</label>
              <input
                id="form-date"
                type="date"
                className="form-control"
                value={dateApplied}
                onChange={(e) => setDateApplied(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="form-location">Location Mode</label>
              <input
                id="form-location"
                type="text"
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote (US), Hybrid (SF), On-site"
              />
            </div>

            <div className="form-group">
              <label htmlFor="form-salary">Salary Range</label>
              <input
                id="form-salary"
                type="text"
                className="form-control"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. ₹130,000 - ₹160,000"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="form-url">Job Listing URL</label>
            <input
              id="form-url"
              type="text"
              className="form-control"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="e.g. linkedin.com/jobs/view/..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="form-notes">Quick Notes</label>
            <textarea
              id="form-notes"
              className="form-control"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contacts, referral info, special requirements, tech stack details..."
            />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', gap: '0.75rem', alignItems: 'center', margin: '0.25rem 0' }}>
            <button
              type="button"
              className={`checklist-checkbox-btn ${useTemplate ? 'completed' : ''}`}
              onClick={() => setUseTemplate(!useTemplate)}
              id="form-use-template"
            >
              {useTemplate && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
            <label htmlFor="form-use-template" style={{ cursor: 'pointer', userSelect: 'none', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Prepopulate with standard milestones
            </label>
          </div>

          <div className="modal-footer" style={{ padding: '0.75rem 0 0 0', borderTop: 'none' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Track Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
