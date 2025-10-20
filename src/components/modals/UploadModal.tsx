'use client';

import { useState } from 'react';
import { X, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: {
    id: string;
    name: string;
    color: string;
    templateUrl: string;
    templateName: string;
    requiredFields: string[];
  };
  onUploadSuccess?: () => void;
}

export function UploadModal({ isOpen, onClose, module, onUploadSuccess }: UploadModalProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('module', module.id);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success(`${module.name} data uploaded successfully!`);
        onClose();
        onUploadSuccess?.();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-200 bg-blue-50',
      green: 'border-green-200 bg-green-50',
      purple: 'border-purple-200 bg-purple-50',
      orange: 'border-orange-200 bg-orange-50',
      indigo: 'border-indigo-200 bg-indigo-50'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getButtonColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700',
      green: 'border-green-300 bg-green-50 hover:bg-green-100 text-green-700',
      purple: 'border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700',
      orange: 'border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700',
      indigo: 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Upload {module.name} Data
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Column 1: Required Fields */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Data Requirements
                  </h3>
                  <div className={`rounded-lg p-4 ${getColorClasses(module.color)}`}>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 mb-3">Required Fields:</p>
                      <ul className="space-y-2">
                        {module.requiredFields.map((field, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-gray-500 mr-2">•</span>
                            <span className="text-gray-700">{field}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Data Format Tips:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use CSV or Excel format (.csv, .xlsx, .xls)</li>
                    <li>• Ensure all required fields are included</li>
                    <li>• Use consistent date formats (YYYY-MM-DD)</li>
                    <li>• Avoid empty rows or columns</li>
                    <li>• Check data types (numbers, dates, text)</li>
                  </ul>
                </div>
              </div>

              {/* Column 2: Template Download & File Upload */}
              <div className="space-y-6">
                {/* Template Download */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Download Template
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Download the CSV template with sample data to understand the required format.
                  </p>
                  <a
                    href={module.templateUrl}
                    download={module.templateName}
                    className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${getButtonColorClasses(module.color)}`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </a>
                </div>

                {/* File Upload */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Upload File
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Click to upload or drag and drop
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          CSV or Excel files only
                        </span>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          className="sr-only"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    {uploading && (
                      <div className="mt-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Processing data...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
