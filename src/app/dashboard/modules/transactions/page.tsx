'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Building2, ArrowUpRight, ArrowDownRight, FileText, Upload, X, Download } from 'lucide-react';
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
              transactions: data.map(txn => ({
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
            setAnalysisResults(analysisData);
          }
        } catch (analysisError) {
          console.error('Error performing transaction analysis:', analysisError);
        }
      } else {
        // Fallback to mock data
        const mockData = [
    {
      id: 'txn-001',
      type: 'Purchase',
      propertyName: 'Downtown Office Tower',
      propertyId: 'prop-001',
      amount: 25000000,
      date: '2023-06-15',
      status: 'Completed',
      counterparty: 'ABC Real Estate LLC',
      fees: 125000,
      netAmount: 24875000
    },
    {
      id: 'txn-002',
      type: 'Sale',
      propertyName: 'Suburban Retail Plaza',
      propertyId: 'prop-002',
      amount: 18000000,
      date: '2023-09-22',
      status: 'Completed',
      counterparty: 'XYZ Investment Group',
      fees: 90000,
      netAmount: 17910000
    },
    {
      id: 'txn-003',
      type: 'Purchase',
      propertyName: 'Industrial Warehouse Complex',
      propertyId: 'prop-003',
      amount: 12000000,
      date: '2023-11-08',
      status: 'Completed',
      counterparty: 'Industrial Partners Inc',
      fees: 60000,
      netAmount: 11940000
    },
    {
      id: 'txn-004',
      type: 'Refinance',
      propertyName: 'Luxury Apartment Building',
      propertyId: 'prop-004',
      amount: 15000000,
      date: '2024-01-10',
      status: 'Pending',
      counterparty: 'Metro Bank',
      fees: 75000,
      netAmount: 14925000
    }
        ];
        setTransactions(mockData);
      }
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  const totalVolume = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  const totalFees = transactions.reduce((sum, txn) => sum + txn.fees, 0);
  const completedTransactions = transactions.filter(txn => txn.status === 'Completed').length;
  const pendingTransactions = transactions.filter(txn => txn.status === 'Pending').length;

  const handleTransactionUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
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
      setUploading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LCM Transactions</h1>
              <p className="mt-2 text-gray-600">Track and analyze all property transactions, acquisitions, and dispositions</p>
            </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowUpload(!showUpload)}
                      className="inline-flex items-center px-4 py-2"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Transaction Data
                    </Button>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="3m">Last 3 months</option>
                <option value="6m">Last 6 months</option>
                <option value="12m">Last 12 months</option>
                <option value="24m">Last 24 months</option>
              </select>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Volume</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalVolume)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{completedTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Fees</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalFees)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        {analysisResults && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Transaction Analysis</h2>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisResults.reconciliation_report?.reconciliation_rate ? 
                      `${(analysisResults.reconciliation_report.reconciliation_rate * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Reconciliation Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">
                    {analysisResults.reconciliation_report?.high_risk_transactions || 0}
                  </div>
                  <div className="text-sm text-gray-600">High Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-600">
                    {analysisResults.reconciliation_report?.unreconciled_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">Unreconciled</div>
                </div>
              </div>
            </div>
            
            {analysisResults.reconciliation_report?.recommendations && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Key Recommendations:</h3>
                <ul className="space-y-1">
                  {analysisResults.reconciliation_report.recommendations.slice(0, 3).map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Transaction Types Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Types</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowDownRight className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm text-gray-600">Purchases</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {transactions.filter(t => t.type === 'Purchase').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowUpRight className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-sm text-gray-600">Sales</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {transactions.filter(t => t.type === 'Sale').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm text-gray-600">Refinancing</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {transactions.filter(t => t.type === 'Refinance').length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume by Type</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Purchases</span>
                  <span className="font-medium">
                    {formatCurrency(transactions.filter(t => t.type === 'Purchase').reduce((sum, t) => sum + t.amount, 0))}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Sales</span>
                  <span className="font-medium">
                    {formatCurrency(transactions.filter(t => t.type === 'Sale').reduce((sum, t) => sum + t.amount, 0))}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Refinancing</span>
                  <span className="font-medium">
                    {formatCurrency(transactions.filter(t => t.type === 'Refinance').reduce((sum, t) => sum + t.amount, 0))}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
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
        <TransactionAnalyticsCharts 
          transactions={transactions} 
          analysis={analysisResults} 
        />

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(transaction.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{transaction.type}</div>
                          <div className="text-sm text-gray-500">ID: {transaction.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transaction.propertyName}</div>
                          <div className="text-sm text-gray-500">ID: {transaction.propertyId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.fees)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.netAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
