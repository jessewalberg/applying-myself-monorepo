import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Eye, Download, Trash2, AlertCircle, Copy, CheckCircle, ExternalLink, ChevronDown, Briefcase, Filter, Plus } from 'lucide-react';
import { convexApi } from '@/services/convexApi';
import type { HistoryTabProps, CoverLetter, JobApplication, ExtractedJob } from '@/types';

const HistoryTab: React.FC<HistoryTabProps> = ({ user, refreshTrigger }) => {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [extractedJobs, setExtractedJobs] = useState<ExtractedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [activeView, setActiveView] = useState<'cover-letters' | 'applications'>('cover-letters');

  if (!user) {
    return (
      <div className="history-tab">
        <div className="loading-message">Loading user data...</div>
      </div>
    );
  }

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');

      // Load cover letters
      const letters = await convexApi.getCoverLetters();
      setCoverLetters(letters);

      // Load job applications
      const jobApplicationsResult = await convexApi.getJobApplications();
      setJobApplications(jobApplicationsResult.jobApplications);

      // Load extracted jobs
      const extractedJobsResult = await convexApi.getExtractedJobs();
      setExtractedJobs(extractedJobsResult.jobs);

    } catch (err: unknown) {
      console.error('Failed to load history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLetter = (letter: CoverLetter): void => {
    setSelectedLetter(letter);
  };

  const handleBackToList = (): void => {
    setSelectedLetter(null);
    setCopySuccess(false);
    setShowDownloadOptions(false);
  };

  const handleCopyToClipboard = async (content: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);

      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setError('Failed to copy to clipboard. Please try again.');
    }
  };

  const handleDownloadAsGoogleDoc = async (content: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content);
      const googleDocsUrl = 'https://docs.google.com/document/create';
      chrome.tabs.create({ url: googleDocsUrl });
      setShowDownloadOptions(false);
      alert('✅ Cover letter copied to clipboard!\n\n📝 Google Docs will open in a new tab\n📋 Simply paste (Ctrl+V / Cmd+V) your cover letter\n💾 Save and edit as needed');
    } catch (err) {
      console.error('Failed to open Google Docs:', err);
      setError('Failed to open Google Docs. Please try again.');
    }
  };

  const handleDownloadAsWordDoc = async (content: string, letter: CoverLetter): Promise<void> => {
    try {
      const { generateDocx, generateCoverLetterFilename } = await import('@/utils/documentGenerator');

      const filename = generateCoverLetterFilename(
        letter.company || undefined,
        letter.jobTitle || undefined,
        'docx'
      );

      await generateDocx({
        title: `Cover Letter - ${letter.jobTitle || 'Position'}`,
        company: letter.company || undefined,
        content: content,
        createdAt: new Date(letter.createdAt).getTime(),
        filename
      });

      setShowDownloadOptions(false);
    } catch (err) {
      console.error('Failed to download Word document:', err);
      setError('Failed to download document. Please try again.');
    }
  };

  const handleOpenDashboard = (section: 'cover-letters' | 'jobs') => {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://applyingmyself.com'
      : 'http://localhost:3000';
    const path = section === 'cover-letters' ? '/dashboard/cover-letters' : '/dashboard/jobs';
    window.open(`${baseUrl}${path}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interviewing': return 'bg-yellow-100 text-yellow-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'applied': return 'Applied';
      case 'interviewing': return 'Interviewing';
      case 'offered': return 'Offered';
      case 'rejected': return 'Rejected';
      case 'withdrawn': return 'Withdrawn';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading history...</p>
      </div>
    );
  }

  if (selectedLetter) {
    return (
      <LetterViewer
        letter={selectedLetter}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="history-tab">
      <div className="history-header">
        <div className="header-content">
          <h3>Your History</h3>
          <p>View and manage your cover letters and job applications</p>
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button
            className={`toggle-btn ${activeView === 'cover-letters' ? 'active' : ''}`}
            onClick={() => setActiveView('cover-letters')}
          >
            <FileText size={16} />
            Cover Letters ({coverLetters.length})
          </button>
          <button
            className={`toggle-btn ${activeView === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveView('applications')}
          >
            <Briefcase size={16} />
            Jobs ({jobApplications.length + extractedJobs.length})
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="history-actions">
        <button
          className="secondary-button"
          onClick={() => handleOpenDashboard(activeView === 'cover-letters' ? 'cover-letters' : 'jobs')}
        >
          <ExternalLink size={16} />
          Open Full Dashboard
        </button>

        {activeView === 'applications' && (
          <button
            className="primary-button"
            onClick={() => handleOpenDashboard('jobs')}
          >
            <Plus size={16} />
            Add Application
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
          <button onClick={loadHistory} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {!error && coverLetters.length === 0 && jobApplications.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-icon" />
          <h4>No cover letters or job applications yet</h4>
          <p>Generate your first cover letter or add a job application to see it here.</p>
        </div>
      ) : (
        <>
          {/* Cover Letters View */}
          {activeView === 'cover-letters' && (
            <>
              {coverLetters.length === 0 ? (
                <div className="empty-state">
                  <FileText className="empty-icon" size={48} />
                  <h4>No cover letters yet</h4>
                  <p>Generate your first cover letter using the Generate tab</p>
                </div>
              ) : (
                <div className="history-list">
                  {coverLetters.map((letter) => (
                    <div key={letter.id} className="history-item">
                      <div className="history-content">
                        <div className="history-main">
                          <h4>{letter.jobTitle || 'Untitled Position'}</h4>
                          <p className="company">{letter.company || 'Company Name'}</p>
                          <div className="history-meta">
                            <span className="date">
                              {new Date(letter.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                            <span className="credits">
                              {letter.creditsUsed || 0} credits used
                            </span>
                          </div>
                        </div>
                        <div className="history-actions">
                          <button
                            onClick={() => setSelectedLetter(letter)}
                            className="icon-button"
                            title="View cover letter"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Jobs View (Applications + Extracted Jobs) */}
          {activeView === 'applications' && (
            <>
              {jobApplications.length === 0 && extractedJobs.length === 0 ? (
                <div className="empty-state">
                  <Briefcase className="empty-icon" size={48} />
                  <h4>No jobs yet</h4>
                  <p>Extract jobs from job postings or track applications manually</p>
                  <button
                    className="primary-button"
                    onClick={() => handleOpenDashboard('jobs')}
                  >
                    <Plus size={16} />
                    Add Your First Job
                  </button>
                </div>
              ) : (
                <div className="history-list">
                  {/* Job Applications */}
                  {jobApplications.map((application) => (
                    <div key={`app-${application._id}`} className="history-item">
                      <div className="history-content">
                        <div className="history-main">
                          <h4>{application.jobTitle || 'Untitled Position'}</h4>
                          <p className="company">{application.companyName || 'Company Name'}</p>
                          <div className="history-meta">
                            <span className="date">
                              Applied: {application.appliedDate
                                ? new Date(application.appliedDate).toLocaleDateString()
                                : 'Date not set'
                              }
                            </span>
                            {application.status && (
                              <span className={`status-badge ${getStatusColor(application.status)}`}>
                                {formatStatus(application.status)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="history-actions">
                          <button
                            onClick={() => handleOpenDashboard('jobs')}
                            className="icon-button"
                            title="View in dashboard"
                          >
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Extracted Jobs */}
                  {extractedJobs.map((job) => (
                    <div key={`job-${job._id}`} className="history-item">
                      <div className="history-content">
                        <div className="history-main">
                          <h4>{job.title || 'Untitled Job'}</h4>
                          <p className="company">{job.company || 'Unknown Company'}</p>
                          <div className="history-meta">
                            <span className="date">
                              Extracted: {new Date(job.extractedAt).toLocaleDateString()}
                            </span>
                            <span className={`status-badge bg-purple-100 text-purple-800`}>
                              Extracted
                            </span>
                            {job.confidence && (
                              <span className="confidence">
                                {Math.round(job.confidence * 100)}% confidence
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="history-actions">
                          <button
                            onClick={() => handleOpenDashboard('jobs')}
                            className="icon-button"
                            title="View in dashboard"
                          >
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

interface HistoryItemProps {
  letter: CoverLetter;
  onView: () => void;
  onDownload: (content: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ letter, onView, onDownload }) => (
  <div className="history-item">
    <div className="history-content">
      <div className="history-main">
        <h4>{letter.jobTitle || 'Untitled Position'}</h4>
        <p className="company">{letter.company || 'Company Name'}</p>
        <div className="history-meta">
          <span className="date">
            <Calendar size={12} />
            {new Date(letter.createdAt || Date.now()).toLocaleDateString()}
          </span>
          <span className="credits">
            {letter.creditsUsed} credits used
          </span>
        </div>
      </div>
      <div className="history-actions">
        <button className="icon-button" onClick={onView} title="View letter">
          <Eye size={16} />
        </button>
        <button
          className="icon-button"
          onClick={() => onDownload(letter.content)}
          title="Download letter"
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  </div>
);

interface LetterViewerProps {
  letter: CoverLetter;
  onBack: () => void;
}

const LetterViewer: React.FC<LetterViewerProps> = ({ letter, onBack }) => {
  const [localCopySuccess, setLocalCopySuccess] = useState(false);
  const [localShowDownloadOptions, setLocalShowDownloadOptions] = useState(false);

  const handleLocalCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(letter.content);
      setLocalCopySuccess(true);
      setTimeout(() => setLocalCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleDownloadOptions = (): void => {
    setLocalShowDownloadOptions(!localShowDownloadOptions);
  };

  const handleDownloadGoogleDoc = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(letter.content);
      const googleDocsUrl = 'https://docs.google.com/document/create';
      chrome.tabs.create({ url: googleDocsUrl });
      setLocalShowDownloadOptions(false);
      alert('✅ Cover letter copied to clipboard!\n\n📝 Google Docs will open in a new tab\n📋 Simply paste (Ctrl+V / Cmd+V) your cover letter\n💾 Save and edit as needed');
    } catch (err) {
      console.error('Failed to open Google Docs:', err);
    }
  };

  const handleDownloadWordDoc = async (): Promise<void> => {
    try {
      const { generateDocx, generateCoverLetterFilename } = await import('@/utils/documentGenerator');

      const filename = generateCoverLetterFilename(
        letter.company || undefined,
        letter.jobTitle || undefined,
        'docx'
      );

      await generateDocx({
        title: `Cover Letter - ${letter.jobTitle || 'Position'}`,
        company: letter.company || undefined,
        content: letter.content,
        createdAt: new Date(letter.createdAt).getTime(),
        filename
      });

      setLocalShowDownloadOptions(false);
    } catch (err) {
      console.error('Failed to download Word document:', err);
    }
  };

  const handleDownloadPdf = async (): Promise<void> => {
    try {
      const { generatePdf, generateCoverLetterFilename } = await import('@/utils/documentGenerator');

      const filename = generateCoverLetterFilename(
        letter.company || undefined,
        letter.jobTitle || undefined,
        'pdf'
      );

      await generatePdf({
        title: `Cover Letter - ${letter.jobTitle || 'Position'}`,
        company: letter.company || undefined,
        content: letter.content,
        createdAt: new Date(letter.createdAt).getTime(),
        filename
      });

      setLocalShowDownloadOptions(false);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  return (
    <div className="letter-viewer">
      <div className="viewer-header">
        <button className="back-button" onClick={onBack}>
          ← Back to History
        </button>
        <div className="viewer-actions">
          <button
            className={`secondary-button ${localCopySuccess ? 'success' : ''}`}
            onClick={handleLocalCopy}
          >
            {localCopySuccess ? (
              <>
                <CheckCircle size={16} /> Copied!
              </>
            ) : (
              <>
                <Copy size={16} /> Copy
              </>
            )}
          </button>

          <div className="download-dropdown">
            <button
              className="secondary-button download-button"
              onClick={toggleDownloadOptions}
            >
              <Download size={16} /> Download <ChevronDown size={14} />
            </button>

            {localShowDownloadOptions && (
              <div className="download-options">
                <button onClick={handleDownloadGoogleDoc} className="download-option">
                  <ExternalLink size={14} />
                  <div>
                    <div className="option-title">Google Docs</div>
                    <div className="option-desc">Edit online</div>
                  </div>
                </button>
                <button onClick={handleDownloadWordDoc} className="download-option">
                  <Download size={14} />
                  <div>
                    <div className="option-title">Word Document</div>
                    <div className="option-desc">Download .docx file</div>
                  </div>
                </button>
                <button onClick={handleDownloadPdf} className="download-option">
                  <Download size={14} />
                  <div>
                    <div className="option-title">PDF Document</div>
                    <div className="option-desc">Download .pdf file</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="letter-details">
        <h3>{letter.jobTitle || 'Untitled Position'}</h3>
        <p>{letter.company || 'Company Name'}</p>
        <small>Generated on {new Date(letter.createdAt || Date.now()).toLocaleDateString()}</small>
      </div>

      <div className="letter-content">
        <textarea
          value={letter.content}
          readOnly
          rows={15}
          className="letter-text"
        />
      </div>
    </div>
  );
};

export default HistoryTab;