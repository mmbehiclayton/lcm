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

    // Transform properties for frontend consumption
    const transformedProperties = properties.map(prop => ({
      id: prop.id,
      name: prop.name,
      type: prop.type,
      location: prop.location,
      currentValue: prop.currentValue || 0,
      purchasePrice: prop.purchasePrice || 0,
      purchaseDate: prop.purchaseDate?.toISOString().split('T')[0] || '',
      noi: prop.noi || 0,
      occupancyRate: prop.occupancyRate || 0,
      epcRating: prop.epcRating,
      maintenanceScore: prop.maintenanceScore,
      leaseExpiryDate: prop.leaseExpiryDate?.toISOString().split('T')[0] || null,
      createdAt: prop.createdAt.toISOString().split('T')[0]
    }));

    return NextResponse.json(transformedProperties, { status: 200 });
  } catch (error: any) {
    console.error('Properties data error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch properties data' }, { status: 500 });
  }
}
