"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { jsPDF as JsPdf } from "jspdf";
import {
    DocumentTextIcon,
    ArrowLeftIcon,
    ClipboardDocumentIcon,
    TrashIcon,
    CalendarIcon,
    BuildingOfficeIcon,
    BriefcaseIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    SparklesIcon,
    CloudArrowDownIcon,
    DocumentArrowDownIcon
} from "@heroicons/react/24/outline";
import { useQuery, useMutation } from "convex/react";
import { api } from '@applyingmyself/convex-client';
import { type GenericId as Id } from "convex/values";

const sanitizeFilenamePart = (value?: string | null) =>
    (value || "")
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

const buildCoverLetterFilename = (
    company?: string | null,
    jobTitle?: string | null,
    extension: "docx" | "pdf" = "docx"
) => {
    const companyPart = sanitizeFilenamePart(company) || "Company";
    const titlePart = sanitizeFilenamePart(jobTitle) || "Position";
    return `Cover_Letter_${companyPart}_${titlePart}.${extension}`;
};

const splitTextIntoPdfLines = (pdf: JsPdf, text: string, maxWidth: number): string[] =>
    text
        .split(/\r?\n/)
        .flatMap((line) => {
            const trimmed = line.trim();
            if (!trimmed) return [""];
            return pdf.splitTextToSize(trimmed, maxWidth) as string[];
        });

const writeWrappedPdfBlock = (
    pdf: JsPdf,
    text: string,
    currentY: number,
    options: {
        fontSize: number;
        fontStyle: "bold" | "normal" | "italic";
        maxWidth: number;
        pageHeight: number;
        margin: number;
        gapAfter: number;
    }
) => {
    const trimmed = text.trim();
    if (!trimmed) {
        return currentY;
    }

    pdf.setFontSize(options.fontSize);
    pdf.setFont("helvetica", options.fontStyle);

    const lines = splitTextIntoPdfLines(pdf, trimmed, options.maxWidth);
    const lineHeight = Math.max(pdf.getTextDimensions("Ag").h * 1.2, 6);
    const bottomLimit = options.pageHeight - options.margin;
    let nextY = currentY;
    let index = 0;

    while (index < lines.length) {
        const availableHeight = bottomLimit - nextY;
        const linesThatFit = Math.max(Math.floor(availableHeight / lineHeight), 0);

        if (linesThatFit === 0) {
            pdf.addPage();
            nextY = options.margin;
            continue;
        }

        const chunk = lines.slice(index, index + linesThatFit);
        pdf.text(chunk, options.margin, nextY);
        nextY += chunk.length * lineHeight;
        index += chunk.length;

        if (index < lines.length) {
            pdf.addPage();
            nextY = options.margin;
        }
    }

    return nextY + options.gapAfter;
};

