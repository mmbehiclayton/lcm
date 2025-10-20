'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText, TrendingUp, DollarSign, Building2, BarChart3, X } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadPage() {
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const modules = [
    {
      id: 'portfolio',
      name: 'Portfolio Analysis',
      description: 'Property portfolio data with financial metrics',
      icon: TrendingUp,
      color: 'blue',
      templateUrl: '/api/templates/portfolio',
      templateName: 'portfolio_template.csv'
    },
    {
      id: 'lease-analysis',
      name: 'Lease Analysis',
      description: 'Lease terms, tenant information, and risk data',
      icon: FileText,
      color: 'green',
      templateUrl: '/api/templates/lease-analysis',
      templateName: 'lease_analysis_template.csv'
    },
    {
      id: 'transactions',
      name: 'Transactions',
      description: 'Property transactions, acquisitions, and dispositions',
      icon: DollarSign,
      color: 'purple',
      templateUrl: '/api/templates/transactions',
      templateName: 'transactions_template.csv'
    },
    {
      id: 'occupancy',
      name: 'Occupancy',
      description: 'Occupancy rates, tenant retention, and revenue data',
      icon: Building2,
      color: 'orange',
      templateUrl: '/api/templates/occupancy',
      templateName: 'occupancy_template.csv'
    },
    {
      id: 'predictive-modelling',
      name: 'Predictive Modelling',
      description: 'Property values, market trends, and forecasting data',
      icon: BarChart3,
      color: 'indigo',
      templateUrl: '/api/templates/predictive-modelling',
      templateName: 'predictive_modelling_template.csv'
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedModule) return;

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('module', selectedModule);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`${modules.find(m => m.id === selectedModule)?.name} data uploaded successfully!`);
        // Reset form
        setSelectedFile(null);
        setSelectedModule('');
        setUploadProgress(0);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      green: 'border-green-200 bg-green-50 text-green-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700',
      orange: 'border-orange-200 bg-orange-50 text-orange-700',
      indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700'
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

  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Upload</h1>
          <p className="mt-2 text-gray-600">Upload data for any LCM Analytics module using the templates below</p>
        </div>

        {/* Module Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Module</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => {
              const Icon = module.icon;
              const isSelected = selectedModule === module.id;
              return (
                <div
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  className={`
                    p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${isSelected 
                      ? `${getColorClasses(module.color)} border-2` 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center mb-2">
                    <Icon className="h-6 w-6 mr-3" />
                    <h3 className="font-medium">{module.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Section */}
        {selectedModule && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload {modules.find(m => m.id === selectedModule)?.name} Data
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Template Download */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Download Template</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Download the CSV template with sample data to understand the required format.
                </p>
                <a
                  href={modules.find(m => m.id === selectedModule)?.templateUrl}
                  download={modules.find(m => m.id === selectedModule)?.templateName}
                  className={`
                    inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md
                    ${getButtonColorClasses(modules.find(m => m.id === selectedModule)?.color || 'blue')}
                  `}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </a>
              </div>

              {/* File Upload */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload File</h3>
                
                {!selectedFile ? (
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
                          onChange={handleFileSelect}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Selected File Display */}
                    <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
                          <p className="text-xs text-green-600">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleFileRemove}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        disabled={uploading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Upload Button */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleFileUpload}
                        disabled={uploading || !selectedFile}
                        className="flex-1"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload File
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleFileRemove}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Processing data...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Data Format Requirements */}
        {selectedModule && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {modules.find(m => m.id === selectedModule)?.name} Data Format
            </h3>
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Required Fields:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                {selectedModule === 'portfolio' && (
                  <>
                    <li>Property ID (unique identifier)</li>
                    <li>Property Name</li>
                    <li>Property Type (Office/Retail/Industrial/Residential)</li>
                    <li>Location</li>
                    <li>Purchase Price</li>
                    <li>Current Value</li>
                    <li>NOI (Net Operating Income)</li>
                    <li>Occupancy Rate (0-1)</li>
                    <li>Purchase Date</li>
                    <li>Lease Expiry Date</li>
                    <li>EPC Rating (A-G)</li>
                    <li>Maintenance Score (1-10)</li>
                  </>
                )}
                {selectedModule === 'lease-analysis' && (
                  <>
                    <li>Lease ID (unique identifier)</li>
                    <li>Property ID (reference to property)</li>
                    <li>Tenant Name</li>
                    <li>Lease Start Date</li>
                    <li>Lease End Date</li>
                    <li>Monthly Rent</li>
                    <li>Annual Escalation Rate (%)</li>
                    <li>Security Deposit</li>
                    <li>Renewal Option (Yes/No)</li>
                    <li>Break Clause (Yes/No)</li>
                    <li>Tenant Credit Rating</li>
                    <li>Lease Status (Active/Expired/Pending)</li>
                  </>
                )}
                {selectedModule === 'transactions' && (
                  <>
                    <li>Transaction ID (unique identifier)</li>
                    <li>Property ID (reference to property)</li>
                    <li>Transaction Type (Purchase/Sale/Refinance)</li>
                    <li>Transaction Date</li>
                    <li>Transaction Amount</li>
                    <li>Counterparty Name</li>
                    <li>Transaction Status (Completed/Pending/Failed)</li>
                    <li>Legal Fees</li>
                    <li>Brokerage Fees</li>
                    <li>Other Fees</li>
                    <li>Net Amount</li>
                    <li>Transaction Notes</li>
                  </>
                )}
                {selectedModule === 'occupancy' && (
                  <>
                    <li>Property ID (unique identifier)</li>
                    <li>Property Name</li>
                    <li>Property Type (Office/Retail/Industrial/Residential)</li>
                    <li>Location</li>
                    <li>Total Units</li>
                    <li>Occupied Units</li>
                    <li>Occupancy Rate (%)</li>
                    <li>Average Rent per Unit</li>
                    <li>Total Monthly Revenue</li>
                    <li>Vacant Units</li>
                    <li>Lease Expirations (next 12 months)</li>
                    <li>Risk Level (Low/Medium/High)</li>
                  </>
                )}
                {selectedModule === 'predictive-modelling' && (
                  <>
                    <li>Property ID (unique identifier)</li>
                    <li>Property Name</li>
                    <li>Property Type (Office/Retail/Industrial/Residential)</li>
                    <li>Location</li>
                    <li>Current Value</li>
                    <li>Historical Values (3+ years)</li>
                    <li>Market Trends Data</li>
                    <li>Economic Indicators</li>
                    <li>Rental Growth Rates</li>
                    <li>Market Comparables</li>
                    <li>Location Score</li>
                    <li>Property Age & Condition</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}