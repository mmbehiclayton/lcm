import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get total properties count
    const totalProperties = await prisma.property.count({
      where: {
        upload: {
          userId: userId
        }
      }
    });

    // Get total portfolio value
    const properties = await prisma.property.findMany({
      where: {
        upload: {
          userId: userId
        }
      },
      select: {
        currentValue: true,
        occupancyRate: true,
        purchasePrice: true
      }
    });

    const totalValue = properties.reduce((sum, prop) => sum + (prop.currentValue || 0), 0);
    const averageOccupancy = properties.length > 0 
      ? properties.reduce((sum, prop) => sum + (prop.occupancyRate || 0), 0) / properties.length 
      : 0;

    // Calculate high-risk properties (occupancy < 70%)
    const highRiskProperties = properties.filter(prop => (prop.occupancyRate || 0) < 0.7).length;

    // Get recent uploads count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUploads = await prisma.upload.count({
      where: {
        userId: userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get last analysis date
    const lastAnalysis = await prisma.analysis.findFirst({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        createdAt: true
      }
    });

    const stats = {
      totalProperties,
      totalValue,
      averageOccupancy,
      highRiskProperties,
      recentUploads,
      lastAnalysis: lastAnalysis?.createdAt?.toISOString() || null
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error: unknown) {
    console.error('Dashboard stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
