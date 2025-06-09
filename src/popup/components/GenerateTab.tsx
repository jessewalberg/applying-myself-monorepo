import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Check,
  CheckCircle,
  AlertCircle,
  Upload,
  ChevronRight,
  Briefcase,
  RefreshCw,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { convexApi } from '@/services/convexApi';
import CONFIG from '@/config';
import type { GenerateTabProps, Resume, ExtractedContent, User } from '@/types';

const GenerateTab: React.FC<GenerateTabProps> = ({ user, onUserUpdate }) => {
  const [step, setStep] = useState(1);
  const [extractedData, setExtractedData] = useState<ExtractedContent | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // Add null check for user
  if (!user) {
    return (
      <div className="generate-tab">
        <div className="loading-message">Loading user data...</div>
      </div>
    );
  }

  useEffect(() => {
    loadResumes();
    checkForExtractedContent();
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

  const loadResumes = async (): Promise<void> => {
    try {
      const resumeList = await convexApi.getResumes();
      setResumes(resumeList);
      if (resumeList.length > 0) {
        setSelectedResume(resumeList[0]);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    }
  };

  /**
   * Check if user has recently extracted content
   */
  const checkForExtractedContent = async (): Promise<void> => {
    try {
      const result = await chrome.storage.local.get(['lastExtractedJob', 'extractionTimestamp']);
      
      if (result.lastExtractedJob && result.extractionTimestamp) {
        // Check if extraction is recent (within 10 minutes)
        const tenMinutes = 10 * 60 * 1000;
        const isRecent = (Date.now() - result.extractionTimestamp) < tenMinutes;
        
        if (isRecent) {
          setExtractedData(result.lastExtractedJob as ExtractedContent);
          setStep(2); // Skip to step 2 if we have recent data
        }
      }
    } catch (error) {
      console.error('Failed to check for extracted content:', error);
    }
  };

  /**
   * Test API connectivity
   */
  const testAPIConnectivity = async (): Promise<boolean> => {
    try {
      console.log('Testing API connectivity...');
      // Try a simple GET request to test connectivity
      await convexApi.getUserProfile();
      console.log('API connectivity test passed');
      return true;
    } catch (error) {
      console.error('API connectivity test failed:', error);
      return false;
    }
  };

  /**
   * Trigger content extraction from current page
   */
  const handleExtractContent = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      // Test API connectivity first
      const isAPIReachable = await testAPIConnectivity();
      if (!isAPIReachable) {
        throw new Error('Cannot connect to the API server. Please check if the server is running.');
      }

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        throw new Error('No active tab found');
      }

      console.log('Attempting to extract from tab:', tab.url);

      // First, ping the content script to see if it's active
      try {
        const pingResponse = await chrome.tabs.sendMessage(tab.id, {
          type: 'PING'
        });
        console.log('Content script ping response:', pingResponse);
      } catch (pingError) {
        console.warn('Content script not responding, attempting to inject...');
        
        // Try to inject the content script manually
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          console.log('Content script injected successfully');
          
          // Wait a moment for the script to initialize
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (injectError) {
          console.error('Failed to inject content script:', injectError);
          throw new Error('Unable to access this page. Please try refreshing the page and try again.');
        }
      }

      // Get page data from content script (no API call)
      const pageDataResponse = await chrome.tabs.sendMessage(tab.id, {
        type: 'GET_PAGE_DATA'
      });

      console.log('Page data response:', pageDataResponse);

      if (!pageDataResponse?.success || !pageDataResponse.data) {
        throw new Error('Failed to extract page data');
      }

      const pageData = pageDataResponse.data;
      console.log('Page data received:', {
        url: pageData.url,
        title: pageData.title,
        htmlLength: pageData.html.length
      });

      // Make API call from popup context (has proper permissions)
      console.log('Making API call from popup context...');
      const result = await convexApi.extractJobFromHTML(
        pageData.html,
        pageData.url,
        pageData.title
      );

      console.log('API extraction result:', result);

      if (!result) {
        throw new Error('No data returned from extraction');
      }

      // The backend now returns data in the correct ExtractedContent format
      const newExtractedData: ExtractedContent = {
        title: result.title,
        company: result.company,
        location: result.location,
        description: result.description,
        requirements: result.requirements,
        salary: result.salary,
        type: result.type,
        postedDate: result.postedDate,
        url: result.url,
        confidence: result.confidence,
        pageType: result.pageType,
        domain: result.domain,
      };

      await chrome.storage.local.set({ 
        lastExtractedJob: newExtractedData,
        extractionTimestamp: Date.now()
      });

      // Update user credits with the value returned from extraction
      onUserUpdate({ ...user, credits: result.remainingCredits });
      
      setExtractedData(newExtractedData);
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
      const uploadResult = await convexApi.uploadResume(file);
      await loadResumes();
      setSelectedResume(uploadResult.resume);
      
      // Update user credits
      onUserUpdate({ ...user, credits: uploadResult.remainingCredits });
    } catch (err: any) {
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
      const response = await convexApi.generateCoverLetterFromContent({
        resumeId: selectedResume.id,
        extractedContent: extractedData,
        tone: 'professional', // or get from UI
        length: 'medium',     // or get from UI
      }, (progressContent: string) => {
        // Update cover letter content as AI generates it
        setCoverLetter(progressContent);
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

  const handleDownloadAsWordDoc = (): void => {
    try {
      // Create HTML content that Word can open (much better than RTF)
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cover Letter</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            max-width: 8.5in;
            margin: 1in auto;
            color: #000;
        }
        p {
            margin: 12pt 0;
            text-align: left;
        }
        .header {
            text-align: center;
            margin-bottom: 24pt;
        }
        .date {
            text-align: right;
            margin-bottom: 24pt;
        }
        .signature {
            margin-top: 36pt;
        }
    </style>
</head>
<body>
    ${coverLetter.split('\n').map(paragraph => 
      paragraph.trim() ? `<p>${paragraph.trim()}</p>` : '<p>&nbsp;</p>'
    ).join('')}
</body>
</html>`;
      
      // Create blob with HTML content but .doc extension
      const blob = new Blob([htmlContent], { 
        type: 'application/msword'
      });
      const url = URL.createObjectURL(blob);
      
      // Create temporary link and download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cover-letter.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowDownloadOptions(false);
    } catch (err) {
      console.error('Failed to download Word document:', err);
      setError('Failed to download document. Please try again.');
    }
  };
  console.log(coverLetter)
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
            <p>Click the ✨ button on any webpage or use the button below to extract content for your cover letter.</p>
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
          <ResumeSelector
            resumes={resumes}
            selectedResume={selectedResume}
            onResumeSelect={setSelectedResume}
            onResumeUpload={handleResumeUpload}
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
                          <small>DOC format (.doc)</small>
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
  loading: boolean;
}

const ResumeSelector: React.FC<ResumeSelectorProps> = ({ 
  resumes, 
  selectedResume, 
  onResumeSelect, 
  onResumeUpload, 
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
              onClick={() => onResumeSelect(resume)}
            >
              <FileText size={16} />
              <div className="resume-info">
                <span className="resume-name">{resume.filename}</span>
                <span className="resume-date">
                  {new Date(resume.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateTab;