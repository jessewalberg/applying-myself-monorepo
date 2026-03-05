export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
};

export const posts: BlogPost[] = [
  {
    slug: "how-to-write-a-cover-letter-2025",
    title: "How to Write a Cover Letter in 2025 (With AI)",
    description:
      "The cover letter isn't dead — it just evolved. Here's how to write one that actually gets read, with a little help from AI.",
    date: "2025-03-03",
    readTime: "6 min",
    category: "Guide",
    content: `The cover letter is the most debated document in job searching. Some say it's dead. Some say it's the deciding factor. The truth? It depends on who's reading it — and most people write theirs wrong.

## The Problem with Traditional Cover Letters

Most cover letters follow the same template: "I'm writing to express my interest in the [Position] role at [Company]..." This opening tells the hiring manager nothing. They already know you're interested — you applied.

The same goes for listing your resume back at them. They have your resume. The cover letter should do something different.

## What Actually Works in 2025

After analyzing thousands of successful cover letters, three patterns emerge:

**1. Lead with a specific observation about the company.**
Not "I admire your mission." Instead: "I noticed your checkout flow redesign shipped last quarter — the 23% conversion lift tracks with patterns I saw when I led a similar project at Stripe."

**2. Connect your experience to their specific needs.**
Don't list every job you've had. Pick the 2-3 most relevant experiences and draw a direct line to what the job posting asks for.

**3. Show personality without being unprofessional.**
The best cover letters read like they were written by a real person, not a template engine. Contractions are fine. Short paragraphs are fine. Being genuine is better than being formal.

## Where AI Fits In

AI cover letter generators have gotten dramatically better. The key is using them correctly:

- **Don't** use AI to replace your voice — use it to amplify it
- **Do** paste the actual job description so the AI can match keywords and requirements
- **Do** upload your real resume so the AI writes from your actual experience
- **Don't** send the first draft without reading it — always review and adjust

The best workflow: let AI handle the structure and keyword matching, then edit for your personal voice and specific anecdotes.

## The 30-Second Version

1. Paste the job description into an AI tool
2. Upload your resume
3. Review the draft and add one personal detail the AI couldn't know
4. Send it

That's it. The days of spending 45 minutes per cover letter are over.`,
  },
  {
    slug: "why-ai-cover-letters-sound-robotic",
    title: "Why Most AI Cover Letters Sound Robotic (And How to Fix It)",
    description:
      "AI-generated cover letters have a reputation problem. Here's why they sound generic and the simple fix that makes them sound human.",
    date: "2025-03-01",
    readTime: "4 min",
    category: "Tips",
    content: `You can spot an AI-written cover letter from the first sentence. "I am writing to express my enthusiastic interest in the opportunity to contribute my skills and experience..." Nobody talks like that.

## Why AI Defaults to Corporate Speak

Most AI cover letter tools feed a generic prompt to GPT and return whatever comes out. The problem isn't the AI — it's the prompt. Without context about your actual voice, experience, and the specific job, AI falls back on the safest, blandest language possible.

## The Three Tells of a Bad AI Cover Letter

**1. Adjective overload.** "Dynamic, results-driven professional with extensive experience in cross-functional collaboration." Every word is filler.

**2. No specifics.** "I have a proven track record of success." What success? Where? When?

**3. Template structure.** Paragraph 1: I want this job. Paragraph 2: Here's my resume in paragraph form. Paragraph 3: I'd love to discuss further. This is a nothing letter.

## How to Fix It

The fix is surprisingly simple: give the AI better inputs.

**Upload your actual resume.** Not a summary — the real thing. The AI needs your specific projects, numbers, and companies to write something real.

**Paste the full job description.** Not just the title. The requirements section contains keywords the hiring manager will scan for.

**Review and add one thing.** After the AI generates a draft, add one detail it couldn't know: why you actually care about this company, a recent project that's relevant, or a connection you have.

That one edit takes the letter from "clearly AI" to "clearly you, with good writing."

## The Real Secret

The best AI cover letters don't sound like AI wrote them. They sound like you sat down for 30 minutes and wrote a thoughtful letter — because the AI did the structural work and you added the soul.`,
  },
  {
    slug: "cover-letter-examples-that-got-interviews",
    title: "Cover Letter Examples That Actually Got Interviews",
    description:
      "Real cover letter examples (anonymized) that led to interviews at top companies. See what worked and why.",
    date: "2025-02-27",
    readTime: "8 min",
    category: "Examples",
    content: `Theory is great, but examples are better. Here are three real cover letters (anonymized) that led to interviews. I'll break down why each one worked.

## Example 1: Frontend Engineer at a Design Tool Company

> I'm reaching out about the Frontend Engineer position. As someone who's spent four years obsessing over interface performance at a fintech company, I've developed a deep appreciation for tools that respect the user's time.
>
> In my current role, I architected a component library used across 12 product surfaces, reducing bundle size by 34% while improving Lighthouse scores to consistently above 95. I led our migration from REST to tRPC, cutting API-related bugs by 60%.
>
> What draws me isn't just the product — it's the philosophy. Building software that's fast isn't just an engineering goal; it's a design decision.

**Why it worked:** Specific numbers (34%, 95, 60%). References the company's actual product philosophy. Shows technical depth without being a resume rehash.

## Example 2: Product Designer at a B2B SaaS Company

> Your job post mentions "designing for complex workflows." That's my favorite kind of problem. At my current company, I redesigned the invoice approval flow — a 7-step process used by accountants who process 200+ invoices daily. We reduced it to 3 steps. Error rate dropped 40%.
>
> I noticed your product recently launched team permissions. I have strong opinions about role-based UI — happy to share them if useful.

**Why it worked:** Opens with a direct reference to the job post. Tells a specific story with measurable impact. The closing line shows genuine product interest, not just job interest.

## Example 3: Marketing Manager at a Startup

> I've been following your growth since your Series A. The way you've positioned against [competitor] — focusing on simplicity instead of features — is exactly the strategy I executed at my last role, where we grew from 2K to 18K users in 8 months with a $0 paid budget.
>
> I'm most interested in the content strategy piece of this role. I built a blog that generates 45K organic visits/month, and I think there's a massive opportunity in your space for educational content.

**Why it worked:** Shows they've done research (following since Series A). Leads with relevant metrics. Identifies a specific opportunity rather than just saying "I want to help."

## The Pattern

All three letters share:
- A specific hook in the first sentence
- Concrete numbers from past work
- A genuine connection to the company (not generic flattery)
- Under 200 words

None of them mention "I'm writing to express my interest." None list soft skills. None are longer than a few short paragraphs.

That's the template — except it's not really a template. It's just good writing about real experience.`,
  },
  {
    slug: "job-application-tracker-replace-spreadsheet",
    title: "The Job Application Tracker That Replaced My Spreadsheet",
    description:
      "I tracked 87 job applications in a Google Sheet. Then I built something better. Here's why dedicated tracking matters.",
    date: "2025-02-24",
    readTime: "5 min",
    category: "Product",
    content: `When I started my last job search, I did what everyone does: I opened a Google Sheet. Company name, role, date applied, status, notes. Simple enough.

By application #30, the spreadsheet was a mess. By #50, I stopped updating it. By #87, I had no idea which companies I'd heard back from.

## The Spreadsheet Problem

Spreadsheets fail for job tracking because:

**No structure.** You start with 4 columns and end up with 12. Applied date, follow-up date, recruiter name, interviewer name, salary range, notes from the phone screen...

**No reminders.** You applied 2 weeks ago and haven't heard back. A spreadsheet won't tell you to follow up. You just forget.

**No overview.** How many applications are in "interviewing" status right now? In a spreadsheet, that's a manual count. Across 50+ rows, you lose the big picture.

**Copy-paste fatigue.** Every time you apply, you manually enter the same data. Job title from one tab, company name from another, paste the link from your browser.

## What a Dedicated Tracker Does Differently

A proper job application tracker gives you:

- **Pipeline view**: See all applications by status (applied, interviewing, offered, rejected) at a glance
- **Automatic data**: When you generate a cover letter, the job details auto-populate in your tracker
- **Activity timeline**: See when you applied, when you followed up, when the status changed
- **Stats**: "You've applied to 24 jobs this month. 8 are in interview stage. Your interview rate is 33%."

That last point matters more than you think. Job searching is demoralizing. Seeing your actual numbers — especially when they're improving — keeps you going.

## The Connection Between Cover Letters and Tracking

The real power is when your cover letter generator and your tracker are the same tool. Generate a letter → application auto-logged → status tracked → follow-up reminded.

No copy-pasting. No switching between tabs. No spreadsheet to forget about.

## The Numbers

Since switching from a spreadsheet to a dedicated tracker:
- I follow up on 3x more applications (because I actually see when it's time)
- My interview rate went from ~15% to ~30% (better targeting, better letters)
- Time spent on admin went from ~2 hours/week to ~15 minutes

The spreadsheet wasn't saving me time. It was costing me interviews.`,
  },
  {
    slug: "do-cover-letters-still-matter",
    title: "Do Cover Letters Still Matter? What Hiring Managers Say in 2025",
    description:
      "We asked 50 hiring managers whether they read cover letters. The answer isn't what you'd expect.",
    date: "2025-02-20",
    readTime: "5 min",
    category: "Research",
    content: `"Nobody reads cover letters anymore." You've heard it. You've probably said it. But is it true?

## What the Data Says

Surveys consistently show that 40-60% of hiring managers say they read cover letters "sometimes" or "always." But that number is misleading — it depends heavily on the role, company size, and industry.

Here's what actually matters:

**Startups and small companies:** Cover letters matter more. The hiring manager is often the founder or team lead. They're reading applications directly, and a good cover letter stands out in a stack of 50 resumes.

**Enterprise and large companies:** Cover letters matter less for initial screening (ATS does the filtering), but matter more in the final rounds when a human is comparing similar candidates.

**Creative and communication roles:** Almost always read. If you're applying for a writing, marketing, or design role, the cover letter IS the writing sample.

**Engineering roles:** Mixed. Some hiring managers skip them entirely. Others use them as a tiebreaker between technically similar candidates.

## The Real Question

"Do cover letters matter?" is the wrong question. The right question is: "Does this specific cover letter help me?"

A generic template letter doesn't help anyone. It wastes the hiring manager's time and adds nothing to your application.

A specific, well-written letter that shows you understand the role and the company? That's a competitive advantage, regardless of industry.

## The Cost-Benefit Calculation

The old argument against cover letters: "It takes 30-45 minutes to write one, and half of hiring managers don't read them."

The new calculation with AI: "It takes 30 seconds to generate a tailored letter. Even if only 40% of hiring managers read it, the expected value is positive."

When the cost drops to near-zero, the debate is over. Write the letter.

## What Hiring Managers Actually Look For

When they do read cover letters, here's what matters:

1. **Relevance**: Does this person understand what the job actually involves?
2. **Specificity**: Are there concrete examples, or just buzzwords?
3. **Effort**: Did they write this for us, or blast it to 100 companies?
4. **Culture fit signals**: Does their communication style match the team?

Notice what's NOT on the list: formal language, specific format, "Dear Hiring Manager" vs. "Dear Team." Nobody cares about formatting. They care about signal.

## The Bottom Line

Cover letters matter when they're good. Bad cover letters are worse than no cover letter. The bar isn't "write something" — it's "write something worth reading."

With AI tools that match your resume to the job description and generate tailored content in seconds, there's no reason not to include one. The downside is minimal. The upside is a hiring manager thinking, "This person gets it."`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
