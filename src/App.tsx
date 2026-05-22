import { useState } from 'react';
import { useApplications } from './hooks/useApplications';
import { ApplicationForm } from './components/ApplicationForm';
import { ApplicationList } from './components/ApplicationList';
import { DashboardStats } from './components/DashboardStats';
import { ChecklistPanel } from './components/ChecklistPanel';
import { AuthPage } from './components/AuthPage';
import { ResumeVault } from './components/ResumeVault';
import type { User } from './types';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('careerpath_current_user');
    if (saved) {
      try {
        return JSON.parse(saved) as User;
      } catch (e) {}
    }
    return null;
  });

  const {
    applications,
    addApplication,
    updateApplication,
    deleteApplication,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    updateChecklistItem,
    STANDARD_CHECKLIST_TEMPLATES,
    loadDemoData,
    clearAll,
    resumes,
    addResume,
    deleteResume,
  } = useApplications(currentUser ? currentUser.id : null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('careerpath_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setCurrentUser(null);
      localStorage.removeItem('careerpath_current_user');
      setSelectedAppId(null);
    }
  };

  // Retrieve selected application details dynamically
  const selectedApp = applications.find((app) => app.id === selectedAppId);

  // Handle application delete with a quick browser confirmation
  const handleDeleteApp = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this job application and its checklist?')) {
      deleteApplication(id);
      if (selectedAppId === id) {
        setSelectedAppId(null);
      }
    }
  };

  // Filter and sort applications
  const filteredAndSortedApplications = applications
    .filter((app) => {
      // 1. Search Query Filter (Company or Position)
      const matchesSearch =
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.position.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Status Filter
      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // 3. Sorting logic
      if (sortBy === 'date-desc') {
        return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime();
      }
      if (sortBy === 'company-asc') {
        return a.company.localeCompare(b.company);
      }
      if (sortBy === 'company-desc') {
        return b.company.localeCompare(a.company);
      }
      if (sortBy === 'progress-desc') {
        const aPct = a.checklist.length > 0 ? a.checklist.filter(i => i.completed).length / a.checklist.length : 0;
        const bPct = b.checklist.length > 0 ? b.checklist.filter(i => i.completed).length / b.checklist.length : 0;
        return bPct - aPct;
      }
      return 0;
    });

  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="container">
      {/* HEADER SECTION */}
      <header className="header">
        <div className="header-title-area">
          <h1>
            <svg className="logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Job Application Tracker
          </h1>
          <p>Supercharge your job search with structured career milestones & visual tracking</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="user-profile-chip" title={`Logged in as ${currentUser.email}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>{currentUser.username}</span>
          </div>

          <button className="btn btn-secondary logout-btn" onClick={handleLogout} title="Sign out of your account">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>

          {applications.length > 0 && (
            <button className="btn btn-secondary" onClick={clearAll} style={{ color: '#ef4444' }}>
              Clear All
            </button>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsVaultOpen(true)}
            style={{ 
              borderColor: 'rgba(6, 182, 212, 0.4)', 
              background: 'rgba(6, 182, 212, 0.05)',
              color: '#06b6d4'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(6, 182, 212, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.35rem' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Resume Vault
          </button>

          <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Track Position
          </button>
        </div>
      </header>

      {/* METRICS STATS SECTION */}
      <DashboardStats applications={applications} />

      {/* SEARCH, FILTER & CONTROLS */}
      <div className="controls-bar">
        <div className="search-filter-group">
          <div className="search-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company or position..."
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filter by application status"
          >
            <option value="All">All Stages</option>
            <option value="Wishlist">Wishlist</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
            <option value="Accepted">Accepted</option>
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            title="Sort application list"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="company-asc">Company (A-Z)</option>
            <option value="company-desc">Company (Z-A)</option>
            <option value="progress-desc">Progress (Highest)</option>
          </select>
        </div>

        {applications.length === 0 && (
          <button className="btn btn-secondary demo-data-btn" onClick={loadDemoData}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
            Load Demo Data
          </button>
        )}
      </div>

      {/* DASHBOARD VIEW SECTION */}
      <main className="dashboard-view-container">
        {applications.length === 0 ? (
          <div className="empty-dashboard">
            <div className="empty-dashboard-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>Track Your Career Journey</h3>
            <p>Your dashboard is currently empty. Start tracking your applications to see a visual Kanban layout, customize step-by-step checklists, and track milestones.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={loadDemoData}>
                Explore with Demo Data
              </button>
              <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
                Track First Job
              </button>
            </div>
          </div>
        ) : (
          <ApplicationList
            applications={filteredAndSortedApplications}
            onOpenDetail={(app) => setSelectedAppId(app.id)}
            onDelete={handleDeleteApp}
          />
        )}
      </main>

      {/* ADD APPLICATION MODAL FORM */}
      {isAddOpen && (
        <ApplicationForm
          onAdd={addApplication}
          onClose={() => setIsAddOpen(false)}
          defaultChecklistTemplates={STANDARD_CHECKLIST_TEMPLATES}
        />
      )}

      {/* CHECKLIST & DETAILS EXPANDED MODAL PANEL */}
      {selectedApp && (
        <ChecklistPanel
          application={selectedApp}
          onClose={() => setSelectedAppId(null)}
          onUpdateStatus={(id, status) => updateApplication(id, { status })}
          onUpdateNotes={(id, notes) => updateApplication(id, { notes })}
          onUpdateApplication={(id, updates) => updateApplication(id, updates)}
          onToggleItem={toggleChecklistItem}
          onAddItem={addChecklistItem}
          onDeleteItem={deleteChecklistItem}
          onUpdateItem={updateChecklistItem}
          onDeleteApplication={deleteApplication}
          resumes={resumes}
          onLinkResume={(appId, resumeId) => updateApplication(appId, { resumeId })}
        />
      )}

      {/* RESUME VAULT OVERLAY MODAL */}
      <ResumeVault
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        resumes={resumes}
        onUpload={addResume}
        onDelete={deleteResume}
      />
    </div>
  );
}

export default App;
