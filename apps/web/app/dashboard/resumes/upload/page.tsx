"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { useMutation } from "convex/react";
import { api } from '@app/convex-client';
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function UploadResumePage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convex mutations
  const uploadResume = useMutation(api.resumes.upload);
  const completeUpload = useMutation(api.resumes.completeUpload);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      selectFile(e.target.files[0]);
    }
  };

  const selectFile = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    // Auto-generate name from filename
    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    setResumeName(nameWithoutExtension);
  };

  const handleUpload = async () => {
    if (!selectedFile || !resumeName.trim()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get upload URL from Convex
      setUploadProgress(10);
      const { uploadUrl } = await uploadResume({
        filename: resumeName,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
      });

      // Step 2: Upload file to Convex storage
      setUploadProgress(30);

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      setUploadProgress(70);
      const { storageId } = await result.json();

      // Step 3: Complete the upload and create resume record
      setUploadProgress(90);
      await completeUpload({
        filename: resumeName,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        storageId,
      });

      setUploadProgress(100);

      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect back to resumes list
      router.push("/dashboard/resumes");
    } catch (error) {
      console.error('Error uploading file:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        selectedFile: selectedFile ? {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type
        } : null
      });
      alert(`Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-8">
          <Link
            href="/dashboard/resumes"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Resumes</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Upload Resume</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload a new resume to your library.
          </p>
        </div>

        <div className="max-w-2xl">
          {isUploading ? (
            <div className="card">
              <div className="text-center py-8">
                <div className="mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                </div>
                <p className="text-gray-600 mb-2">Uploading resume...</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select File</h2>

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  {selectedFile ? (
                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        {selectedFile.name}
                      </p>
                      <p className="text-gray-500 mb-4">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setResumeName("");
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Choose Different File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop your resume here
                      </p>
                      <p className="text-gray-500 mb-4">
                        or click to browse files
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary"
                      >
                        Choose File
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-2 text-center">
                  Supports PDF, DOC, DOCX up to 10MB
                </p>
              </div>

              {/* Resume Details */}
              {selectedFile && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume Details</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Resume Name *</label>
                      <input
                        type="text"
                        value={resumeName}
                        onChange={(e) => setResumeName(e.target.value)}
                        className="input-field"
                        placeholder="e.g., Software Engineer Resume"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Give your resume a descriptive name for easy identification.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">File Information</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Filename:</span> {selectedFile.name}</p>
                        <p><span className="font-medium">Size:</span> {formatFileSize(selectedFile.size)}</p>
                        <p><span className="font-medium">Type:</span> {selectedFile.type}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <Link
                  href="/dashboard/resumes"
                  className="btn-secondary"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleUpload}
                  className="btn-primary"
                  disabled={!selectedFile || !resumeName.trim()}
                >
                  Upload Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 