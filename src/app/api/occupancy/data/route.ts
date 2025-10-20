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

    // Transform properties to occupancy data format
    const occupancyData = properties.map(prop => {
      const occupancyRate = (prop.occupancyRate || 0) * 100;
      const totalUnits = Math.floor(Math.random() * 200) + 50; // Mock total units
      const occupiedUnits = Math.floor(totalUnits * (prop.occupancyRate || 0));
      const vacantUnits = totalUnits - occupiedUnits;
      
      // Calculate average rent based on NOI and occupancy
      const avgRent = prop.noi && prop.occupancyRate 
        ? (prop.noi / occupiedUnits) / 12 
        : Math.floor(Math.random() * 5000) + 1000;
      
      const totalRevenue = avgRent * occupiedUnits * 12;
      
      // Mock lease expirations (random between 0-20)
      const leaseExpirations = Math.floor(Math.random() * 20);
      
      // Determine risk level based on occupancy
      let riskLevel = 'Low';
      if (occupancyRate < 80) riskLevel = 'High';
      else if (occupancyRate < 90) riskLevel = 'Medium';

      return {
        propertyId: prop.id,
        propertyName: prop.name,
        location: prop.location,
        type: prop.type,
        totalUnits,
        occupiedUnits,
        occupancyRate: parseFloat(occupancyRate.toFixed(1)),
        avgRent: Math.floor(avgRent),
        totalRevenue: Math.floor(totalRevenue),
        vacantUnits,
        leaseExpirations,
        riskLevel
      };
    });

    return NextResponse.json(occupancyData, { status: 200 });
  } catch (error: any) {
    console.error('Occupancy data error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch occupancy data' }, { status: 500 });
  }
}
