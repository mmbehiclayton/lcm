import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

    // Get actual occupancy data from database
    const occupancyRecords = await prisma.occupancyData.findMany({
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

    // Transform database occupancy data to API format
    const occupancyData = occupancyRecords.map(record => ({
      propertyId: record.propertyId,
      propertyName: record.propertyName,
      location: record.location,
      type: record.propertyType,
      totalUnits: record.totalUnits,
      occupiedUnits: record.occupiedUnits,
      occupancyRate: parseFloat(record.occupancyRate.toFixed(1)), // Already in percentage format
      avgRent: Math.floor(record.averageRent),
      totalRevenue: Math.floor(record.totalRevenue),
      vacantUnits: record.vacantUnits,
      leaseExpirations: record.leaseExpirations,
      riskLevel: record.riskLevel
    }));

    return NextResponse.json(occupancyData, { status: 200 });
  } catch (error: any) {
    console.error('Occupancy data error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch occupancy data' }, { status: 500 });
  }
}
