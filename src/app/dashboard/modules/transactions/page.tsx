'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Building2, ArrowUpRight, ArrowDownRight, FileText, Upload, X, Download, Edit, Trash2, Eye, RefreshCw, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UploadModal } from '@/components/modals/UploadModal';
import { SearchFilter } from '@/components/common/SearchFilter';
import { TransactionAnalyticsCharts } from '@/components/charts/TransactionAnalyticsCharts';

export default function TransactionsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('History');
  const [historyProperty, setHistoryProperty] = useState<string>('ALL');
  const [historyLocation, setHistoryLocation] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactionData();
  }, []);

  // Filter transactions based on search and filters
  useEffect(() => {
    let filtered = transactions;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.propertyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.transactionType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.transactionType) {
      filtered = filtered.filter(transaction => transaction.transactionType === filters.transactionType);
    }
    if (filters.status) {
      filtered = filtered.filter(transaction => transaction.status === filters.status);
    }
    if (filters.propertyType) {
      filtered = filtered.filter(transaction => transaction.propertyType === filters.propertyType);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, filters]);

  const fetchTransactionData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real transaction data from database
      const response = await fetch('/api/transactions/data');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
        
        // Perform enhanced transaction analysis
        try {
          const analysisResponse = await fetch('/api/transactions/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transactions: data.map((txn: any) => ({
                transaction_id: txn.id,
                property_id: txn.propertyId,
                tenant_id: 'tenant-' + txn.propertyId,
                transaction_type: txn.type.toLowerCase(),
                amount: txn.amount,
                due_date: txn.date,
                timestamp: txn.date,
                contract_amount: txn.amount
              })),
              leases: [] // Would be populated from lease data
            })
          });
          
          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            console.log('Analysis data received:', analysisData);
            setAnalysisResults(analysisData.data || analysisData);
          }
        } catch (analysisError) {
          console.error('Error performing transaction analysis:', analysisError);
        }
      } else {
        // No transaction data available
        setTransactions([]);
        toast.info('No transaction data found. Please upload transaction data to begin analysis.');
      }
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchTransactionData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Purchase':
        return <ArrowDownRight className="h-5 w-5 text-green-600" />;
      case 'Sale':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />;
      case 'Refinance':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Purchase':
        return 'text-green-600 bg-green-100';
      case 'Sale':
        return 'text-red-600 bg-red-100';
      case 'Refinance':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'Failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const totalVolume = transactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
  const totalFees = transactions.reduce((sum, txn) => sum + (txn.fees || 0), 0);
  const completedTransactions = transactions.filter(txn => txn.status?.toLowerCase() === 'completed').length;
  const pendingTransactions = transactions.filter(txn => txn.status?.toLowerCase() === 'pending').length;

  const handleTransactionUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('module', 'transactions');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Transaction data uploaded successfully!');
        setShowUpload(false);
        // Refresh the page data
        fetchTransactionData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Transaction deleted successfully');
        fetchTransactionData(); // Refresh data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const handleUpdateTransaction = async (updatedTransaction: any) => {
    try {
      const response = await fetch(`/api/transactions/${updatedTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTransaction),
      });

      if (response.ok) {
        toast.success('Transaction updated successfully');
        setShowEditModal(false);
        setEditingTransaction(null);
        fetchTransactionData(); // Refresh data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update transaction');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update transaction');
    }
  };

  const handleExportTransactions = async () => {
    try {
      const response = await fetch('/api/transactions/export', {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Transactions exported successfully');
      } else {
        toast.error('Failed to export transactions');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transactions');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading transaction data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <DollarSign className="h-8 w-8" />
                <h1 className="text-2xl lg:text-3xl font-bold">LCM Transactions</h1>
              </div>
              <p className="text-blue-100 text-sm">
                Track and analyze property transactions with comprehensive insights
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {transactions.length > 0 && (
                <>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="inline-flex items-center px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={handleExportTransactions}
                    className="inline-flex items-center px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export
                  </button>
                </>
              )}
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="inline-flex items-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:bg-blue-50"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Data
              </button>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        <UploadModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          module={{
            id: 'transactions',
            name: 'Transactions',
            color: 'purple',
            templateUrl: '/api/templates/transactions',
            templateName: 'transactions_template.csv',
            requiredFields: [
              'Transaction ID (unique identifier)',
              'Property ID (reference to property)',
              'Transaction Type (Purchase/Sale/Refinance)',
              'Transaction Date',
              'Transaction Amount',
              'Counterparty Name',
              'Transaction Status (Completed/Pending/Failed)',
              'Legal Fees',
              'Brokerage Fees',
              'Other Fees',
              'Net Amount',
              'Transaction Notes'
            ]
          }}
          onUploadSuccess={() => fetchTransactionData()}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Total Volume</p>
                <p className="text-2xl font-bold text-blue-900 truncate">{formatCurrency(totalVolume)}</p>
              </div>
              <div className="bg-blue-200 p-2.5 rounded-lg flex-shrink-0 ml-2">
                <DollarSign className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-900">{completedTransactions}</p>
              </div>
              <div className="bg-green-200 p-2.5 rounded-lg flex-shrink-0 ml-2">
                <FileText className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Pending</p>
                <p className="text-2xl font-bold text-orange-900">{pendingTransactions}</p>
              </div>
              <div className="bg-orange-200 p-2.5 rounded-lg flex-shrink-0 ml-2">
                <Calendar className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Total Fees</p>
                <p className="text-2xl font-bold text-purple-900 truncate">{formatCurrency(totalFees)}</p>
              </div>
              <div className="bg-purple-200 p-2.5 rounded-lg flex-shrink-0 ml-2">
                <TrendingUp className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Combined Transaction Analysis & Summary */}
        {analysisResults && (
          <div className="mb-8 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 rounded-t-lg">
              <h2 className="text-xl font-bold">Transaction Analysis & Summary</h2>
              <p className="text-blue-100 mt-1 text-sm">Comprehensive risk assessment and reconciliation insights</p>
            </div>
            
            <div className="p-5">
              {/* Row 1: KPI Cards */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Key Performance Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xl font-bold text-green-600">
                          {analysisResults.reconciliation_report?.reconciliation_rate !== undefined ? 
                            `${(analysisResults.reconciliation_report.reconciliation_rate * 100).toFixed(1)}%` : '0.0%'}
                  </div>
                        <div className="text-xs text-green-700 font-medium">Reconciliation Rate</div>
                        <div className="text-xs text-green-600 mt-1">
                          {analysisResults.reconciliation_report?.reconciled_count || 0} of {analysisResults.reconciliation_report?.total_transactions || 0} transactions
                </div>
                      </div>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-red-600">
                    {analysisResults.reconciliation_report?.high_risk_transactions || 0}
                  </div>
                        <div className="text-sm text-red-700 font-medium">High Risk</div>
                        <div className="text-xs text-red-600 mt-1">
                          {analysisResults.reconciliation_report?.medium_risk_transactions || 0} medium, {analysisResults.reconciliation_report?.low_risk_transactions || 0} low
                </div>
                      </div>
                      
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-orange-600">
                    {analysisResults.reconciliation_report?.unreconciled_count || 0}
                  </div>
                        <div className="text-sm text-orange-700 font-medium">Unreconciled</div>
                        <div className="text-xs text-orange-600 mt-1">
                          Requiring attention
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {analysisResults.risk_scores?.length || 0}
                        </div>
                        <div className="text-sm text-blue-700 font-medium">Total Scored</div>
                        <div className="text-xs text-blue-600 mt-1">
                          Risk assessments completed
                        </div>
                </div>
              </div>
            </div>
            
            {/* Activity & Mix (Types, Volume) */}
            {(() => {
              // Group transactions by type dynamically
              const typeGroups = transactions.reduce((acc, t) => {
                const type = (t.type || 'Other').toLowerCase();
                if (!acc[type]) {
                  acc[type] = [];
                }
                acc[type].push(t);
                return acc;
              }, {} as Record<string, any[]>);
              
              // Get top 3 transaction types by volume or count
              const typeStats = Object.entries(typeGroups).map(([type, txns]) => ({
                type,
                count: (txns as any[]).length,
                volume: (txns as any[]).reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
              })).sort((a, b) => b.volume - a.volume);
              
              const totalVolume = typeStats.reduce((sum, stat) => sum + stat.volume, 0);

              const pct = (val: number) => {
                if (!totalVolume || totalVolume <= 0) return '0%';
                const p = Math.min(100, Math.round((val / totalVolume) * 100));
                return `${p}%`;
              };
              
              const getTypeIcon = (type: string) => {
                const t = type.toLowerCase();
                if (t.includes('purchase') || t.includes('buy')) return <ArrowDownRight className="h-4 w-4 text-green-600 mr-2" />;
                if (t.includes('sale') || t.includes('sell')) return <ArrowUpRight className="h-4 w-4 text-red-600 mr-2" />;
                if (t.includes('rent')) return <Building2 className="h-4 w-4 text-blue-600 mr-2" />;
                if (t.includes('service')) return <FileText className="h-4 w-4 text-purple-600 mr-2" />;
                return <TrendingUp className="h-4 w-4 text-gray-600 mr-2" />;
              };
              
              const getTypeColor = (type: string) => {
                const t = type.toLowerCase();
                if (t.includes('purchase') || t.includes('buy')) return 'bg-green-600';
                if (t.includes('sale') || t.includes('sell')) return 'bg-red-600';
                if (t.includes('rent')) return 'bg-blue-600';
                if (t.includes('service')) return 'bg-purple-600';
                return 'bg-gray-600';
              };

              return (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Transaction Types */}
                  <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Transaction Types</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {typeStats.slice(0, 3).map((stat, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-md p-3 flex flex-col items-center justify-center">
                          <div className="flex items-center mb-1">
                            {getTypeIcon(stat.type)}
                          </div>
                          <span className="text-xs text-gray-600 text-center capitalize mb-1">{stat.type}</span>
                          <span className="text-sm font-semibold text-gray-900">{stat.count}</span>
                        </div>
                      ))}
                      {typeStats.length === 0 && (
                        <div className="col-span-3 text-center py-4 text-sm text-gray-500">
                          No transaction types found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Volume by Type */}
                  <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Volume by Type</h3>
                    <div className="space-y-3">
                      {typeStats.slice(0, 3).map((stat, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 capitalize">{stat.type}</span>
                            <span className="font-medium">{formatCurrency(stat.volume)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className={`${getTypeColor(stat.type)} h-1.5 rounded-full`} style={{ width: pct(stat.volume) }}></div>
                          </div>
                        </div>
                      ))}
                      {typeStats.length === 0 && (
                        <div className="text-center py-4 text-sm text-gray-500">
                          No volume data available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Analysis Summary */}
                  <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Analysis Summary</h3>
                    <div className="bg-gray-50 rounded-md p-4 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Total Transactions</span>
                        <span className="font-semibold text-gray-900">{analysisResults.reconciliation_report?.total_transactions || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Reconciled</span>
                        <span className="font-semibold text-green-600">{analysisResults.reconciled_transactions?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Unreconciled</span>
                        <span className="font-semibold text-orange-600">{analysisResults.unreconciled_transactions?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Risk Scores</span>
                        <span className="font-semibold text-blue-600">{analysisResults.risk_scores?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Report</span>
                        <span className={`font-semibold ${analysisResults.reconciliation_report ? 'text-green-600' : 'text-red-600'}`}>
                          {analysisResults.reconciliation_report ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            </div>
          </div>
        )}

        {/* No Analysis Results Fallback */}
        {transactions.length > 0 && !analysisResults && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Analysis in Progress</h3>
            <p className="text-yellow-700 mb-4">
              Transaction analysis is being performed. This may take a few moments to complete.
            </p>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span className="text-sm text-yellow-600">Processing transaction data...</span>
            </div>
          </div>
        )}

        {/* Consolidated Tables - Tabs */}
        {analysisResults && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative z-10">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 pt-5">
              <div className="flex flex-wrap gap-2">
                {['History','Ledger','Anomalies','Unreconciled','Property Report'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
                      activeTab === tab 
                        ? 'bg-white text-blue-700 shadow-md border-t-2 border-blue-600' 
                        : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    {tab}
                    {tab === 'Ledger' && (
                      <span className="ml-2 text-xs text-gray-500">({analysisResults?.risk_scores?.length || 0})</span>
                    )}
                    {tab === 'Anomalies' && (
                      <span className="ml-2 text-xs text-gray-500">({analysisResults?.unreconciled_transactions?.length || 0})</span>
                    )}
                    {tab === 'Unreconciled' && (
                      <span className="ml-2 text-xs text-gray-500">({analysisResults?.unreconciled_transactions?.length || 0})</span>
                    )}
                    {tab === 'Property Report' && (
                      <span className="ml-2 text-xs text-gray-500">({analysisResults?.reconciliation_report?.property_summary?.length || 0})</span>
                    )}
                    {tab === 'History' && (
                      <span className="ml-2 text-xs text-gray-500">({transactions?.length || 0})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6">
              {activeTab === 'Ledger' && analysisResults?.risk_scores && analysisResults.risk_scores.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Transaction</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Risk Score</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Risk Level</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysisResults.risk_scores.map((risk: any, index: number) => (
                        <tr key={index} className={`hover:bg-gray-50 transition-colors duration-150 ${risk.risk_level === 'High' ? 'bg-red-50/30' : risk.risk_level === 'Medium' ? 'bg-yellow-50/30' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{risk.transaction_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{risk.property_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(risk.amount || 0)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${risk.risk_score > 70 ? 'bg-red-100 text-red-800' : risk.risk_score > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{risk.risk_score}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${risk.risk_level === 'High' ? 'bg-red-100 text-red-800' : risk.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{risk.risk_level}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{risk.is_early_payment ? 'Early Payment' : risk.is_late_payment ? 'Late Payment' : 'On Time'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            )}

              {activeTab === 'History' && transactions && transactions.length > 0 && (
                <div className="overflow-x-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <label className="text-sm text-gray-700">Property:</label>
                      <select
                        value={historyProperty}
                        onChange={(e) => setHistoryProperty(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="ALL">All</option>
                        {Array.from(new Set(transactions.map(t => t.propertyId))).map((pid: string) => (
                          <option key={pid} value={pid}>{pid}</option>
                        ))}
                      </select>
                      <label className="text-sm text-gray-700 ml-4">Location:</label>
                      <select
                        value={historyLocation}
                        onChange={(e) => setHistoryLocation(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="ALL">All</option>
                        {Array.from(new Set(transactions.map(t => t.propertyLocation || 'Unknown'))).map((loc: string) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <tr>
                        <th className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Txn ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Counterparty</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(historyProperty === 'ALL' ? transactions : transactions.filter(t => t.propertyId === historyProperty))
                        .filter((t: any) => historyLocation === 'ALL' ? true : (t.propertyLocation || 'Unknown') === historyLocation)
                        .slice(0, 50).map((t: any, idx: number) => (
                        <tr key={t.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                          <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500">{idx + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.transactionId || t.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.propertyName} <span className="text-xs text-gray-400 ml-1">({t.propertyId})</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(t.amount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.counterparty}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(t.status)}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex space-x-2">
                              <button onClick={() => handleViewTransaction(t)} className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-200 hover:border-blue-600 transition-all duration-200" title="View"><Eye className="h-4 w-4" /></button>
                              <button onClick={() => handleEditTransaction(t)} className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-white hover:bg-green-600 rounded-lg border border-green-200 hover:border-green-600 transition-all duration-200" title="Edit"><Edit className="h-4 w-4" /></button>
                              <button onClick={() => handleDeleteTransaction(t.id)} className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-white hover:bg-red-600 rounded-lg border border-red-200 hover:border-red-600 transition-all duration-200" title="Delete"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'Anomalies' && (
                <>
                  {analysisResults?.unreconciled_transactions && analysisResults.unreconciled_transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">
                          <strong>Note:</strong> This tab shows all unreconciled transactions that require attention. 
                          Total: <span className="font-bold">{analysisResults.unreconciled_transactions.length}</span> unreconciled transaction(s)
                        </p>
                      </div>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-red-50 to-orange-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Transaction ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Property ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tenant ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Issue Type</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Details</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analysisResults.unreconciled_transactions.map((anomaly: any, index: number) => {
                            // Find matching transaction from main transactions array to get amount
                            const matchingTxn = transactions.find(t => t.transactionId === anomaly.transaction_id || t.id === anomaly.transaction_id);
                            const txnAmount = matchingTxn?.amount || 0;
                            
                            // Build details based on reason type
                            let details = '';
                            if (anomaly.reason === 'amount_mismatch') {
                              const variance = anomaly.variance_percentage?.toFixed(1) || '0.0';
                              details = `Expected: ${formatCurrency(anomaly.expected || 0)} | Actual: ${formatCurrency(anomaly.actual || 0)} | Variance: ${variance}%`;
                            } else if (anomaly.reason === 'lease_inactive') {
                              details = `Lease inactive during transaction. Period: ${anomaly.expected_lease_period || 'Unknown'}`;
                            } else if (anomaly.reason === 'no_lease_match' || anomaly.reason === 'no_lease_found') {
                              details = `No matching lease found. Transaction amount: ${formatCurrency(txnAmount)}`;
                            } else {
                              details = `Transaction amount: ${formatCurrency(txnAmount)}`;
                            }
                            
                            return (
                              <tr key={index} className="bg-red-50/30 hover:bg-red-100/50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{anomaly.transaction_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{anomaly.property_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{anomaly.tenant_id || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    anomaly.reason === 'amount_mismatch' ? 'bg-red-100 text-red-800' :
                                    anomaly.reason === 'lease_inactive' ? 'bg-orange-100 text-orange-800' :
                                    (anomaly.reason === 'no_lease_match' || anomaly.reason === 'no_lease_found') ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {anomaly.reason?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                                  <div className="truncate" title={details}>
                                    {details}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(anomaly.transaction_date || anomaly.timestamp).toLocaleDateString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Anomalies Detected</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        All transactions have been reconciled successfully with no anomalies or discrepancies found.
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'Unreconciled' && (
                <>
                  {analysisResults?.unreconciled_transactions && analysisResults.unreconciled_transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-orange-50 to-yellow-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Transaction</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tenant</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysisResults.unreconciled_transactions.map((unreconciled: any, index: number) => (
                        <tr key={index} className="bg-orange-50/30 hover:bg-orange-100/50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unreconciled.transaction_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unreconciled.property_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unreconciled.tenant_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">{unreconciled.reason?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">UNRECONCILED</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(unreconciled.transaction_date || unreconciled.timestamp).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><button className="text-orange-600 hover:text-orange-800 text-xs font-medium">Review</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">All Transactions Reconciled</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Great! All transactions have been successfully reconciled with their corresponding leases.
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'Property Report' && analysisResults?.reconciliation_report?.property_summary && analysisResults.reconciliation_report.property_summary.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total Transactions</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Reconciled</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unreconciled</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Avg Risk Score</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysisResults.reconciliation_report.property_summary.map((property: any, index: number) => (
                        <tr key={index} className={`hover:bg-gray-50 transition-colors duration-150 ${property.unreconciled_count > 0 ? 'bg-orange-50/30' : 'bg-green-50/30'}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{property.property_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{property.total_transactions}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span className="text-green-600 font-medium">{property.reconciled_count}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span className="text-orange-600 font-medium">{property.unreconciled_count}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(property.total_amount || 0)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${property.average_risk_score > 70 ? 'bg-red-100 text-red-800' : property.average_risk_score > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{property.average_risk_score?.toFixed(1) || 'N/A'}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${property.unreconciled_count > 0 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>{property.unreconciled_count > 0 ? 'Issues' : 'Clean'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transaction Types Breakdown */}
        {(() => {
          // Group transactions by type dynamically
          const typeGroups = transactions.reduce((acc, t) => {
            const type = (t.type || 'Other').toLowerCase();
            if (!acc[type]) {
              acc[type] = [];
            }
            acc[type].push(t);
            return acc;
          }, {} as Record<string, any[]>);
          
          const typeStats = Object.entries(typeGroups).map(([type, txns]) => ({
            type,
            count: (txns as any[]).length,
            volume: (txns as any[]).reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
          })).sort((a, b) => b.volume - a.volume);
          
          const totalVolume = typeStats.reduce((sum, stat) => sum + stat.volume, 0);

          const pct = (val: number) => {
            if (!totalVolume || totalVolume <= 0) return '0%';
            const p = Math.min(100, Math.round((val / totalVolume) * 100));
            return `${p}%`;
          };

          return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Types</h3>
            <div className="space-y-4">
              {typeStats.map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{stat.type}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stat.count}
                  </span>
                </div>
              ))}
              {typeStats.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  No transaction types found
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume by Type</h3>
            <div className="space-y-4">
              {typeStats.map((stat, idx) => {
                const colorClass = stat.type.includes('rent') ? 'bg-blue-600' : 
                                  stat.type.includes('service') ? 'bg-purple-600' :
                                  stat.type.includes('purchase') ? 'bg-green-600' :
                                  stat.type.includes('sale') ? 'bg-red-600' : 'bg-gray-600';
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 capitalize">{stat.type}</span>
                      <span className="font-medium">
                        {formatCurrency(stat.volume)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${colorClass} h-2 rounded-full`} style={{ width: pct(stat.volume) }}></div>
                    </div>
                  </div>
                );
              })}
              {typeStats.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  No volume data available
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getTypeIcon(transaction.type)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{transaction.propertyName}</p>
                      <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
          );
        })()}

        {/* Search and Filter */}
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          searchPlaceholder="Search transactions by property, counterparty, or transaction ID..."
          filters={{
            transactionType: {
              label: 'Transaction Type',
              options: [
                { value: 'Purchase', label: 'Purchase' },
                { value: 'Sale', label: 'Sale' },
                { value: 'Refinance', label: 'Refinance' },
                { value: 'Lease', label: 'Lease' }
              ]
            },
            status: {
              label: 'Status',
              options: [
                { value: 'Completed', label: 'Completed' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]
            },
            propertyType: {
              label: 'Property Type',
              options: [
                { value: 'Office', label: 'Office' },
                { value: 'Retail', label: 'Retail' },
                { value: 'Industrial', label: 'Industrial' },
                { value: 'Residential', label: 'Residential' }
              ]
            }
          }}
        />

        {/* Transaction Analytics Charts */}
        <div className="relative z-10 w-full overflow-hidden">
          <TransactionAnalyticsCharts 
            transactions={transactions} 
            analysis={analysisResults} 
          />
        </div>

        {/* Transaction Detail Modal */}
        {showTransactionDetail && selectedTransaction && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
                  <button
                    onClick={() => setShowTransactionDetail(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
          </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.id}</p>
                        </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.type}</p>
                      </div>
                        <div>
                      <label className="block text-sm font-medium text-gray-700">Property</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.propertyName}</p>
                        </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedTransaction.amount)}</p>
                      </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Counterparty</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.counterparty}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                        {selectedTransaction.status}
                      </span>
          </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedTransaction.date).toLocaleDateString()}</p>
        </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Net Amount</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedTransaction.netAmount)}</p>
                    </div>
                  </div>
                  
                  {selectedTransaction.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowTransactionDetail(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowTransactionDetail(false);
                      handleEditTransaction(selectedTransaction);
                    }}
                  >
                    Edit Transaction
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Transaction Modal */}
        {showEditModal && editingTransaction && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Transaction</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updatedTransaction = {
                    ...editingTransaction,
                    status: formData.get('status'),
                    notes: formData.get('notes'),
                    amount: parseFloat(formData.get('amount') as string),
                    netAmount: parseFloat(formData.get('netAmount') as string)
                  };
                  handleUpdateTransaction(updatedTransaction);
                }}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          name="status"
                          defaultValue={editingTransaction.status}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Completed">Completed</option>
                          <option value="Pending">Pending</option>
                          <option value="Failed">Failed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <input
                          type="number"
                          name="amount"
                          defaultValue={editingTransaction.amount}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Net Amount</label>
                        <input
                          type="number"
                          name="netAmount"
                          defaultValue={editingTransaction.netAmount}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea
                        name="notes"
                        defaultValue={editingTransaction.notes || ''}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Update Transaction
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
