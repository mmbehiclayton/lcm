import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all properties for the user
    const properties = await prisma.property.findMany({
      where: {
        upload: {
          userId: userId
        }
      },
      include: {
        upload: {
          select: {
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get actual predictive data from database
    const predictiveRecords = await prisma.predictiveData.findMany({
      where: {
        upload: {
          userId: userId
        }
      },
      include: {
        upload: {
          select: {
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Generate predictive models data
    const models = [
      {
        id: 'market-forecast',
        name: 'Market Value Forecast',
        description: 'Predicts property values based on market trends and economic indicators',
        accuracy: 87,
        lastUpdated: '2024-01-15',
        confidence: 'High'
      },
      {
        id: 'rental-growth',
        name: 'Rental Growth Prediction',
        description: 'Forecasts rental income growth based on location and property type',
        accuracy: 82,
        lastUpdated: '2024-01-10',
        confidence: 'Medium'
      },
      {
        id: 'occupancy-risk',
        name: 'Occupancy Risk Model',
        description: 'Predicts vacancy risk and optimal rent pricing strategies',
        accuracy: 79,
        lastUpdated: '2024-01-08',
        confidence: 'Medium'
      }
    ];

    // Transform database predictive data to API format
    const predictions = predictiveRecords.map(record => ({
      propertyId: record.propertyId,
      propertyName: record.propertyName,
      currentValue: record.currentValue,
      predictedValue: record.predictedValue || record.currentValue,
      growthRate: record.predictedValue ? 
        parseFloat((((record.predictedValue / record.currentValue) - 1) * 100).toFixed(1)) : 0,
      confidence: record.confidence || 75,
      timeframe: '12 months',
      historicalValues: record.historicalValues,
      marketTrends: record.marketTrends,
      economicIndicators: record.economicIndicators,
      locationScore: record.locationScore,
      propertyAge: record.propertyAge,
      condition: record.condition
    }));

    return NextResponse.json({
      models,
      predictions
    }, { status: 200 });
  } catch (error: any) {
    console.error('Predictive data error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch predictive data' }, { status: 500 });
  }
}