export default function CoverLetterDetailPage() {
    const params = useParams();
    const router = useRouter();
    const coverLetterId = params.id as Id<"coverLetters">;

    const [isDeleting, setIsDeleting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const coverLetter = useQuery(api.coverLetters.getCoverLetter, { coverLetterId });
    const deleteCoverLetter = useMutation(api.coverLetters.deleteCoverLetter);

    const isLoading = coverLetter === undefined;
    const coverLetterNotFound = coverLetter === null;
    const isGenerating = coverLetter?.content === "Generating your personalized cover letter...";

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = async () => {
        if (!coverLetter) return;

        if (!confirm(`Are you sure you want to delete this cover letter for ${coverLetter.company}? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteCoverLetter({ coverLetterId: coverLetter._id });
            router.push('/dashboard/cover-letters');
        } catch (error) {
            console.error('Error deleting cover letter:', error);
            alert('Failed to delete cover letter. Please try again.');
            setIsDeleting(false);
        }
    };

    const handleCopyToClipboard = async () => {
        if (!coverLetter || isGenerating) return;

        try {
            await navigator.clipboard.writeText(coverLetter.content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            alert('Failed to copy to clipboard');
        }
    };

    const handleDownloadDocx = async () => {
        if (!coverLetter || isGenerating) return;

        try {
            const { Document, Packer, Paragraph, TextRun } = await import('docx');

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Cover Letter - ${coverLetter.jobTitle || 'Position'}`,
                                    bold: true,
                                    size: 32,
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: coverLetter.company ? `${coverLetter.company}` : '',
                                    bold: true,
                                    size: 24,
                                }),
                            ],
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `Generated on ${new Date(coverLetter.createdAt || coverLetter._creationTime).toLocaleDateString()}`,
                                    italics: true,
                                    size: 20,
                                }),
                            ],
                        }),
                        new Paragraph({ children: [] }),
                        ...coverLetter.content.split('\n\n').map((paragraph: string) =>
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: paragraph.trim(),
                                        size: 24,
                                    }),
                                ],
                            })
                        ),
                    ],
                }],
            });

            const blob = await Packer.toBlob(doc);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = buildCoverLetterFilename(coverLetter.company, coverLetter.jobTitle, "docx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to generate DOCX:', error);
            alert('Failed to generate Word document. Please try again.');
        }
    };

    const handleDownloadPdf = async () => {
        if (!coverLetter || isGenerating) return;

        try {
            const { jsPDF } = await import('jspdf');

            const pdf = new jsPDF();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pageWidth - (margin * 2);
            let currentY = 30;

            currentY = writeWrappedPdfBlock(pdf, `Cover Letter - ${coverLetter.jobTitle || 'Position'}`, currentY, {
                fontSize: 16,
                fontStyle: 'bold',
                maxWidth,
                pageHeight,
                margin,
                gapAfter: 6,
            });

            if (coverLetter.company) {
                currentY = writeWrappedPdfBlock(pdf, coverLetter.company, currentY, {
                    fontSize: 14,
                    fontStyle: 'bold',
                    maxWidth,
                    pageHeight,
                    margin,
                    gapAfter: 6,
                });
            }

            currentY = writeWrappedPdfBlock(
                pdf,
                `Generated on ${new Date(coverLetter.createdAt || coverLetter._creationTime).toLocaleDateString()}`,
                currentY,
                {
                    fontSize: 10,
                    fontStyle: 'italic',
                    maxWidth,
                    pageHeight,
                    margin,
                    gapAfter: 10,
                }
            );

            coverLetter.content
                .split(/\n{2,}/)
                .map((paragraph: string) => paragraph.trim())
                .filter(Boolean)
                .forEach((paragraph: string) => {
                    currentY = writeWrappedPdfBlock(pdf, paragraph, currentY, {
                        fontSize: 12,
                        fontStyle: 'normal',
                        maxWidth,
                        pageHeight,
                        margin,
                        gapAfter: 8,
                    });
                });

            const filename = buildCoverLetterFilename(coverLetter.company, coverLetter.jobTitle, "pdf");
            pdf.save(filename);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center mb-8">
                    <Link href="/dashboard/cover-letters" className="text-primary hover:text-primary/80 mr-4 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="h-8 bg-muted rounded w-48 animate-pulse mb-2"></div>
                        <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                    </div>
                </div>
                <div className="rounded-xl p-6 bg-card/60 border border-border/50">
                    <div className="animate-pulse">
                        <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-muted rounded w-full"></div>
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-4 bg-muted rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (coverLetterNotFound) {
        return (
            <div className="p-6">
                <div className="flex items-center mb-8">
                    <Link href="/dashboard/cover-letters" className="text-primary hover:text-primary/80 mr-4 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Cover Letter Not Found</h1>
                    </div>
                </div>
                <div className="rounded-xl p-6 bg-card/60 border border-border/50 text-center py-12">
                    <ExclamationTriangleIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Cover letter not found</h3>
                    <p className="text-muted-foreground mb-6">
                        The cover letter you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
                    </p>
                    <Link href="/dashboard/cover-letters" className="btn-primary">
                        Back to Cover Letters
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <Link href="/dashboard/cover-letters" className="text-primary hover:text-primary/80 mr-4 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <nav className="text-sm text-muted-foreground">
                        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
                        <span className="mx-2">/</span>
                        <Link href="/dashboard/cover-letters" className="hover:text-foreground">Cover Letters</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground font-medium">
                            {coverLetter.jobTitle || "Cover Letter"}
                        </span>
                    </nav>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                                {coverLetter.jobTitle || "Cover Letter"}
                            </h1>
                            {isGenerating ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-amber-400 mr-2"></div>
                                    Generating...
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                    Complete
                                </span>
                            )}
                        </div>
                        <p className="text-muted-foreground">
                            {coverLetter.company ? `Cover letter for ${coverLetter.company}` : "Cover letter details"}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {!isGenerating && (
                            <>
                                <button
                                    onClick={handleCopyToClipboard}
                                    className="btn-primary flex items-center justify-center space-x-2"
                                >
                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                    <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
                                </button>
                                <button
                                    onClick={handleDownloadDocx}
                                    className="btn-secondary flex items-center justify-center space-x-2"
                                >
                                    <DocumentArrowDownIcon className="w-4 h-4" />
                                    <span>DOCX</span>
                                </button>
                                <button
                                    onClick={handleDownloadPdf}
                                    className="btn-secondary flex items-center justify-center space-x-2"
                                >
                                    <CloudArrowDownIcon className="w-4 h-4" />
                                    <span>PDF</span>
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-500/15 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg font-semibold hover:bg-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            <TrashIcon className="w-4 h-4" />
                            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl p-6 bg-card/60 border border-border/50">
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            <div className="p-2 bg-primary/10 rounded-lg mr-3">
                                <DocumentTextIcon className="w-5 h-5 text-primary" />
                            </div>
                            Cover Letter
                        </h2>

                        {isGenerating ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground mb-2">Generating your personalized cover letter...</p>
                                <p className="text-sm text-muted-foreground/70">This usually takes 30-60 seconds</p>
                            </div>
                        ) : (
                            <div className="prose max-w-none">
                                <div className="bg-muted/50 rounded-lg p-6 border border-border/50">
                                    <pre className="whitespace-pre-wrap font-sans text-foreground/90 leading-relaxed">
                                        {coverLetter.content}
                                    </pre>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Ready to copy and use in your applications</span>
                                    <button
                                        onClick={handleCopyToClipboard}
                                        className="text-primary hover:text-primary/80 font-medium flex items-center space-x-1"
                                    >
                                        <ClipboardDocumentIcon className="w-4 h-4" />
                                        <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Job Details */}
                    <div className="rounded-xl p-6 bg-card/60 border border-border/50">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                                <BriefcaseIcon className="w-5 h-5 text-blue-400" />
                            </div>
                            Job Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="font-medium text-muted-foreground">Position:</span>
                                <p className="text-foreground mt-1">{coverLetter.jobTitle || "Not specified"}</p>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Company:</span>
                                <p className="text-foreground mt-1 flex items-center">
                                    <BuildingOfficeIcon className="w-4 h-4 mr-1 text-muted-foreground" />
                                    {coverLetter.company || "Not specified"}
                                </p>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Credits Used:</span>
                                <p className="text-foreground mt-1 flex items-center">
                                    <SparklesIcon className="w-4 h-4 mr-1 text-muted-foreground" />
                                    {coverLetter.creditsUsed} credits
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Generation Details */}
                    <div className="rounded-xl p-6 bg-card/60 border border-border/50">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            <div className="p-2 bg-primary/10 rounded-lg mr-3">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                            </div>
                            Generation Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Generated</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(coverLetter.createdAt || coverLetter._creationTime)}</p>
                                </div>
                            </div>
                            {coverLetter.preferences && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Preferences</p>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            {coverLetter.preferences.tone && (
                                                <p>Tone: {coverLetter.preferences.tone}</p>
                                            )}
                                            {coverLetter.preferences.length && (
                                                <p>Length: {coverLetter.preferences.length}</p>
                                            )}
                                            {coverLetter.preferences.focus && (
                                                <p>Focus: {coverLetter.preferences.focus}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-xl p-6 bg-card/60 border border-border/50">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            <div className="p-2 bg-emerald-500/10 rounded-lg mr-3">
                                <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                            </div>
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <Link
                                href="/dashboard/cover-letters/new"
                                className="btn-primary w-full text-center block"
                            >
                                Generate New Letter
                            </Link>
                            <Link
                                href="/dashboard/jobs/new"
                                className="btn-secondary w-full text-center block"
                            >
                                Add Job Application
                            </Link>
                            {!isGenerating && (
                                <>
                                    <button
                                        onClick={handleCopyToClipboard}
                                        className="btn-secondary w-full"
                                    >
                                        {isCopied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
                                    </button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={handleDownloadDocx}
                                            className="btn-secondary flex items-center justify-center space-x-1 text-sm"
                                        >
                                            <DocumentArrowDownIcon className="w-4 h-4" />
                                            <span>DOCX</span>
                                        </button>
                                        <button
                                            onClick={handleDownloadPdf}
                                            className="btn-secondary flex items-center justify-center space-x-1 text-sm"
                                        >
                                            <CloudArrowDownIcon className="w-4 h-4" />
                                            <span>PDF</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Technical Details */}
                    <div className="rounded-xl p-6 bg-card/60 border border-border/50">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            <div className="p-2 bg-muted rounded-lg mr-3">
                                <DocumentTextIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            Technical Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="font-medium text-muted-foreground">Cover Letter ID:</span>
                                <p className="text-foreground font-mono text-xs break-all">{coverLetter._id}</p>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Resume ID:</span>
                                <p className="text-foreground font-mono text-xs break-all">{coverLetter.resumeId}</p>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Creation Time:</span>
                                <p className="text-foreground text-xs">{new Date(coverLetter._creationTime).toISOString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
