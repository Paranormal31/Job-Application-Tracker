import React, { useState } from 'react';
import type { Application, ApplicationStatus } from '../types';
import { ApplicationCard } from './ApplicationCard';

interface Props {
  applications: Application[];
  onOpenDetail: (app: Application) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const ApplicationList: React.FC<Props> = ({ applications, onOpenDetail, onDelete }) => {
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  const stages: { status: ApplicationStatus; label: string; class: string }[] = [
    { status: 'Wishlist', label: 'Wishlist', class: 'wishlist' },
    { status: 'Applied', label: 'Applied', class: 'applied' },
    { status: 'Interviewing', label: 'Interviewing', class: 'interviewing' },
    { status: 'Offered', label: 'Offered', class: 'offered' },
    { status: 'Rejected', label: 'Closed / Rejected', class: 'rejected' },
    { status: 'Accepted', label: 'Accepted', class: 'accepted' },
  ];

  const toggleStage = (status: string) => {
    setExpandedStages(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  return (
    <div className="stages-list">
      {stages.map((stage) => {
        const stageApps = applications.filter((app) => app.status === stage.status);
        const isExpanded = expandedStages[stage.status];
        
        return (
          <div key={stage.status} className={`stage-section ${stage.class} ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="stage-header" onClick={() => toggleStage(stage.status)} role="button">
              <div className="stage-title-wrapper">
                <svg 
                  className={`stage-chevron ${isExpanded ? 'expanded' : ''}`} 
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                <span className="stage-dot"></span>
                <h3 className="stage-title">{stage.label}</h3>
                <span className="stage-count">{stageApps.length}</span>
              </div>
            </div>

            {isExpanded && (
              <div className="stage-content">
                <div className="horizontal-cards-scroll">
                  {stageApps.length === 0 ? (
                    <div className="empty-stage-placeholder">
                      <span>No applications in this stage</span>
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <div key={app.id} className="horizontal-card-wrapper">
                        <ApplicationCard
                          application={app}
                          onClick={() => onOpenDetail(app)}
                          onDelete={onDelete}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
