import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  calculateLeaseRiskScores,
  generateLeaseRiskActions,
  identifyLeaseRiskFactors,
  prioritizeLeaseInterventions,
  type PropertyData,
  type LeaseData,
  type MarketData,
  type LeaseRiskResponse
} from '@/lib/analytics-engine';

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

    // Get properties for lease risk analysis
    const properties = await prisma.property.findMany({
      where: { upload: { userId: userId } },
      include: { upload: { select: { createdAt: true } } }
    });

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

    // Transform property data for analysis
    const propertyData: PropertyData[] = properties.map(prop => ({
      property_id: prop.propertyId,
      name: prop.name,
      type: prop.type.toLowerCase() as 'office' | 'retail' | 'industrial' | 'residential',
      location: prop.location,
      purchase_price: prop.purchasePrice || 0,
      current_value: prop.currentValue || 0,
      noi: prop.noi || 0,
      occupancy_rate: prop.occupancyRate || 0.8,
      purchase_date: prop.purchaseDate?.toISOString().split('T')[0],
      lease_expiry_date: prop.leaseExpiryDate?.toISOString().split('T')[0],
      epc_rating: prop.epcRating as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | undefined,
      maintenance_score: prop.maintenanceScore || undefined
    }));

    // Create mock market data for analysis
    const marketData: MarketData[] = properties.map(prop => ({
      location: prop.location,
      property_type: prop.type.toLowerCase(),
      market_rent: (prop.currentValue || 0) * 0.05, // Estimate 5% yield
      demand_index: 0.7, // Default market demand
      economic_indicators: {
        gdp_growth: 2.5,
        inflation_rate: 3.0,
        interest_rate: 4.5
      }
    }));

    // Calculate lease risk scores
    const riskScores = calculateLeaseRiskScores(propertyData, leaseData, marketData);
    
    // Generate recommended actions
    const recommendedActions = generateLeaseRiskActions(riskScores, propertyData, leaseData);
    
    // Identify risk factors
    const riskFactors = identifyLeaseRiskFactors(propertyData, leaseData, marketData);
    
    // Set intervention priorities
    const interventionPriorities = prioritizeLeaseInterventions(riskScores, recommendedActions);
    
    // Create analysis result
    const analysisResult: LeaseRiskResponse = {
      risk_scores: riskScores,
      recommended_actions: recommendedActions,
      risk_factors: riskFactors,
      intervention_priorities: interventionPriorities
    };

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
