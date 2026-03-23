import { describe, it, expect } from "vitest";
import {
  buildCoverLetterPrompt,
  COVER_LETTER_SYSTEM_PROMPT,
} from "../lib/prompts";

describe("buildCoverLetterPrompt", () => {
  const baseInput = {
    jobTitle: "Software Engineer",
    company: "Acme Corp",
    jobDescription: "Build web apps",
    resumeText: "5 years React experience",
  };

  it("should include the job title, company, description, and resume", () => {
    const prompt = buildCoverLetterPrompt(baseInput);
    expect(prompt).toContain("Software Engineer");
    expect(prompt).toContain("Acme Corp");
    expect(prompt).toContain("Build web apps");
    expect(prompt).toContain("5 years React experience");
  });

  it("should default to professional tone, experience focus, medium length", () => {
    const prompt = buildCoverLetterPrompt(baseInput);
    expect(prompt).toContain("Tone: professional");
    expect(prompt).toContain("Focus on: experience");
    expect(prompt).toContain("Length: medium");
  });

  it("should respect custom preferences", () => {
    const prompt = buildCoverLetterPrompt({
      ...baseInput,
      preferences: { tone: "casual", focus: "skills", length: "short" },
    });
    expect(prompt).toContain("Tone: casual");
    expect(prompt).toContain("Focus on: skills");
    expect(prompt).toContain("Length: short");
  });

  it("should handle partial preferences, filling defaults", () => {
    const prompt = buildCoverLetterPrompt({
      ...baseInput,
      preferences: { tone: "enthusiastic" },
    });
    expect(prompt).toContain("Tone: enthusiastic");
    expect(prompt).toContain("Focus on: experience"); // default
    expect(prompt).toContain("Length: medium"); // default
  });

  it("should handle empty strings in input fields", () => {
    const prompt = buildCoverLetterPrompt({
      jobTitle: "",
      company: "",
      jobDescription: "",
      resumeText: "",
    });
    // Should still produce a valid prompt string, just with empty fields
    expect(prompt).toContain("Job Title:");
    expect(prompt).toContain("Company:");
  });
});

describe("COVER_LETTER_SYSTEM_PROMPT", () => {
  it("should be a non-empty string", () => {
    expect(typeof COVER_LETTER_SYSTEM_PROMPT).toBe("string");
    expect(COVER_LETTER_SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });

  it("should mention cover letter expertise", () => {
    expect(COVER_LETTER_SYSTEM_PROMPT.toLowerCase()).toContain("cover letter");
  });
});
