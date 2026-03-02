# Chrome Web Store Permissions Justification

This document provides detailed justifications for each permission requested by the Applying Myself Chrome Extension.

## Overview

The Applying Myself Chrome Extension helps job seekers create personalized cover letters by extracting job posting information from websites and generating AI-powered cover letters. Each permission is essential for core functionality while maintaining strict privacy and security standards.

## Detailed Permission Justifications

### 1. activeTab Permission

**Purpose**: Extract job posting content from the currently active browser tab.

**Specific Use Cases**:
- Reading job titles, company names, and job descriptions from career websites
- Extracting job requirements, qualifications, and preferred skills
- Capturing salary information, location, and employment type
- Parsing application deadlines and contact information
- Gathering company culture and benefits information

**Technical Implementation**:
- Only accesses content when user explicitly clicks the extension icon
- Reads HTML content to identify and extract structured job information
- Processes content locally before sending to secure backend
- No background monitoring or automatic data collection

**Privacy Protection**:
- Permission only granted when user initiates action
- No access to browsing history or other tabs
- Data extraction is transparent and user-controlled
- No third-party data sharing or external storage

**User Benefits**:
- Eliminates manual copy-paste of job details
- Ensures accurate capture of all relevant information
- Saves time in the job application process
- Enables personalized cover letter generation

### 2. storage Permission

**Purpose**: Store user preferences, authentication data, and cached information locally.

**Data Types Stored**:
- User authentication tokens and session data
- Extension preferences and settings
- Recently extracted job information (temporary cache)
- User's resume selections and templates
- Application history and tracking data
- UI state and customizations

**Storage Implementation**:
- All data stored locally in browser using Chrome's storage API
- Authentication tokens are encrypted with expiration dates
- Temporary job data cached for maximum 24 hours
- Users can clear all stored data through extension settings
- Complies with Chrome's storage quotas and policies

**Privacy and Security**:
- No sensitive personal information stored permanently
- All stored data remains on user's device
- Encrypted storage for authentication tokens
- Users maintain full control over their data
- Regular cleanup of temporary cached data

**User Experience Benefits**:
- Maintains user login state across browser sessions
- Preserves user preferences and settings
- Enables offline access to recently extracted job data
- Reduces need for repeated configuration
- Improves extension performance and responsiveness

### 3. scripting Permission

**Purpose**: Inject content scripts to extract structured job information from diverse website layouts.

**Technical Requirements**:
- Parse job posting content from various website structures
- Handle dynamic content loading on modern web applications
- Extract specific job elements from different HTML layouts
- Adapt to changes in website structures automatically
- Process JavaScript-rendered content on career sites

**Extraction Targets**:
- Job titles and position levels
- Company names and descriptions
- Job requirements and qualifications
- Salary ranges and benefits information
- Application instructions and deadlines
- Contact information and application links

**Security Measures**:
- Scripts only execute when user initiates extraction
- Lightweight, focused scripts with minimal footprint
- Sandboxed execution prevents access to sensitive data
- No modification of website content or functionality
- Scripts are removed after extraction completion

**Cross-Site Compatibility**:
- Works with major job boards (LinkedIn, Indeed, Glassdoor)
- Supports company career pages and ATS systems
- Adapts to different content management systems
- Handles various website frameworks and technologies

### 4. contextMenus Permission

**Purpose**: Provide convenient right-click access to job extraction functionality.

**User Interface Enhancement**:
- Adds "Extract Job Details" option to context menu
- Appears only on relevant job posting websites
- Provides alternative access method for main functionality
- Integrates with users' natural browsing patterns

**Implementation Details**:
- Context menu appears only on supported career websites
- Menu items clearly labeled with extension branding
- Triggers same secure extraction process as main extension
- Respects user privacy with explicit action requirement

**User Experience Benefits**:
- More intuitive and faster job extraction workflow
- Familiar interface reduces learning curve
- Provides backup access if extension popup is not available
- Reduces number of clicks needed for common actions
- Enhances overall usability and efficiency

### 5. Host Permissions

**Purpose**: Enable secure communication with backend services and access to job posting websites.

**Required Domains**:

***.convex.site and *.convex.cloud**:
- Secure backend infrastructure for data processing
- User authentication and session management
- AI-powered cover letter generation services
- Real-time synchronization with user accounts
- Encrypted data transmission and storage

**Job Board Websites**:
- Access to extract job posting content when requested
- Support for major career websites and job boards
- Company career pages and applicant tracking systems
- Professional networking sites with job listings

**Security Implementation**:
- All communications use HTTPS encryption end-to-end
- Authentication tokens with automatic expiration and refresh
- No third-party data sharing or external integrations
- Strict content security policies and data validation
- Regular security audits and compliance monitoring

**Data Processing**:
- Job content processed only when user initiates extraction
- Personal data handled according to privacy policy
- No background monitoring or automatic data collection
- Users maintain full control over their information
- Option to delete all data at any time

**Compliance and Privacy**:
- GDPR compliant data handling procedures
- Transparent privacy policy and data usage terms
- User consent required for all data processing
- Regular privacy impact assessments
- Secure data deletion and retention policies

## Permission Minimization

We follow the principle of least privilege by:
- Requesting only permissions essential for core functionality
- Using the most restrictive permission scopes possible
- Implementing user-controlled activation for all features
- Providing clear explanations for each permission request
- Regularly reviewing and minimizing permission requirements

## User Control and Transparency

Users maintain control through:
- Clear permission explanations during installation
- Transparent data handling and privacy policies
- Settings to control extension behavior and data usage
- Easy access to delete stored data and revoke permissions
- Regular updates on any changes to permission requirements

## Security Measures

Our security framework includes:
- End-to-end encryption for all data transmission
- Secure authentication with token-based sessions
- Regular security audits and vulnerability assessments
- Compliance with industry security standards
- Incident response procedures for security issues

---

**Note**: This extension prioritizes user privacy and security while providing essential functionality for job seekers. All permissions are necessary for core features and are implemented with the highest security standards. 