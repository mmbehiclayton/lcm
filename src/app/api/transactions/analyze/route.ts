import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import {
  reconcileTransactions,
  calculateTransactionRiskScores,
  generateReconciliationReport,
  type TransactionData,
  type LeaseData,
  type TransactionAnalysisResponse
} from '@/lib/analytics-engine';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Get transaction data from database
    const transactions = await prisma.transaction.findMany({
      where: { upload: { userId: userId } },
      include: { upload: { select: { createdAt: true } } }
    });

    if (transactions.length === 0) {
      // Return empty analysis structure instead of 404
      return NextResponse.json({ 
        message: 'No transaction data found for this user',
        data: {
          reconciled_transactions: [],
          unreconciled_transactions: [],
          risk_scores: [],
          reconciliation_report: {
            total_transactions: 0,
            reconciled_count: 0,
            unreconciled_count: 0,
            reconciliation_rate: 0,
            high_risk_transactions: 0,
            recommendations: [
              "Upload transaction data to begin analysis",
              "Ensure transaction data includes required fields",
              "Verify data format matches template"
            ]
          }
        }
      }, { status: 200 });
    }

    // Get lease data for reconciliation
    const leases = await prisma.lease.findMany({
      where: { upload: { userId: userId } },
      include: { upload: { select: { createdAt: true } } }
    });

    // Transform transaction data for analysis
    const transactionData: TransactionData[] = transactions.map(txn => ({
      transaction_id: txn.transactionId,
      property_id: txn.propertyId,
      tenant_id: txn.tenantId || `tenant-${txn.propertyId}`, // Use real tenant ID or fallback
      lease_id: txn.leaseId || undefined,
      transaction_type: txn.transactionType.toLowerCase(),
      amount: txn.amount,
      expected_amount: txn.expectedAmount || txn.amount,
      due_date: (txn.dueDate || txn.transactionDate).toISOString().split('T')[0],
      timestamp: txn.transactionDate.toISOString(),
      bank_reference: txn.reference || `REF-${txn.transactionId}`,
      contract_amount: txn.expectedAmount || txn.amount
    }));

    // Transform lease data for analysis
    const leaseData: LeaseData[] = leases.map(lease => ({
      lease_id: lease.leaseId,
      property_id: lease.propertyId,
      tenant_id: lease.tenantId || undefined,
      tenant_name: lease.tenantName,
      lease_start: lease.startDate.toISOString().split('T')[0],
      lease_end: lease.endDate.toISOString().split('T')[0],
      monthly_rent: lease.monthlyRent,
      security_deposit: lease.securityDeposit || undefined,
      renewal_option: lease.renewalOption,
      break_clause: lease.breakClause
    }));

    // If no lease data, create mock leases for analysis
    let finalLeaseData = leaseData;
    if (leaseData.length === 0) {
      console.log('No lease data found, creating mock leases for analysis');
      // Create mock leases for each property that has transactions
      const uniquePropertyIds = Array.from(new Set(transactionData.map(t => t.property_id)));
      finalLeaseData = uniquePropertyIds.map((propertyId, index) => {
        // Use a more realistic monthly rent based on transaction amounts
        const sampleTransaction = transactionData.find(t => t.property_id === propertyId);
        const monthlyRent = sampleTransaction ? Math.max(sampleTransaction.amount * 0.1, 5000) : 10000;
        
        return {
          lease_id: `LEASE-${propertyId}`,
          property_id: propertyId,
          tenant_name: `tenant-${propertyId}`, // Match the tenant_id format
          lease_start: '2023-01-01',
          lease_end: '2025-12-31',
          monthly_rent: monthlyRent,
          security_deposit: monthlyRent * 3,
          renewal_option: true,
          break_clause: false
        };
      });
    }

    console.log('Transaction analysis debug:', {
      transactionCount: transactionData.length,
      leaseCount: finalLeaseData.length,
      sampleTransaction: transactionData[0],
      sampleLease: finalLeaseData[0]
    });

    // Perform transaction reconciliation
    const [reconciled, unreconciled] = reconcileTransactions(transactionData, finalLeaseData);
    
    console.log('Reconciliation results:', {
      reconciledCount: reconciled.length,
      unreconciledCount: unreconciled.length
    });
    
    // Calculate risk scores for transactions
    const riskScores = calculateTransactionRiskScores(transactionData, finalLeaseData);
    
    console.log('Risk scores:', {
      riskScoreCount: riskScores.length,
      sampleRiskScore: riskScores[0]
    });
    
    // Generate reconciliation report
    const reconciliationReport = generateReconciliationReport(reconciled, unreconciled, riskScores);
    
    console.log('Reconciliation report:', reconciliationReport);
    
    // Create analysis result
    const analysisResult: TransactionAnalysisResponse = {
      reconciled_transactions: reconciled,
      unreconciled_transactions: unreconciled,
      risk_scores: riskScores,
      reconciliation_report: reconciliationReport
    };

    // Save analysis results to database
    const createdAnalysis = await prisma.analysis.create({
      data: {
        userId: userId,
        uploadId: transactions[0]?.uploadId || '',
        strategy: 'transactions',
        results: JSON.parse(JSON.stringify(analysisResult))
      },
    });

    return NextResponse.json({ 
      message: 'Transaction analysis completed successfully', 
      data: analysisResult 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Transaction analysis error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to perform transaction analysis' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Get transaction data for display
    const transactions = await prisma.transaction.findMany({
      where: { upload: { userId: userId } },
      orderBy: { createdAt: 'desc' }
    });

    // Get latest analysis results
    const latestAnalysis = await prisma.analysis.findFirst({
      where: { 
        userId: userId,
        strategy: 'transactions'
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      transactions,
      analysis: latestAnalysis?.results || null
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching transaction data:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch transaction data' 
    }, { status: 500 });
  }
}
