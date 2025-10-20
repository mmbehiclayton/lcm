'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/forms/FileUpload';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setUploadResult(null);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadResult(result);
      
      // Redirect to analysis page after successful upload
      setTimeout(() => {
        router.push(`/analysis?uploadId=${result.uploadId}`);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Upload className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Upload Data</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Your Real Estate Data</h1>
          <p className="mt-4 text-lg text-gray-600">
            Upload CSV or Excel files containing your property data to begin analysis
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {!uploadResult ? (
            <>
              <FileUpload
                onFileSelect={handleFileSelect}
                onRemove={handleRemove}
                selectedFile={selectedFile || undefined}
                isLoading={isUploading}
                error={error || undefined}
              />

              {selectedFile && (
                <div className="mt-6">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload and Analyze
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your file has been processed and {uploadResult.propertyCount} properties have been analyzed.
              </p>
              
              {uploadResult.warnings && uploadResult.warnings.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Data Warnings</h4>
                      <ul className="mt-1 text-sm text-yellow-700">
                        {uploadResult.warnings.map((warning: string, index: number) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Upload Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Properties:</span>
                    <span className="ml-2 font-medium">{uploadResult.propertyCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">File Size:</span>
                    <span className="ml-2 font-medium">
                      {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Redirecting to analysis page...
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Data Format Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Required Fields</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Property ID</li>
                <li>• Property Name</li>
                <li>• Property Type (Office, Retail, Industrial, Residential)</li>
                <li>• Location</li>
                <li>• Current Value</li>
                <li>• NOI (Net Operating Income)</li>
                <li>• Occupancy Rate (0-1)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Optional Fields</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Purchase Price</li>
                <li>• Purchase Date</li>
                <li>• Lease Expiry Date</li>
                <li>• EPC Rating (A-G)</li>
                <li>• Maintenance Score (1-10)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
