import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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
      return NextResponse.json({ error: 'No transaction data found for this user' }, { status: 404 });
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
      tenant_id: `tenant-${txn.propertyId}`, // Generate tenant ID
      transaction_type: txn.transactionType.toLowerCase(),
      amount: txn.amount,
      due_date: txn.transactionDate.toISOString().split('T')[0],
      timestamp: txn.transactionDate.toISOString(),
      bank_reference: `REF-${txn.transactionId}`,
      contract_amount: txn.amount
    }));

    // Transform lease data for analysis
    const leaseData: LeaseData[] = leases.map(lease => ({
      lease_id: lease.leaseId,
      property_id: lease.propertyId,
      tenant_name: lease.tenantName,
      lease_start: lease.startDate.toISOString().split('T')[0],
      lease_end: lease.endDate.toISOString().split('T')[0],
      monthly_rent: lease.monthlyRent,
      security_deposit: lease.securityDeposit || undefined,
      renewal_option: lease.renewalOption,
      break_clause: lease.breakClause
    }));

    // Perform transaction reconciliation
    const [reconciled, unreconciled] = reconcileTransactions(transactionData, leaseData);
    
    // Calculate risk scores for transactions
    const riskScores = calculateTransactionRiskScores(transactionData, leaseData);
    
    // Generate reconciliation report
    const reconciliationReport = generateReconciliationReport(reconciled, unreconciled, riskScores);
    
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
