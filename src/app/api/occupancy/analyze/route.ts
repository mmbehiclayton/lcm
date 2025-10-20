import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  calculateUtilizationScores,
  checkLeaseCompliance,
  generateOccupancyOptimizationRecommendations,
  calculateEfficiencyMetrics,
  type OccupancyData,
  type LeaseData,
  type OccupancyAnalysisResponse
} from '@/lib/analytics-engine';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Get occupancy data from database
    const occupancyData = await prisma.occupancyData.findMany({
      where: { upload: { userId: userId } },
      include: { upload: { select: { createdAt: true } } }
    });

    if (occupancyData.length === 0) {
      return NextResponse.json({ error: 'No occupancy data found for this user' }, { status: 404 });
    }

    // Get lease data for compliance checking
    const leases = await prisma.lease.findMany({
      where: { upload: { userId: userId } },
      include: { upload: { select: { createdAt: true } } }
    });

    // Transform occupancy data for analysis
    const occupancy: OccupancyData[] = occupancyData.map(data => ({
      property_id: data.propertyId,
      total_sq_ft: data.totalUnits * 1000, // Estimate 1000 sq ft per unit
      occupied_sq_ft: data.occupiedUnits * 1000,
      vacant_sq_ft: data.vacantUnits * 1000,
      common_areas: data.totalUnits * 100, // Estimate 10% common areas
      parking_spaces: data.totalUnits * 1.5, // Estimate 1.5 spaces per unit
      occupied_parking: data.occupiedUnits * 1.2, // Estimate 1.2 spaces per occupied unit
      sensor_data: {
        occupancy_rate: data.occupancyRate,
        risk_level: data.riskLevel
      }
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

    // Calculate utilization scores
    const utilizationScores = calculateUtilizationScores(occupancy);
    
    // Check compliance alerts
    const complianceAlerts = checkLeaseCompliance(occupancy, leaseData);
    
    // Generate optimization recommendations
    const optimizationRecommendations = generateOccupancyOptimizationRecommendations(utilizationScores);
    
    // Calculate efficiency metrics
    const efficiencyMetrics = calculateEfficiencyMetrics(occupancy, utilizationScores);
    
    // Create analysis result
    const analysisResult: OccupancyAnalysisResponse = {
      utilization_scores: utilizationScores,
      compliance_alerts: complianceAlerts,
      optimization_recommendations: optimizationRecommendations,
      efficiency_metrics: efficiencyMetrics
    };

    // Save analysis results to database
    const createdAnalysis = await prisma.analysis.create({
      data: {
        userId: userId,
        uploadId: occupancyData[0]?.uploadId || '',
        strategy: 'occupancy',
        results: JSON.parse(JSON.stringify(analysisResult))
      },
    });

    return NextResponse.json({ 
      message: 'Occupancy analysis completed successfully', 
      data: analysisResult 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Occupancy analysis error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to perform occupancy analysis' 
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
    // Get occupancy data for display
    const occupancyData = await prisma.occupancyData.findMany({
      where: { upload: { userId: userId } },
      orderBy: { createdAt: 'desc' }
    });

    // Get latest analysis results
    const latestAnalysis = await prisma.analysis.findFirst({
      where: { 
        userId: userId,
        strategy: 'occupancy'
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      occupancyData,
      analysis: latestAnalysis?.results || null
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching occupancy data:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch occupancy data' 
    }, { status: 500 });
  }
}