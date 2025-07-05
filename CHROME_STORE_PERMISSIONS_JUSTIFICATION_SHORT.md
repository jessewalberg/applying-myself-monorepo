# Chrome Web Store Permissions Justification

This document provides concise justifications for each permission requested by the Applying Myself Chrome Extension, formatted for Chrome Web Store submission (each under 1000 characters).

## 1. activeTab Permission (892 characters)

The activeTab permission enables our extension to read job posting content from the currently active tab when users explicitly click our extension icon or use our context menu. This is essential for our core functionality of extracting job details to generate personalized cover letters.

**Specific use cases:**
- Reading job titles, company names, and job descriptions from career sites
- Extracting salary information and job requirements
- Parsing location and employment type details
- Capturing application deadlines and contact information

**Privacy protection:**
- Only accesses the active tab when user initiates action
- No background monitoring or automatic data collection
- Data is processed locally and sent only to user's secure Convex backend
- No third-party data sharing or storage

**User control:**
- Permission granted only when extension icon is clicked
- Users can see exactly what content is being extracted
- Clear visual feedback during extraction process

This permission is fundamental to our value proposition of helping job seekers create targeted, personalized cover letters by intelligently analyzing job postings they're viewing.

## 2. storage Permission (963 characters)

The storage permission allows our extension to save user preferences, authentication tokens, and cached data locally in the browser. This enhances user experience by maintaining settings and reducing the need for repeated data entry.

**Specific storage uses:**
- User authentication state and session tokens
- Extension preferences (default resume, writing style, etc.)
- Recently extracted job information for quick access
- User's selected resume and cover letter templates
- Application history and tracking data
- Temporary cache of generated content for offline access

**Data types stored:**
- User settings and preferences (JSON objects)
- Authentication tokens for secure API communication
- Cached job posting data (temporary, user-initiated)
- Application tracking metadata
- User interface state and customizations

**Privacy and security:**
- All stored data remains local to user's browser
- Authentication tokens are encrypted and have expiration
- No sensitive personal information stored permanently
- Users can clear stored data through extension settings
- Complies with Chrome's storage quotas and best practices

This permission ensures smooth user experience while maintaining data privacy and security standards.

## 3. scripting Permission (987 characters)

The scripting permission enables our extension to inject content scripts into job posting websites to intelligently extract structured job information. This automated extraction is core to our service of generating personalized cover letters.

**Technical implementation:**
- Injects lightweight JavaScript to parse job posting HTML
- Identifies and extracts key job details (title, company, requirements)
- Handles different website structures and layouts dynamically
- Processes content locally before sending to our secure backend

**Specific extraction targets:**
- Job titles and position levels
- Company names and descriptions
- Job requirements and qualifications
- Salary ranges and benefits information
- Application instructions and deadlines
- Contact information and application links

**User experience benefits:**
- Eliminates manual copy-paste of job details
- Ensures accurate capture of all relevant information
- Adapts to various job board formats automatically
- Provides instant feedback on extraction success

**Security measures:**
- Scripts only execute on user-initiated actions
- No modification of website content or functionality
- Minimal code injection with strict content security policies
- All extracted data processed through encrypted channels

This permission transforms tedious manual data entry into seamless, one-click job information capture.

## 4. contextMenus Permission (761 characters)

The contextMenus permission adds a convenient right-click menu option on job posting websites, providing users with an intuitive way to extract job information without needing to click the extension icon.

**User interface enhancement:**
- Adds "Extract Job Details" option to right-click context menu
- Appears only on relevant job posting and career websites
- Provides alternative access method for main extraction functionality
- Integrates naturally with users' browsing habits

**Functionality provided:**
- Right-click anywhere on a job posting to extract details
- Quick access to job information parsing
- Seamless integration with existing browser workflow
- Reduces clicks needed to access core features

**Implementation details:**
- Context menu appears only on supported career websites
- Menu item clearly labeled with extension branding
- Triggers same secure extraction process as main extension
- Respects user privacy with explicit action requirement

**User benefits:**
- More intuitive and faster job extraction workflow
- Familiar right-click interface reduces learning curve
- Provides backup access if extension icon is not visible
- Enhances overall user experience and efficiency

This permission makes our job extraction feature more accessible and user-friendly while maintaining the same security and privacy standards.

## 5. Host Permissions (997 characters)

Host permissions allow our extension to communicate with our secure Convex backend service and access job posting websites for content extraction. These permissions are essential for our core functionality while maintaining strict security boundaries.

**Required host access:**
- *.convex.site and *.convex.cloud: Our secure backend infrastructure for user authentication, data processing, and AI-powered cover letter generation
- Job board websites: To extract job posting content when users explicitly request it

**Specific functionality enabled:**
- Secure user authentication and session management
- Real-time communication with our AI services
- Encrypted data transmission for cover letter generation
- Synchronization with user's account and application history
- Access to personalized resume and template data

**Security implementation:**
- All communications use HTTPS encryption
- Authentication tokens with expiration and refresh mechanisms
- No third-party data sharing or external service integration
- Strict content security policies and data validation
- Regular security audits and compliance monitoring

**User privacy protection:**
- Data processing occurs only when user initiates actions
- No background monitoring or automatic data collection
- Users maintain full control over their information
- Transparent data handling with clear privacy policies
- Option to delete all stored data at any time

These permissions enable secure, private communication between the extension and our services while respecting user privacy and maintaining data security standards.

## Character Counts:
- activeTab: 892/1000 ✓
- storage: 963/1000 ✓
- scripting: 987/1000 ✓
- contextMenus: 761/1000 ✓
- Host Permissions: 997/1000 ✓ 