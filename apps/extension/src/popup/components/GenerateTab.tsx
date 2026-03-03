import React, { useState, useEffect } from 'react';
import {
  Globe,
  FileText,
  Download,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  Upload,
  Briefcase,
  RefreshCw,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { convexApi } from '@/services/convexApi';
import type { GenerateTabProps, Resume, ExtractedContent, User } from '@/types';
import { useResumeLibrary } from '@/features/generate/hooks/useResumeLibrary';
import { useExtractJob } from '@/features/generate/hooks/useExtractJob';
import { useGenerateCoverLetter } from '@/features/generate/hooks/useGenerateCoverLetter';

type ApplicationStatus = "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";

const GenerateTab: React.FC<GenerateTabProps> = ({ user, onUserUpdate }) => {
  const [step, setStep] = useState(1);
  const {
    resumes,
    selectedResume,
    setSelectedResume,
    loadResumes,
    uploadResume,
    getDownloadUrl,
  } = useResumeLibrary();
  const {
    extractedData,
    extractedJobId,
    setExtractedData,
    checkForExtractedContent,
    extractFromActiveTab,
  } = useExtractJob();
  const { generate } = useGenerateCoverLetter();
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // Job tracking state
  const [trackApplication, setTrackApplication] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>("applied");
  const [applicationNotes, setApplicationNotes] = useState('');

  // Add null check for user
  if (!user) {
    return (
      <div className="generate-tab">
        <div className="loading-message">Loading user data...</div>
      </div>
    );
  }

  useEffect(() => {
    void loadResumes();
    void checkForExtractedContent().then((snapshot) => {
      if (snapshot) {
        setStep(2);
      }
    });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.download-dropdown')) {
        setShowDownloadOptions(false);
      }
    };

    if (showDownloadOptions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDownloadOptions]);

  /**
   * Trigger content extraction from current page
   */
  const handleExtractContent = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const result = await extractFromActiveTab();
      onUserUpdate({ ...user, credits: result.remainingCredits });
      setStep(2);

    } catch (err: unknown) {
      console.error('Content extraction error:', err);

      let errorMessage = 'Failed to extract content. ';
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (file: File): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const uploadResult = await uploadResume(file);

      // Update user credits
      onUserUpdate({ ...user, credits: uploadResult.remainingCredits });
    } catch (err: unknown) {
      console.error('Failed to upload resume:', err);
      setError('Failed to upload resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async (): Promise<void> => {
    if (!selectedResume || !extractedData) {
      setError('Please select a resume and extract job content first.');
      return;
    }

    setLoading(true);
    setError('');
    setCoverLetter('Generating your personalized cover letter...');
    setStep(3); // Show the cover letter step immediately with loading state

    try {
      const response = await generate({
        selectedResume,
        extractedData,
        extractedJobId,
        trackApplication,
        applicationOptions: {
          status: applicationStatus,
          appliedDate: Date.now(),
          notes: applicationNotes,
          resumeId: selectedResume.id,
        },
        onProgress: (progressContent: string) => {
          setCoverLetter(progressContent);
        },
      });

      // Final update with completed content
      setCoverLetter(response.coverLetter.content);

      // Refetch user profile to get updated credits
      const updatedUserProfile = await convexApi.getUserProfile();
      if (updatedUserProfile) {
        const updatedUser: User = {
          id: updatedUserProfile._id,
          email: updatedUserProfile.email,
          name: updatedUserProfile.name,
          credits: updatedUserProfile.credits || 0,
          plan: updatedUserProfile.plan,
        };
        onUserUpdate(updatedUser);
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate cover letter. Please try again.');
      setStep(2); // Go back to previous step on error
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopySuccess(true);

      // Reset the success state after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setError('Failed to copy to clipboard. Please try again.');
    }
  };

  const handleDownloadAsGoogleDoc = async (): Promise<void> => {
    try {
      // Copy content to clipboard first
      await navigator.clipboard.writeText(coverLetter);

      // Open Google Docs in a new tab
      const googleDocsUrl = 'https://docs.google.com/document/create';
      chrome.tabs.create({ url: googleDocsUrl });

      setShowDownloadOptions(false);

      // Show instructions to user
      alert('✅ Cover letter copied to clipboard!\n\n📝 Google Docs will open in a new tab\n📋 Simply paste (Ctrl+V / Cmd+V) your cover letter\n💾 Save and edit as needed');
    } catch (err) {
      console.error('Failed to open Google Docs:', err);
      setError('Failed to open Google Docs. Please try again.');
    }
  };



  const handleDownloadAsWordDoc = async (): Promise<void> => {
    try {
      const { generateDocx, generateCoverLetterFilename } = await import('@/utils/documentGenerator');

      const filename = generateCoverLetterFilename(
        extractedData?.company,
        extractedData?.title,
        'docx'
      );

      await generateDocx({
        title: `Cover Letter - ${extractedData?.title || 'Position'}`,
        company: extractedData?.company,
        content: coverLetter,
        createdAt: Date.now(),
        filename
      });

      setShowDownloadOptions(false);
    } catch (err) {
      console.error('Failed to download Word document:', err);
      setError('Failed to download document. Please try again.');
    }
  };

  const handleDownloadAsPdf = async (): Promise<void> => {
    try {
      const { generatePdf, generateCoverLetterFilename } = await import('@/utils/documentGenerator');

      const filename = generateCoverLetterFilename(
        extractedData?.company,
        extractedData?.title,
        'pdf'
      );

      await generatePdf({
        title: `Cover Letter - ${extractedData?.title || 'Position'}`,
        company: extractedData?.company,
        content: coverLetter,
        createdAt: Date.now(),
        filename
      });

      setShowDownloadOptions(false);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      setError('Failed to download PDF. Please try again.');
    }
  };

  const handleResumeDownload = async (resume: Resume): Promise<void> => {
    try {
      const downloadUrl = await getDownloadUrl(resume.id);
      if (downloadUrl) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = resume.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError('Failed to get download URL for resume.');
      }
    } catch (err) {
      console.error('Failed to download resume:', err);
      setError('Failed to download resume. Please try again.');
    }
  };
  return (
    <div className="generate-tab">
      <div className="steps-indicator">
        {[1, 2, 3].map(stepNum => (
          <div
            key={stepNum}
            className={`step-indicator ${step >= stepNum ? 'active' : ''} ${step === stepNum ? 'current' : ''}`}
          >
            {step > stepNum ? <Check size={12} /> : stepNum}
          </div>
        ))}
      </div>

      {step === 1 && (
        <StepCard
          title="Extract Page Content"
          description="Extract information from any webpage"
          icon={Globe}
        >
          <div className="extraction-info">
            <p>Navigate to any job posting webpage and click the button below to extract the job details for your cover letter.</p>
          </div>
          <button
            className="primary-button"
            onClick={handleExtractContent}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                Extracting...
              </>
            ) : (
              'Extract Current Page'
            )}
          </button>
        </StepCard>
      )}

      {step === 2 && extractedData && (
        <StepCard
          title="Content Extracted"
          description="Review the extracted information"
          icon={Briefcase}
        >
          <ContentPreview data={extractedData} />

          {/* Job Tracking Section */}
          <div className="job-tracking-section">
            <div className="tracking-header">
              <label className="tracking-toggle">
                <input
                  type="checkbox"
                  checked={trackApplication}
                  onChange={(e) => setTrackApplication(e.target.checked)}
                />
                <span>Track this as a job application</span>
              </label>
            </div>

            {trackApplication && (
              <div className="tracking-options">
                <div className="tracking-row">
                  <label>Status:</label>
                  <select
                    value={applicationStatus}
                    onChange={(e) => setApplicationStatus(e.target.value as ApplicationStatus)}
                    className="status-select"
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offered">Offered</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
                <div className="tracking-row">
                  <label>Notes:</label>
                  <textarea
                    value={applicationNotes}
                    onChange={(e) => setApplicationNotes(e.target.value)}
                    placeholder="Add notes about this application..."
                    rows={2}
                    className="notes-textarea"
                  />
                </div>
                <div className="tracking-info">
                  <small>✓ Application will be tracked automatically when you generate the cover letter</small>
                </div>
              </div>
            )}
          </div>

          <ResumeSelector
            resumes={resumes}
            selectedResume={selectedResume}
            onResumeSelect={setSelectedResume}
            onResumeUpload={handleResumeUpload}
            onResumeDownload={handleResumeDownload}
            loading={loading}
          />
          <button
            className="primary-button"
            onClick={handleGenerateCoverLetter}
            disabled={!selectedResume || loading}
          >
            {loading ? 'Generating...' : 'Generate Cover Letter (3 credits)'}
          </button>
        </StepCard>
      )}

      {step === 3 && coverLetter && (
        <StepCard
          title={loading ? "Generating Cover Letter" : "Cover Letter Ready"}
          description={loading ? "AI is creating your personalized cover letter..." : "Your personalized cover letter"}
          icon={FileText}
        >
          <div className="cover-letter-preview">
            {loading && coverLetter.includes('Generating your personalized cover letter') && (
              <div className="generation-status">
                <RefreshCw className="animate-spin" size={20} />
                <span>AI is analyzing the job posting and your resume...</span>
              </div>
            )}
            <textarea
              value={coverLetter}
              readOnly
              rows={10}
              className={`cover-letter-text ${loading ? 'generating' : ''}`}
            />
          </div>
          {!loading && (
            <>
              <div className="action-buttons">
                <button
                  className={`secondary-button ${copySuccess ? 'success' : ''}`}
                  onClick={handleCopyToClipboard}
                  disabled={copySuccess}
                >
                  {copySuccess ? (
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
                    className="primary-button"
                    onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                  >
                    <Download size={16} /> Download
                    <ChevronDown size={14} />
                  </button>
                  {showDownloadOptions && (
                    <div className="download-options">
                      <button
                        className="download-option"
                        onClick={handleDownloadAsGoogleDoc}
                      >
                        <ExternalLink size={16} />
                        <div>
                          <span>Open in Google Docs</span>
                          <small>Editable online document</small>
                        </div>
                      </button>
                      <button
                        className="download-option"
                        onClick={handleDownloadAsWordDoc}
                      >
                        <Download size={16} />
                        <div>
                          <span>Download as Word Doc</span>
                          <small>DOCX format (.docx)</small>
                        </div>
                      </button>
                      <button
                        className="download-option"
                        onClick={handleDownloadAsPdf}
                      >
                        <Download size={16} />
                        <div>
                          <span>Download as PDF</span>
                          <small>PDF format (.pdf)</small>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                className="link-button"
                onClick={() => {
                  setStep(1);
                  setExtractedData(null);
                  setCoverLetter('');
                }}
              >
                Extract Another Page
              </button>
            </>
          )}
        </StepCard>
      )}

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};

interface StepCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ title, description, icon: Icon, children }) => (
  <div className="step-card">
    <div className="step-header">
      <Icon className="step-icon" />
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
    <div className="step-content">
      {children}
    </div>
  </div>
);

/**
 * Component to preview extracted content
 */
interface ContentPreviewProps {
  data: ExtractedContent;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ data }) => (
  <div className="content-preview">
    <div className="preview-header">
      <h4>Extracted from: {data.domain}</h4>
      {data.confidence !== undefined && (
        <div className="confidence-badge">
          Confidence: {Math.round(data.confidence * 100)}%
        </div>
      )}
    </div>

    <div className="preview-content">
      {data.title && <div><strong>Title:</strong> {data.title}</div>}
      {data.company && <div><strong>Company:</strong> {data.company}</div>}
      {data.location && <div><strong>Location:</strong> {data.location}</div>}
      {data.pageType && <div><strong>Page Type:</strong> {data.pageType}</div>}
      {data.description && (
        <div>
          <strong>Description:</strong>
          <p className="description-text">{data.description.substring(0, 200)}...</p>
        </div>
      )}
    </div>
  </div>
);

