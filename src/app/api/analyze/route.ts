import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calculateEnhancedPropertyScores,
  getEnhancedStrategyWeights,
  calculateEnhancedPortfolioHealth,
  assessEnhancedRiskLevel,
  calculatePerformanceGrade,
  generateEnhancedRecommendations,
  type PropertyData,
  type AnalysisResponse
} from '@/lib/analytics-engine';
export async function POST(req: NextRequest) {
  try {
    const { userId, strategy }: { userId: string; strategy: string } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // First get uploads for the user, then get properties
    const uploads = await prisma.upload.findMany({
      where: { userId },
      include: { properties: true }
    });

    const dbProperties = uploads.flatMap(upload => upload.properties);

    if (dbProperties.length === 0) {
      return NextResponse.json({ error: 'No properties found for this user' }, { status: 404 });
    }

    // Transform database properties to match the expected Property interface
    const properties: PropertyData[] = dbProperties.map(prop => ({
      property_id: prop.propertyId,
      name: prop.name,
      type: prop.type.toLowerCase() as 'office' | 'retail' | 'industrial' | 'residential',
      location: prop.location,
      purchase_price: prop.purchasePrice || 0,
      current_value: prop.currentValue || 0,
      noi: prop.noi || 0,
      occupancy_rate: prop.occupancyRate || 0,
      purchase_date: prop.purchaseDate?.toISOString().split('T')[0],
      lease_expiry_date: prop.leaseExpiryDate?.toISOString().split('T')[0],
      epc_rating: prop.epcRating as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | undefined,
      maintenance_score: prop.maintenanceScore || undefined
    }));

    // Calculate individual scores with enhanced algorithms
    const propertyScores = [];
    for (const property of properties) {
      const scores = calculateEnhancedPropertyScores(property, strategy);
      propertyScores.push({
        property_id: property.property_id,
        lease_score: scores.lease_score,
        occupancy_score: scores.occupancy_score,
        noi_score: scores.noi_score,
        energy_score: scores.energy_score,
        capex_score: scores.capex_score,
        sustainability_score: scores.sustainability_score,
        market_score: scores.market_score
      });
    }
    
    // Calculate portfolio health with strategy-specific weighting
    const weights = getEnhancedStrategyWeights(strategy);
    const portfolioHealth = calculateEnhancedPortfolioHealth(propertyScores, weights);
    
    // Generate comprehensive recommendations
    const recommendations = generateEnhancedRecommendations(propertyScores, strategy, properties);
    
    // Create analysis result
    const analysisResult: AnalysisResponse = {
      portfolio_health: portfolioHealth,
      risk_level: assessEnhancedRiskLevel(portfolioHealth, propertyScores),
      performance_grade: calculatePerformanceGrade(portfolioHealth),
      recommendations: recommendations,
      property_scores: propertyScores
    };

    // Save analysis result to DB
    const createdAnalysis = await prisma.analysis.create({
      data: {
        userId: userId,
        uploadId: uploads[0]?.id || '', // Use first upload ID
        strategy: strategy,
        results: JSON.parse(JSON.stringify({
          portfolioHealth: analysisResult.portfolio_health,
          riskLevel: analysisResult.risk_level,
          performanceGrade: analysisResult.performance_grade,
          recommendations: analysisResult.recommendations,
          propertyScores: analysisResult.property_scores
        }))
      },
    });

    return NextResponse.json({ message: 'Analysis completed successfully', data: analysisResult }, { status: 200 });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to perform analysis' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const analyses = await prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ analyses }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch analyses' }, { status: 500 });
  }
}