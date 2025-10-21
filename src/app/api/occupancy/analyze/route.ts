import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import {
  calculateOccupancyScore,
  analyzeOccupancyData,
  type OccupancyInputData
} from '@/lib/analytics-engine';

/**
 * POST /api/occupancy/analyze
 * Analyzes occupancy data using the LCM Occupancy Algorithm
 * 
 * Implements:
 * - IoT/Smart Meter Data analysis (desk usage, lighting, sensors)
 * - Lease compliance checking
 * - Historical trend analysis
 * - Utilization classification (Overcrowded/Underutilised/Efficient)
 * - Future pattern prediction
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Fetch occupancy data from database
    const occupancyRecords = await prisma.occupancyData.findMany({
      where: { upload: { userId: userId } },
      include: { upload: { select: { id: true, createdAt: true } } }
    });

    if (occupancyRecords.length === 0) {
      return NextResponse.json({ 
        message: 'No occupancy data found for this user',
        data: {
          analyses: [],
          summary: {
            total_properties: 0,
            avg_occupancy_score: 0,
            overcrowded_count: 0,
            underutilised_count: 0,
            efficient_count: 0,
            lease_breaches: 0,
            high_risk_properties: []
          }
        }
      }, { status: 200 });
    }

    // Fetch lease data for compliance checking
    const leases = await prisma.lease.findMany({
      where: { upload: { userId: userId } },
      include: { upload: { select: { createdAt: true } } }
    });

    // Transform database records to OccupancyInputData format
    const occupancyDataArray: OccupancyInputData[] = occupancyRecords.map(record => {
      // Find matching lease for this property
      const propertyLeases = leases.filter(lease => lease.propertyId === record.propertyId);
      const primaryLease = propertyLeases[0];

      return {
        property_id: record.propertyId,
        current_occupancy: record.occupancyRate, // Already in percentage format (0-100)
        total_capacity: 100,
        
        // Sensor data (if available from the record) - already in percentage format
        occupancy_sensor_data: {
          desk_usage: record.deskUsage || undefined,
          badge_ins: record.badgeIns || undefined,
          meeting_room_usage: record.meetingRoomUsage || undefined,
          lighting_usage: record.lightingUsage || undefined,
          temperature_avg: record.temperatureAvg || undefined
        },
        
        // Historical logs - already in percentage format (0-100)
        historical_logs: {
          avg_occupancy_3_months: record.avgOccupancy3Months || record.occupancyRate,
          avg_occupancy_6_months: record.avgOccupancy6Months || record.occupancyRate,
          avg_occupancy_12_months: record.avgOccupancy12Months || record.occupancyRate,
          peak_usage: record.peakUsage || record.occupancyRate * 1.2
        },
        
        // Lease terms (if lease exists)
        lease_terms: primaryLease ? {
          permitted_usage: record.permittedUsage || 'general office use',
          subletting_allowed: record.sublettingAllowed !== false,
          coworking_restrictions: record.coworkingRestrictions || false,
          max_occupancy: record.maxOccupancy || record.totalUnits
        } : undefined,
        
        // Tenant info
        tenant_info: primaryLease ? {
          business_type: record.businessType || 'Unknown',
          headcount_estimate: record.headcountEstimate || Math.floor(record.occupiedUnits * 1.5),
          actual_headcount: record.actualHeadcount || record.occupiedUnits
        } : undefined
      };
    });

    // Run the LCM Occupancy Algorithm
    const analysisResult = analyzeOccupancyData(occupancyDataArray);

    // Enrich analysis results with property details
    const enrichedAnalyses = analysisResult.analyses.map(analysis => {
      const record = occupancyRecords.find(r => r.propertyId === analysis.property_id);
      return {
        ...analysis,
        property_name: record?.propertyName || 'Unknown Property',
        property_type: record?.propertyType || 'Unknown',
        location: record?.location || 'Unknown',
        total_units: record?.totalUnits || 0,
        occupied_units: record?.occupiedUnits || 0,
        vacant_units: record?.vacantUnits || 0,
        total_revenue: record?.totalRevenue || 0
      };
    });

    // Save analysis results to database
    const uploadId = occupancyRecords[0]?.uploadId;
    
    if (uploadId) {
      await prisma.analysis.create({
        data: {
          userId: userId,
          uploadId: uploadId,
          strategy: 'occupancy',
          results: {
            analyses: enrichedAnalyses,
            summary: analysisResult.summary,
            timestamp: new Date().toISOString()
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        analyses: enrichedAnalyses,
        summary: analysisResult.summary
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Occupancy analysis error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to analyze occupancy data'
    }, { status: 500 });
  }
}

/**
 * GET /api/occupancy/analyze
 * Retrieves the most recent occupancy analysis
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Get the most recent occupancy analysis
    const analysis = await prisma.analysis.findFirst({
      where: {
        userId: userId,
        strategy: 'occupancy'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!analysis) {
      return NextResponse.json({ 
        message: 'No occupancy analysis found',
        data: null
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      data: analysis.results
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching occupancy analysis:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch occupancy analysis'
    }, { status: 500 });
  }
}
