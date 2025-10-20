'use client';

import { useState, useCallback } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  selectedFile?: File;
  isLoading?: boolean;
  error?: string;
}

export function FileUpload({ 
  onFileSelect, 
  onRemove, 
  selectedFile, 
  isLoading = false,
  error 
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  const handleRemove = useCallback(() => {
    onRemove();
  }, [onRemove]);

  if (selectedFile) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <File className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
              <p className="text-xs text-green-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-red-600 hover:text-red-800 transition-colors"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInput}
          disabled={isLoading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop your file here' : 'Upload your data file'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supports CSV and Excel files up to 50MB
          </p>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Choose File'}
          </button>
        </label>
      </div>
    </div>
  );
}
