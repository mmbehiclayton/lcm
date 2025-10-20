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
    // Get occupancy data from database
    const occupancyData = await prisma.occupancyData.findMany({
      where: { upload: { userId: userId } },
      include: { upload: { select: { createdAt: true } } }
    });

    if (occupancyData.length === 0) {
      return NextResponse.json({ error: 'No occupancy data found for this user' }, { status: 404 });
    }

    // Transform occupancy data for Python service
    const occupancy = occupancyData.map(data => ({
      property_id: data.propertyId,
      property_name: data.propertyName,
      property_type: data.propertyType,
      location: data.location,
      total_units: data.totalUnits,
      occupied_units: data.occupiedUnits,
      occupancy_rate: data.occupancyRate,
      average_rent: data.averageRent,
      total_revenue: data.totalRevenue,
      vacant_units: data.vacantUnits,
      lease_expirations: data.leaseExpirations,
      risk_level: data.riskLevel
    }));

    // Call Python service for occupancy analysis
    const response = await fetch(`${PYTHON_SERVICE_URL}/occupancy/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        occupancy_data: occupancy,
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