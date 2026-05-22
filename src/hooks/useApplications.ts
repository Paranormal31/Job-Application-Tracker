import { useState, useEffect } from 'react';
import type { Application, ChecklistItem, Resume } from '../types';

const STANDARD_CHECKLIST_TEMPLATES = [
  'Research company culture & recent news',
  'Tailor resume & cover letter for this role',
  'Submit application & save PDF of job description',
  'Connect with hiring manager or team members on LinkedIn',
  'Prepare STAR interview answers & technical review',
  'Send thank-you email within 24 hours of interview',
  'Follow up on application status (after 7-10 days)',
  'Review & negotiate offer details'
];

const DEFAULT_CHECKLIST_TEMPLATES: string[] = [];

export const useApplications = (userId: string | null) => {
  const storageKey = `job-applications-${userId || 'guest'}`;

  const loadApps = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Application[];
        return parsed.map(app => ({
          ...app,
          location: app.location || '',
          salary: app.salary || '',
          jobUrl: app.jobUrl || '',
          checklist: app.checklist || []
        }));
      } catch (e) {
        console.error('Error parsing job applications from localStorage:', e);
      }
    }
    return [];
  };

  const [applications, setApplications] = useState<Application[]>(loadApps);

  useEffect(() => {
    setApplications(loadApps());
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(applications));
  }, [applications, storageKey]);

  const addApplication = (app: Omit<Application, 'id' | 'checklist'>, customChecklist?: string[]) => {
    const checklistItems: ChecklistItem[] = (customChecklist && customChecklist.length > 0)
      ? customChecklist.map(label => ({
          id: crypto.randomUUID(),
          label,
          completed: false
        }))
      : [];

    const newApp: Application = {
      ...app,
      id: crypto.randomUUID(),
      checklist: checklistItems,
    };
    setApplications((prev) => [newApp, ...prev]);
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updates } : app))
    );
  };

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  // Checklist specific actions
  const toggleChecklistItem = (appId: string, itemId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return {
          ...app,
          checklist: app.checklist.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      })
    );
  };

  const addChecklistItem = (appId: string, label: string) => {
    if (!label.trim()) return;
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      label: label.trim(),
      completed: false,
    };
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return {
          ...app,
          checklist: [...app.checklist, newItem],
        };
      })
    );
  };

  const deleteChecklistItem = (appId: string, itemId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return {
          ...app,
          checklist: app.checklist.filter((item) => item.id !== itemId),
        };
      })
    );
  };

  const updateChecklistItem = (appId: string, itemId: string, newLabel: string) => {
    if (!newLabel.trim()) return;
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return {
          ...app,
          checklist: app.checklist.map((item) =>
            item.id === itemId ? { ...item, label: newLabel.trim() } : item
          ),
        };
      })
    );
  };

  // Helper to load rich demonstration data
  const loadDemoData = () => {
    const demoApps: Application[] = [
      {
        id: 'demo-1',
        company: 'Google',
        position: 'Senior Frontend Engineer',
        status: 'Interviewing',
        dateApplied: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days ago
        location: 'Hybrid (Mountain View)',
        salary: '₹185,000 - ₹220,000',
        jobUrl: 'careers.google.com',
        notes: 'Passed the Initial Recruiter Call. First round of coding interview went great. Next is the Systems Design round. Preparing STAR interview answers for behaviorals.',
        checklist: STANDARD_CHECKLIST_TEMPLATES.map((label, idx) => ({
          id: `demo-1-item-${idx}`,
          label,
          completed: idx < 5 // 5 of 8 completed
        }))
      },
      {
        id: 'demo-2',
        company: 'Stripe',
        position: 'Tech Lead - Payments Core',
        status: 'Offered',
        dateApplied: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 25 days ago
        location: 'Remote (US)',
        salary: '₹200,000 - ₹240,000',
        jobUrl: 'stripe.com/jobs',
        notes: 'Got the verbal offer! Need to review equity distribution and negotiate the sign-on bonus. Spoke to team lead, culture seems outstanding.',
        checklist: STANDARD_CHECKLIST_TEMPLATES.map((label, idx) => ({
          id: `demo-2-item-${idx}`,
          label,
          completed: idx < 6 // 6 of 8 completed
        }))
      },
      {
        id: 'demo-3',
        company: 'Airbnb',
        position: 'Staff Product Designer',
        status: 'Applied',
        dateApplied: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days ago
        location: 'Remote (Global)',
        salary: '₹190,000 - ₹215,000',
        jobUrl: 'airbnb.com/careers',
        notes: 'Referred by Michael G. Submitted resume and custom cover letter highlighting mobile experiences. Reached out to the hiring manager on LinkedIn.',
        checklist: STANDARD_CHECKLIST_TEMPLATES.map((label, idx) => ({
          id: `demo-3-item-${idx}`,
          label,
          completed: idx < 3 // 3 of 8 completed
        }))
      },
      {
        id: 'demo-4',
        company: 'Figma',
        position: 'UI & Design Systems Engineer',
        status: 'Wishlist',
        dateApplied: new Date().toISOString().split('T')[0],
        location: 'Hybrid (San Francisco)',
        salary: '₹160,000 - ₹190,000',
        jobUrl: 'figma.com/careers',
        notes: 'Love their product and toolset! Reached out to a designer on LinkedIn to ask about team layout and project scope. Planning to customize resume this weekend.',
        checklist: STANDARD_CHECKLIST_TEMPLATES.map((label, idx) => ({
          id: `demo-4-item-${idx}`,
          label,
          completed: idx < 1 // Only 1 completed (Research)
        }))
      },
      {
        id: 'demo-5',
        company: 'Netflix',
        position: 'Senior UI Developer',
        status: 'Rejected',
        dateApplied: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: 'Hybrid (Los Gatos)',
        salary: '₹230,000 - ₹280,000',
        jobUrl: 'netflix.com/careers',
        notes: 'Completed full screen. They decided to go with another candidate who has deeper experience with custom video streaming pipelines. Recruiter provided nice feedback.',
        checklist: STANDARD_CHECKLIST_TEMPLATES.map((label, idx) => ({
          id: `demo-5-item-${idx}`,
          label,
          completed: idx < 4 // 4 completed before rejection
        }))
      }
    ];

    setApplications(demoApps);
  };

  const clearAll = () => {
    setApplications([]);
  };

  // RESUMES STATE AND ACTIONS
  const resumeStorageKey = `job-resumes-${userId || 'guest'}`;

  const loadResumes = (): Resume[] => {
    const saved = localStorage.getItem(resumeStorageKey);
    if (saved) {
      try {
        return JSON.parse(saved) as Resume[];
      } catch (e) {
        console.error('Error parsing resumes from localStorage:', e);
      }
    }
    return [];
  };

  const [resumes, setResumes] = useState<Resume[]>(loadResumes);

  useEffect(() => {
    setResumes(loadResumes());
  }, [resumeStorageKey]);

  useEffect(() => {
    localStorage.setItem(resumeStorageKey, JSON.stringify(resumes));
  }, [resumes, resumeStorageKey]);

  const addResume = (name: string, size: string, dataUrl: string) => {
    const newResume: Resume = {
      id: crypto.randomUUID(),
      name,
      size,
      uploadedAt: new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      dataUrl
    };
    setResumes((prev) => [newResume, ...prev]);
    return newResume;
  };

  const deleteResume = (id: string) => {
    setResumes((prev) => prev.filter(r => r.id !== id));
    // Safe cascade: De-reference this resume from any linked applications
    setApplications((prev) =>
      prev.map(app => (app.resumeId === id ? { ...app, resumeId: undefined } : app))
    );
  };

  return {
    applications,
    addApplication,
    updateApplication,
    deleteApplication,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    updateChecklistItem,
    DEFAULT_CHECKLIST_TEMPLATES,
    STANDARD_CHECKLIST_TEMPLATES,
    loadDemoData,
    clearAll,
    resumes,
    addResume,
    deleteResume,
  };
};
