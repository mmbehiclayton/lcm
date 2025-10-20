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
    // Get predictive data from database
    const predictiveData = await prisma.predictiveData.findMany({
      where: { upload: { userId: userId } },
      include: { upload: { select: { createdAt: true } } }
    });

    if (predictiveData.length === 0) {
      return NextResponse.json({ error: 'No predictive data found for this user' }, { status: 404 });
    }

    // Transform predictive data for Python service
    const properties = predictiveData.map(data => ({
      property_id: data.propertyId,
      property_name: data.propertyName,
      property_type: data.propertyType,
      location: data.location,
      current_value: data.currentValue,
      historical_values: data.historicalValues,
      market_trends: data.marketTrends,
      economic_indicators: data.economicIndicators,
      rental_growth_rates: data.rentalGrowthRates,
      market_comparables: data.marketComparables,
      location_score: data.locationScore,
      property_age: data.propertyAge,
      condition: data.condition
    }));

    // Call Python service for predictive analysis
    const response = await fetch(`${PYTHON_SERVICE_URL}/predictive/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: properties,
        analysis_date: new Date().toISOString().split('T')[0],
        forecast_horizon: 12 // months
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
        uploadId: predictiveData[0]?.uploadId || '',
        strategy: 'predictive',
        results: JSON.parse(JSON.stringify(analysisResult))
      },
    });

    return NextResponse.json({ 
      message: 'Predictive analysis completed successfully', 
      data: analysisResult 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Predictive analysis error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to perform predictive analysis' 
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
    // Get predictive data for display
    const predictiveData = await prisma.predictiveData.findMany({
      where: { upload: { userId: userId } },
      orderBy: { createdAt: 'desc' }
    });

    // Get latest analysis results
    const latestAnalysis = await prisma.analysis.findFirst({
      where: { 
        userId: userId,
        strategy: 'predictive'
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      predictiveData,
      analysis: latestAnalysis?.results || null
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching predictive data:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch predictive data' 
    }, { status: 500 });
  }
}