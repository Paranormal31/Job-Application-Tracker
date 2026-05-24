import React, { useState } from 'react';
import type { Application, ApplicationStatus } from '../types';
import { ApplicationCard } from './ApplicationCard';

interface Props {
  applications: Application[];
  onOpenDetail: (app: Application) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

interface DateGroup {
  dateKey: string;
  formattedDate: string;
  apps: Application[];
}

const getNormalizedDateKey = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {
    // Parsing failed, fallback to original string
  }
  return dateString || 'Unknown Date';
};

const formatDateForHeader = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
      return d.toLocaleDateString(undefined, options);
    }
  } catch {
    // Formatting failed, fallback to original string
  }
  return dateString || 'Unknown Date';
};

const groupApplicationsByDate = (apps: Application[]): DateGroup[] => {
  const groups: Record<string, Application[]> = {};
  
  apps.forEach(app => {
    const key = getNormalizedDateKey(app.dateApplied);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(app);
  });

  const groupList: DateGroup[] = Object.keys(groups).map(key => {
    return {
      dateKey: key,
      formattedDate: formatDateForHeader(key),
      apps: groups[key]
    };
  });

  // Sort groups: newest first, oldest last (meaning oldest is vertically at the bottom)
  groupList.sort((a, b) => {
    const timeA = new Date(a.dateKey).getTime();
    const timeB = new Date(b.dateKey).getTime();
    
    const isInvalidA = isNaN(timeA);
    const isInvalidB = isNaN(timeB);
    
    if (isInvalidA && isInvalidB) return a.dateKey.localeCompare(b.dateKey);
    if (isInvalidA) return 1;
    if (isInvalidB) return -1;
    
    return timeB - timeA;
  });

  return groupList;
};

export const ApplicationList: React.FC<Props> = ({ applications, onOpenDetail, onDelete }) => {
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});
  const [expandedDateGroups, setExpandedDateGroups] = useState<Record<string, boolean>>({});

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

  const toggleDateGroup = (status: string, dateKey: string) => {
    const key = `${status}-${dateKey}`;
    setExpandedDateGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="stages-list">
      {stages.map((stage) => {
        const stageApps = applications.filter((app) => app.status === stage.status);
        const isExpanded = expandedStages[stage.status];
        const dateGroups = groupApplicationsByDate(stageApps);
        
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
                {stageApps.length === 0 ? (
                  <div className="empty-stage-placeholder">
                    <span>No applications in this stage</span>
                  </div>
                ) : (
                  <div className="date-groups-timeline">
                    {dateGroups.map((group) => {
                      const groupKey = `${stage.status}-${group.dateKey}`;
                      const isGroupExpanded = expandedDateGroups[groupKey];
                      
                      return (
                        <div key={group.dateKey} className={`date-group-node ${isGroupExpanded ? 'expanded' : 'collapsed'}`}>
                          <div className="timeline-connector-line"></div>
                          
                          <div 
                            className="date-group-header" 
                            onClick={() => toggleDateGroup(stage.status, group.dateKey)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { toggleDateGroup(stage.status, group.dateKey); } }}
                          >
                            <div className="timeline-marker">
                              <span className="timeline-marker-dot"></span>
                            </div>
                            <div className="date-group-title-wrapper">
                              <svg 
                                className={`date-chevron ${isGroupExpanded ? 'expanded' : ''}`} 
                                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                              >
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                              <span className="date-group-title">{group.formattedDate}</span>
                              <span className="date-group-count">{group.apps.length}</span>
                            </div>
                          </div>
                          
                          {isGroupExpanded && (
                            <div className="date-group-content">
                              <div className="date-group-cards-grid">
                                {group.apps.map((app) => (
                                  <div key={app.id} className="vertical-card-wrapper">
                                    <ApplicationCard
                                      application={app}
                                      onClick={() => onOpenDetail(app)}
                                      onDelete={onDelete}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

