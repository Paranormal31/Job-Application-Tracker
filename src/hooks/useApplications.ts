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
    clearAll,
    resumes,
    addResume,
    deleteResume,
  };
};
