import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  extractJobFromHTML,
  extractTextFromResume,
  generateCoverLetter,
} from "../lib/ai";

describe("extractJobFromHTML", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns a configuration error when the OpenAI key is missing", async () => {
    const result = await extractJobFromHTML("<html></html>", "https://acme.com", "Role");

    expect(result).toEqual({
      success: false,
      error: "OpenAI API key not configured",
      jobData: null,
      confidence: 0,
      tokensUsed: 0,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a chat completions request and parses valid JSON content", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Senior Engineer",
                company: "Acme",
                pageType: "job",
                skills: ["TypeScript", "React"],
              }),
            },
          },
        ],
        usage: { total_tokens: 321 },
      }),
    });

    const result = await extractJobFromHTML(
      "<html><body><script>window.bad = true;</script><h1>Senior Engineer</h1></body></html>",
      "https://jobs.acme.com/roles/123",
      "Senior Engineer"
    );

    expect(result.success).toBe(true);
    expect(result.jobData?.company).toBe("Acme");
    expect(result.tokensUsed).toBe(321);

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(request.body));

    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(body.model).toBe("gpt-4-turbo-preview");
    expect(body.messages[1].content).toContain("Senior Engineer");
    expect(body.messages[1].content).not.toContain("window.bad");
  });

  it("recovers JSON content wrapped in extra text", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                'Here is the parsed result:\n{"title":"Designer","company":"Figma","pageType":"job"}\nThanks!',
            },
          },
        ],
        usage: { total_tokens: 88 },
      }),
    });

    const result = await extractJobFromHTML(
      "<html><body>Designer role</body></html>",
      "https://figma.com/jobs/1",
      "Designer"
    );

    expect(result.success).toBe(true);
    expect(result.jobData?.company).toBe("Figma");
    expect(result.tokensUsed).toBe(88);
  });

  it("calculates higher confidence for richer job results", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: "Staff Engineer",
                company: "Stripe",
                location: "Remote",
                description: "Build payments products",
                pageType: "job",
              }),
            },
          },
        ],
        usage: { total_tokens: 120 },
      }),
    });

    const result = await extractJobFromHTML(
      "<html><body>Staff Engineer</body></html>",
      "https://stripe.com/jobs/123",
      "Staff Engineer"
    );

    expect(result.success).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.6);
    expect(result.extractedFields).toEqual(
      expect.arrayContaining(["title", "company", "location", "description"])
    );
  });

  it("returns a structured failure when OpenAI responds with an error", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      text: async () => "rate limited",
    });

    const result = await extractJobFromHTML(
      "<html><body>Role</body></html>",
      "https://acme.com/jobs/1",
      "Role"
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("429");
    expect(result.jobData).toBeNull();
  });
});

describe("generateCoverLetter", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("throws when the OpenAI key is missing", async () => {
    await expect(
      generateCoverLetter({ title: "Engineer", company: "Acme" }, "resume text")
    ).rejects.toThrow("OpenAI API key not configured");
  });

  it("returns generated content and token usage from OpenAI", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Cover letter body" } }],
        usage: { total_tokens: 456 },
      }),
    });

    const result = await generateCoverLetter(
      { title: "Engineer", company: "Acme", requirements: ["TypeScript"] },
      "resume text"
    );

    expect(result).toEqual({ content: "Cover letter body", tokensUsed: 456 });
  });

  it("uses default preferences when none are provided", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Default preference letter" } }],
        usage: { total_tokens: 200 },
      }),
    });

    await generateCoverLetter(
      { title: "Engineer", company: "Acme" },
      "resume text"
    );

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(request.body));

    expect(body.messages[1].content).toContain("Tone: professional");
    expect(body.messages[1].content).toContain("Focus: experience");
    expect(body.messages[1].content).toContain("Length: medium");
  });

  it("uses custom preferences when they are provided", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Custom preference letter" } }],
        usage: { total_tokens: 201 },
      }),
    });

    await generateCoverLetter(
      { title: "Engineer", company: "Acme" },
      "resume text",
      { tone: "casual", focus: "skills", length: "short" }
    );

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(request.body));

    expect(body.messages[1].content).toContain("Tone: casual");
    expect(body.messages[1].content).toContain("Focus: skills");
    expect(body.messages[1].content).toContain("Length: short");
  });

  it("truncates resume text before sending it to OpenAI", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Long resume letter" } }],
        usage: { total_tokens: 202 },
      }),
    });

    await generateCoverLetter(
      { title: "Engineer", company: "Acme" },
      "x".repeat(9000)
    );

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(request.body));

    expect(body.messages[1].content).toContain("x".repeat(8000));
    expect(body.messages[1].content).not.toContain("x".repeat(8001));
  });

  it("wraps upstream request failures in a descriptive error", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(
      generateCoverLetter({ title: "Engineer", company: "Acme" }, "resume text")
    ).rejects.toThrow("Failed to generate cover letter: network down");
  });
});

describe("extractTextFromResume", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns a placeholder for PDF files without fetching", async () => {
    const text = await extractTextFromResume(
      "https://files.example.com/resume.pdf",
      "application/pdf"
    );

    expect(text).toContain("[PDF Resume Content - application/pdf]");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches the body text for Word documents", async () => {
    fetchMock.mockResolvedValue({
      text: async () => "Word resume contents",
    });

    const text = await extractTextFromResume(
      "https://files.example.com/resume.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    expect(text).toBe("Word resume contents");
  });

  it("fetches the body text for plain text documents", async () => {
    fetchMock.mockResolvedValue({
      text: async () => "Plain text resume",
    });

    const text = await extractTextFromResume(
      "https://files.example.com/resume.txt",
      "text/plain"
    );

    expect(text).toBe("Plain text resume");
  });

  it("returns a Word fallback when document extraction fails", async () => {
    fetchMock.mockRejectedValue(new Error("download failed"));

    const text = await extractTextFromResume(
      "https://files.example.com/resume.docx",
      "application/msword"
    );

    expect(text).toContain("Unable to extract text from Word document.");
  });

  it("returns a generic fallback when plain text extraction fails", async () => {
    fetchMock.mockRejectedValue(new Error("download failed"));

    const text = await extractTextFromResume(
      "https://files.example.com/resume.txt",
      "text/plain"
    );

    expect(text).toContain("Unable to extract text from document.");
  });
});
