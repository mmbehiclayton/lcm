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

    console.log('Starting upload for module:', module.id, 'File:', file.name);
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('module', module.id);

      console.log('Sending upload request...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        
        const recordCount = result.recordCount || result.recordsCount || 0;
        if (recordCount > 0) {
          toast.success(`${module.name} data uploaded successfully! (${recordCount} records saved)`);
        } else {
          toast.warning(`${module.name} data processed but no records were saved. Please check your data format.`);
        }
        
        onClose();
        onUploadSuccess?.();
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        
        if (errorData.error) {
          toast.error(`Upload failed: ${errorData.error}`);
        } else if (errorData.details) {
          toast.error(`Upload failed: ${errorData.details.missingFields?.join(', ') || 'Data validation failed'}`);
        } else {
          toast.error('Upload failed. Please try again.');
        }
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
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Upload {module.name} Data
                </h2>
                <p className="text-sm text-gray-600">Import your data files for analysis</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
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
                    className={`inline-flex items-center px-6 py-3 border-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${getButtonColorClasses(module.color)}`}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download Template
                  </a>
                </div>

                {/* File Upload */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-blue-600" />
                    Upload File
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-lg font-semibold text-gray-900">
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
                      <div className="mt-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-3 text-sm font-medium text-gray-600">Processing data...</p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploading}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