interface ResumeSelectorProps {
  resumes: Resume[];
  selectedResume: Resume | null;
  onResumeSelect: (resume: Resume) => void;
  onResumeUpload: (file: File) => Promise<void>;
  onResumeDownload: (resume: Resume) => Promise<void>;
  loading: boolean;
}

const ResumeSelector: React.FC<ResumeSelectorProps> = ({
  resumes,
  selectedResume,
  onResumeSelect,
  onResumeUpload,
  onResumeDownload,
  loading
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      onResumeUpload(file);
    }
  };

  return (
    <div className="resume-selector">
      <div className="upload-area">
        <input
          type="file"
          id="resume-upload"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          disabled={loading}
        />
        <label htmlFor="resume-upload" className="upload-button">
          <Upload size={16} />
          Upload New Resume
        </label>
      </div>

      {resumes.length > 0 && (
        <div className="resume-list">
          <h4>Select Resume:</h4>
          {resumes.map(resume => (
            <div
              key={resume.id}
              className={`resume-item ${selectedResume?.id === resume.id ? 'selected' : ''}`}
            >
              <div className="resume-content" onClick={() => onResumeSelect(resume)}>
                <FileText size={16} />
                <div className="resume-info">
                  <span className="resume-name">{resume.filename}</span>
                  <span className="resume-date">
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                className="resume-download-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onResumeDownload(resume);
                }}
                title="Download resume"
              >
                <Download size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateTab;
