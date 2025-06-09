import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Eye, Download, Trash2, AlertCircle, Copy, CheckCircle, ExternalLink, ChevronDown } from 'lucide-react';
import { convexApi } from '@/services/convexApi';
import type { HistoryTabProps, CoverLetter } from '@/types';

const HistoryTab: React.FC<HistoryTabProps> = ({ user, refreshTrigger }) => {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  if (!user) {
    return (
      <div className="history-tab">
        <div className="loading-message">Loading user data...</div>
      </div>
    );
  }

  useEffect(() => {
    loadCoverLetters();
  }, []);

  // Refresh when tab becomes active
  useEffect(() => {
    if (refreshTrigger === 'history') {
      loadCoverLetters();
    }
  }, [refreshTrigger]);

  const loadCoverLetters = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const letters = await convexApi.getCoverLetters();
      setCoverLetters(letters);
    } catch (error) {
      console.error('Failed to load cover letters:', error);
      setCoverLetters([]);
      setError('Failed to load cover letters');
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

  const handleDownloadAsWordDoc = (content: string): void => {
    try {
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
    </style>
</head>
<body>
    ${content.split('\n').map(paragraph => 
      paragraph.trim() ? `<p>${paragraph.trim()}</p>` : '<p>&nbsp;</p>'
    ).join('')}
</body>
</html>`;
      
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      
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
        <h3>Cover Letter History</h3>
        <p>{coverLetters.length} letters generated</p>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
          <button onClick={loadCoverLetters} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {!error && coverLetters.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-icon" />
          <h4>No cover letters yet</h4>
          <p>Generate your first cover letter to see it here.</p>
        </div>
      ) : (
        <div className="history-list">
          {coverLetters.map(letter => (
            <HistoryItem 
              key={letter.id}
              letter={letter}
              onView={() => handleViewLetter(letter)}
              onDownload={handleDownloadAsWordDoc}
            />
          ))}
        </div>
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

  const handleDownloadWordDoc = (): void => {
    try {
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
    </style>
</head>
<body>
    ${letter.content.split('\n').map(paragraph => 
      paragraph.trim() ? `<p>${paragraph.trim()}</p>` : '<p>&nbsp;</p>'
    ).join('')}
</body>
</html>`;
      
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cover-letter-${letter.company || 'unknown'}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setLocalShowDownloadOptions(false);
    } catch (err) {
      console.error('Failed to download Word document:', err);
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
                    <div className="option-desc">Download .doc file</div>
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