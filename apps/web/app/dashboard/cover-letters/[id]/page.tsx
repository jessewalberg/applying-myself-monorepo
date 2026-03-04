"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

export default function CoverLetterDetailPage() {
    const params = useParams();
    const router = useRouter();
    const coverLetterId = params.id as Id<"coverLetters">;

    const [isDeleting, setIsDeleting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Convex hooks
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

            // Create a new document
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
                        new Paragraph({ children: [] }), // Empty paragraph for spacing
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

            // Generate and download the document
            const blob = await Packer.toBlob(doc);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Cover_Letter_${coverLetter.company || 'Company'}_${coverLetter.jobTitle || 'Position'}.docx`.replace(/[^a-zA-Z0-9]/g, '_');
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
            const margin = 20;
            const maxWidth = pageWidth - (margin * 2);

            // Title
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Cover Letter - ${coverLetter.jobTitle || 'Position'}`, margin, 30);

            // Company
            if (coverLetter.company) {
                pdf.setFontSize(14);
                pdf.text(coverLetter.company, margin, 45);
            }

            // Date
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'italic');
            pdf.text(`Generated on ${new Date(coverLetter.createdAt || coverLetter._creationTime).toLocaleDateString()}`, margin, coverLetter.company ? 60 : 50);

            // Content
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');

            const startY = coverLetter.company ? 80 : 70;
            const lines = pdf.splitTextToSize(coverLetter.content, maxWidth);
            pdf.text(lines, margin, startY);

            // Download
            const filename = `Cover_Letter_${coverLetter.company || 'Company'}_${coverLetter.jobTitle || 'Position'}.pdf`.replace(/[^a-zA-Z0-9]/g, '_');
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
                    <Link href="/dashboard/cover-letters" className="text-purple-600 hover:text-purple-700 mr-4 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
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
                    <Link href="/dashboard/cover-letters" className="text-purple-600 hover:text-purple-700 mr-4 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Cover Letter Not Found</h1>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center py-12">
                    <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Cover letter not found</h3>
                    <p className="text-gray-500 mb-6">
                        The cover letter you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
                    </p>
                    <Link href="/dashboard/cover-letters" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg">
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
                    <Link href="/dashboard/cover-letters" className="text-purple-600 hover:text-purple-700 mr-4 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <nav className="text-sm text-gray-500">
                        <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
                        <span className="mx-2">/</span>
                        <Link href="/dashboard/cover-letters" className="hover:text-gray-700">Cover Letters</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">
                            {coverLetter.jobTitle || "Cover Letter"}
                        </span>
                    </nav>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                {coverLetter.jobTitle || "Cover Letter"}
                            </h1>
                            {isGenerating ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-yellow-600 mr-2"></div>
                                    Generating...
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                    Complete
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600">
                            {coverLetter.company ? `Cover letter for ${coverLetter.company}` : "Cover letter details"}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {!isGenerating && (
                            <>
                                <button
                                    onClick={handleCopyToClipboard}
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                                >
                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                    <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
                                </button>
                                <button
                                    onClick={handleDownloadDocx}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                                >
                                    <DocumentArrowDownIcon className="w-4 h-4" />
                                    <span>DOCX</span>
                                </button>
                                <button
                                    onClick={handleDownloadPdf}
                                    className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                                >
                                    <CloudArrowDownIcon className="w-4 h-4" />
                                    <span>PDF</span>
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
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
                    {/* Cover Letter Content */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            Cover Letter
                        </h2>

                        {isGenerating ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 mb-2">Generating your personalized cover letter...</p>
                                <p className="text-sm text-gray-500">This usually takes 30-60 seconds</p>
                            </div>
                        ) : (
                            <div className="prose max-w-none">
                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                    <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                                        {coverLetter.content}
                                    </pre>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                    <span>Ready to copy and use in your applications</span>
                                    <button
                                        onClick={handleCopyToClipboard}
                                        className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
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
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            Job Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="font-medium text-gray-500">Position:</span>
                                <p className="text-gray-900 mt-1">{coverLetter.jobTitle || "Not specified"}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">Company:</span>
                                <p className="text-gray-900 mt-1 flex items-center">
                                    <BuildingOfficeIcon className="w-4 h-4 mr-1 text-gray-400" />
                                    {coverLetter.company || "Not specified"}
                                </p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">Credits Used:</span>
                                <p className="text-gray-900 mt-1 flex items-center">
                                    <SparklesIcon className="w-4 h-4 mr-1 text-gray-400" />
                                    {coverLetter.creditsUsed} credits
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Generation Details */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                            Generation Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Generated</p>
                                    <p className="text-xs text-gray-500">{formatDate(coverLetter.createdAt || coverLetter._creationTime)}</p>
                                </div>
                            </div>
                            {coverLetter.preferences && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Preferences</p>
                                        <div className="text-xs text-gray-500 space-y-1">
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
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg mr-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            </div>
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <Link
                                href="/dashboard/cover-letters/new"
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg text-center block"
                            >
                                Generate New Letter
                            </Link>
                            <Link
                                href="/dashboard/jobs/new"
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg text-center block"
                            >
                                Add Job Application
                            </Link>
                            {!isGenerating && (
                                <>
                                    <button
                                        onClick={handleCopyToClipboard}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg"
                                    >
                                        {isCopied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
                                    </button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={handleDownloadDocx}
                                            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-1 text-sm"
                                        >
                                            <DocumentArrowDownIcon className="w-4 h-4" />
                                            <span>DOCX</span>
                                        </button>
                                        <button
                                            onClick={handleDownloadPdf}
                                            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-1 text-sm"
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
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                            </div>
                            Technical Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="font-medium text-gray-500">Cover Letter ID:</span>
                                <p className="text-gray-900 font-mono text-xs break-all">{coverLetter._id}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">Resume ID:</span>
                                <p className="text-gray-900 font-mono text-xs break-all">{coverLetter.resumeId}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">Creation Time:</span>
                                <p className="text-gray-900 text-xs">{new Date(coverLetter._creationTime).toISOString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
