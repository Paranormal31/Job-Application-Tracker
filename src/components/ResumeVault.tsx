import React, { useState, useRef } from 'react';
import type { Resume } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resumes: Resume[];
  onUpload: (name: string, size: string, dataUrl: string) => void;
  onDelete: (id: string) => void;
}

export const ResumeVault: React.FC<Props> = ({
  isOpen,
  onClose,
  resumes,
  onUpload,
  onDelete,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Format bytes nicely
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleFile = (file: File) => {
    setErrorMsg(null);
    
    // Safety check: Limit file size to 10MB to prevent localStorage overflow
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('⚠️ File size exceeds the 10MB limit for secure browser storage.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        const sizeFormatted = formatBytes(file.size);
        onUpload(file.name, sizeFormatted, e.target.result);
      } else {
        setErrorMsg('⚠️ Error reading resume file. Please try another file.');
      }
    };
    reader.onerror = () => {
      setErrorMsg('⚠️ Error reading resume file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = (resume: Resume) => {
    const link = document.createElement('a');
    link.href = resume.dataUrl;
    link.download = resume.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '650px',
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          padding: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📁 Personal Resume Vault
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              Upload and manage multiple resumes. Link specific profiles directly to your job applications.
            </p>
          </div>
          <button 
            onClick={onClose} 
            title="Close Vault"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          style={{
            border: dragActive ? '2px dashed var(--primary)' : '2px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-md)',
            background: dragActive ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.01)',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept=".pdf,.docx,.doc,.txt,.rtf"
            style={{ display: 'none' }}
          />
          
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: dragActive ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: dragActive ? 'var(--primary)' : 'var(--text-secondary)',
            transition: 'var(--transition)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>

          <div>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              Drag & drop your resume here, or <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>browse files</span>
            </p>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Supports PDF, DOCX, TXT up to 10MB
            </p>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            color: '#ef4444',
            fontSize: '0.8rem',
            fontWeight: 500
          }}>
            {errorMsg}
          </div>
        )}

        {/* Uploaded Resumes List */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem', margin: '0 0 0.75rem 0' }}>
            Your Resumes ({resumes.length})
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxHeight: '260px',
            overflowY: 'auto',
            paddingRight: '0.25rem'
          }}>
            {resumes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2.5rem 1rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                fontSize: '0.85rem'
              }}>
                Vault is empty. Upload your first resume to get started!
              </div>
            ) : (
              resumes.map((resume) => (
                <div
                  key={resume.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    transition: 'var(--transition)'
                  }}
                  className="resume-vault-row"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(6, 182, 212, 0.1)',
                      color: '#06b6d4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={resume.name}>
                        {resume.name}
                      </p>
                      <p style={{ margin: '0.15rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        Size: {resume.size} • Uploaded: {resume.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      className="btn-icon-sm"
                      onClick={() => handleDownload(resume)}
                      title="Download resume file"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                    <button
                      className="btn-icon-sm delete"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${resume.name}? This will also unlink it from any applications.`)) {
                          onDelete(resume.id);
                        }
                      }}
                      title="Delete resume"
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={onClose} 
          style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
        >
          Close Vault
        </button>
      </div>
    </div>
  );
};
