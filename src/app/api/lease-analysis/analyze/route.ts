import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Get lease data from database
    const leases = await prisma.lease.findMany({
      where: { upload: { userId: userId } },
      include: { upload: { select: { createdAt: true } } }
    });

    if (leases.length === 0) {
      return NextResponse.json({ error: 'No lease data found for this user' }, { status: 404 });
    }

    // Transform lease data for Python service
    const leaseData = leases.map(lease => ({
      lease_id: lease.leaseId,
      property_id: lease.propertyId,
      tenant_name: lease.tenantName,
      lease_start: lease.startDate.toISOString().split('T')[0],
      lease_end: lease.endDate.toISOString().split('T')[0],
      monthly_rent: lease.monthlyRent,
      security_deposit: lease.securityDeposit,
      renewal_option: lease.renewalOption,
      break_clause: lease.breakClause
    }));

    // Call Python service for lease risk analysis
    const response = await fetch(`${PYTHON_SERVICE_URL}/lease-risk/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leases: leaseData,
        analysis_date: new Date().toISOString().split('T')[0]
      }),
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.statusText}`);
    }

    const analysisResult = await response.json();

    // Save analysis results to database
    const createdAnalysis = await prisma.analysis.create({
      data: {
        userId: userId,
        uploadId: leases[0]?.uploadId || '',
        strategy: 'lease-risk',
        results: JSON.parse(JSON.stringify(analysisResult))
      },
    });

    return NextResponse.json({ 
      message: 'Lease risk analysis completed successfully', 
      data: analysisResult 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Lease analysis error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to perform lease analysis' 
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
    // Get lease data for display
    const leases = await prisma.lease.findMany({
      where: { upload: { userId: userId } },
      orderBy: { createdAt: 'desc' }
    });

    // Get latest analysis results
    const latestAnalysis = await prisma.analysis.findFirst({
      where: { 
        userId: userId,
        strategy: 'lease-risk'
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      leases,
      analysis: latestAnalysis?.results || null
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching lease data:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch lease data' 
    }, { status: 500 });
  }
}
