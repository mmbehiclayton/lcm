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
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');

    // Use requested userId if provided and user is authenticated
    const targetUserId = requestedUserId || userId;

    // Get all properties for the user
    const properties = await prisma.property.findMany({
      where: {
        upload: {
          userId: targetUserId
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

    // Calculate portfolio metrics
    const totalProperties = properties.length;
    const totalValue = properties.reduce((sum, prop) => sum + (prop.currentValue || 0), 0);
    const totalNOI = properties.reduce((sum, prop) => sum + (prop.noi || 0), 0);
    const averageOccupancy = properties.length > 0 
      ? properties.reduce((sum, prop) => sum + (prop.occupancyRate || 0), 0) / properties.length 
      : 0;

    // Transform properties for frontend
    const transformedProperties = properties.map(prop => ({
      id: prop.id,
      name: prop.name,
      type: prop.type,
      location: prop.location,
      value: prop.currentValue || 0,
      noi: prop.noi || 0,
      occupancy: prop.occupancyRate || 0,
      purchaseDate: prop.purchaseDate?.toISOString().split('T')[0] || '',
      performance: calculatePerformanceGrade(prop.occupancyRate || 0, prop.noi || 0, prop.currentValue || 0)
    }));

    const portfolioData = {
      totalProperties,
      totalValue,
      totalNOI,
      averageOccupancy,
      properties: transformedProperties
    };

    return NextResponse.json(portfolioData, { status: 200 });
  } catch (error: any) {
    console.error('Portfolio data error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch portfolio data' }, { status: 500 });
  }
}

function calculatePerformanceGrade(occupancy: number, noi: number, value: number): string {
  const noiYield = value > 0 ? noi / value : 0;
  
  // Simple scoring based on occupancy and NOI yield
  let score = 0;
  
  // Occupancy scoring (0-50 points)
  if (occupancy >= 0.95) score += 50;
  else if (occupancy >= 0.90) score += 40;
  else if (occupancy >= 0.80) score += 30;
  else if (occupancy >= 0.70) score += 20;
  else score += 10;
  
  // NOI yield scoring (0-50 points)
  if (noiYield >= 0.08) score += 50;
  else if (noiYield >= 0.06) score += 40;
  else if (noiYield >= 0.04) score += 30;
  else if (noiYield >= 0.02) score += 20;
  else score += 10;
  
  // Convert to letter grade
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'C+';
  return 'C';
}
