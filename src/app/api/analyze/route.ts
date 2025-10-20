import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
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
    const properties = dbProperties.map(prop => ({
      property_id: prop.propertyId,
      name: prop.name,
      type: prop.type as 'Office' | 'Retail' | 'Industrial' | 'Residential',
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

          // Call Python service for enhanced portfolio analysis
          const response = await fetch(`${PYTHON_SERVICE_URL}/portfolio/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              properties,
              strategy,
              analysis_date: new Date().toISOString().split('T')[0]
            }),
          });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.statusText}`);
    }

    const analysisResult = await response.json();

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