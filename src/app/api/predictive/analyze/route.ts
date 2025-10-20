import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  runPredictiveModels,
  calculatePredictiveRisks,
  calculateConfidenceScores,
  generatePredictiveRecommendations,
  type PropertyData,
  type MarketData,
  type PredictiveAnalysisResponse
} from '@/lib/analytics-engine';

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

    // Transform predictive data for analysis
    const properties: PropertyData[] = predictiveData.map(data => ({
      property_id: data.propertyId,
      name: data.propertyName,
      type: data.propertyType.toLowerCase() as 'office' | 'retail' | 'industrial' | 'residential',
      location: data.location,
      purchase_price: 0, // Not available in predictive data
      current_value: data.currentValue,
      noi: 0, // Not available in predictive data
      occupancy_rate: 0.8, // Default value
      purchase_date: undefined,
      lease_expiry_date: undefined,
      epc_rating: undefined,
      maintenance_score: undefined
    }));

    // Create mock market data for analysis
    const marketData: MarketData[] = properties.map(prop => ({
      location: prop.location,
      property_type: prop.type,
      market_rent: prop.current_value * 0.05, // Estimate 5% yield
      demand_index: 0.7, // Default market demand
      economic_indicators: {
        gdp_growth: 2.5,
        inflation_rate: 3.0,
        interest_rate: 4.5
      }
    }));

    // Run predictive models
    const predictions = runPredictiveModels(properties, marketData);
    
    // Calculate risk assessments
    const riskAssessments = calculatePredictiveRisks(properties, predictions);
    
    // Generate confidence scores
    const confidenceScores = calculateConfidenceScores(predictions, riskAssessments);
    
    // Generate recommendations
    const recommendations = generatePredictiveRecommendations(predictions, riskAssessments);
    
    // Create analysis result
    const analysisResult: PredictiveAnalysisResponse = {
      predictions: predictions,
      risk_assessments: riskAssessments,
      confidence_scores: confidenceScores,
      recommendations: recommendations
    };

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