export type ApplicationStatus = 'Wishlist' | 'Applied' | 'Interviewing' | 'Offered' | 'Rejected' | 'Accepted';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface Application {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  dateApplied: string;
  notes: string;
  location: string;
  salary: string;
  jobUrl: string;
  checklist: ChecklistItem[];
  resumeId?: string; // Reference to the linked resume from the Vault
}

export interface Resume {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  dataUrl: string; // Base64 data URL for fully persistent storage & download
}

export interface User {
  id: string;
  username: string;
  email: string;
}
