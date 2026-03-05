/**
 * Tiny store that carries data from the homepage hero form
 * to the /generate page across client-side navigation.
 *
 * - `jobDescription` is persisted in sessionStorage (survives refresh).
 * - `resumeFile` is kept in a module-level variable (only survives
 *   client-side nav, which is the expected path).
 */

const JOB_DESC_KEY = "am_draft_jobDescription";

let _resumeFile: File | null = null;

export const homepageDraft = {
  setJobDescription(text: string) {
    try {
      sessionStorage.setItem(JOB_DESC_KEY, text);
    } catch {
      // SSR or quota — ignore
    }
  },

  getJobDescription(): string {
    try {
      return sessionStorage.getItem(JOB_DESC_KEY) ?? "";
    } catch {
      return "";
    }
  },

  setResumeFile(file: File | null) {
    _resumeFile = file;
  },

  getResumeFile(): File | null {
    return _resumeFile;
  },

  /** Consume and clear all draft data. */
  consume() {
    const jobDescription = this.getJobDescription();
    const resumeFile = _resumeFile;

    // Clear
    try {
      sessionStorage.removeItem(JOB_DESC_KEY);
    } catch {
      // ignore
    }
    _resumeFile = null;

    return { jobDescription, resumeFile };
  },
};
