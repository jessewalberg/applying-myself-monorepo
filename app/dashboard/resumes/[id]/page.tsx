"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    DocumentIcon,
    ArrowLeftIcon,
    CloudArrowDownIcon,
    TrashIcon,
    StarIcon,
    DocumentTextIcon,
    CalendarIcon,
    ComputerDesktopIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convexApi";
import { type GenericId as Id } from "convex/values";

export default function ResumeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const resumeId = params.id as Id<"resumes">;

    const [isDeleting, setIsDeleting] = useState(false);

    // Convex hooks
    const resume = useQuery(api.resumes.getResume, { resumeId });
    const downloadUrl = useQuery(api.resumes.getDownloadUrl, { resumeId });
    const deleteResume = useMutation(api.resumes.deleteResume);
    const setDefaultResume = useMutation(api.resumes.setDefault);

    const isLoading = resume === undefined;
    const resumeNotFound = resume === null;

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSetDefault = async () => {
        if (!resume) return;

        try {
            await setDefaultResume({ resumeId: resume._id });
        } catch (error) {
            console.error('Error setting default resume:', error);
            alert('Failed to set default resume. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (!resume) return;

        if (!confirm(`Are you sure you want to delete "${resume.filename}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteResume({ resumeId: resume._id });
            router.push('/dashboard/resumes');
        } catch (error) {
            console.error('Error deleting resume:', error);
            alert('Failed to delete resume. Please try again.');
            setIsDeleting(false);
        }
    };

    const handleDownload = () => {
        if (downloadUrl) {
            window.open(downloadUrl, '_blank');
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center mb-8">
                    <Link href="/dashboard/resumes" className="text-gray-500 hover:text-gray-700 mr-4">
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
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (resumeNotFound) {
        return (
            <div className="p-6">
                <div className="flex items-center mb-8">
                    <Link href="/dashboard/resumes" className="text-gray-500 hover:text-gray-700 mr-4">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Resume Not Found</h1>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center py-12">
                    <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Resume not found</h3>
                    <p className="text-gray-500 mb-6">
                        The resume you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
                    </p>
                    <Link href="/dashboard/resumes" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg">
                        Back to Resumes
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
                    <Link href="/dashboard/resumes" className="text-purple-600 hover:text-purple-700 mr-4 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <nav className="text-sm text-gray-500">
                        <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
                        <span className="mx-2">/</span>
                        <Link href="/dashboard/resumes" className="hover:text-gray-700">Resumes</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">{resume.filename}</span>
                    </nav>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">{resume.filename}</h1>
                            {resume.isDefault && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
                                    <StarIconSolid className="w-4 h-4 mr-1" />
                                    Default Resume
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600">
                            Resume details and management options
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {!resume.isDefault && (
                            <button
                                onClick={handleSetDefault}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                            >
                                <StarIcon className="w-4 h-4" />
                                <span>Set as Default</span>
                            </button>
                        )}
                        <button
                            onClick={handleDownload}
                            disabled={!downloadUrl}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                        >
                            <CloudArrowDownIcon className="w-4 h-4" />
                            <span>Download</span>
                        </button>
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
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* File Information */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <DocumentIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            File Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Filename</label>
                                <p className="text-sm text-gray-900 mt-1">{resume.filename}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">File Size</label>
                                <p className="text-sm text-gray-900 mt-1">{formatFileSize(resume.fileSize)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">File Type</label>
                                <p className="text-sm text-gray-900 mt-1">{resume.mimeType}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <div className="mt-1">
                                    {resume.extractedText ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            ✓ Text Extracted
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            ⏳ Processing
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Extracted Text */}
                    {resume.extractedText && (
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                Extracted Text
                            </h2>
                            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                    {resume.extractedText}
                                </pre>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                This text was automatically extracted from your resume and is used for generating cover letters.
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
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
                                Generate Cover Letter
                            </Link>
                            <Link
                                href="/dashboard/jobs/new"
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg text-center block"
                            >
                                Add Job Application
                            </Link>
                            {downloadUrl && (
                                <button
                                    onClick={handleDownload}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Download Resume
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                            Timeline
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Uploaded</p>
                                    <p className="text-xs text-gray-500">{formatDate(resume.createdAt)}</p>
                                </div>
                            </div>
                            {resume.createdAt !== resume.updatedAt && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Last Updated</p>
                                        <p className="text-xs text-gray-500">{formatDate(resume.updatedAt)}</p>
                                    </div>
                                </div>
                            )}
                            {resume.extractedText && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Text Extracted</p>
                                        <p className="text-xs text-gray-500">AI processing completed</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Technical Details */}
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                <ComputerDesktopIcon className="w-5 h-5 text-gray-600" />
                            </div>
                            Technical Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="font-medium text-gray-500">Resume ID:</span>
                                <p className="text-gray-900 font-mono text-xs break-all">{resume._id}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">File ID:</span>
                                <p className="text-gray-900 font-mono text-xs break-all">{resume.fileId}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">Creation Time:</span>
                                <p className="text-gray-900 text-xs">{new Date(resume._creationTime).toISOString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 