import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE endpoint to clear all predictive modelling data for the current user
 * This includes: Analysis results, Property data, and PredictiveData records
 */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Delete in the correct order due to foreign key constraints
    
    // 1. Delete analysis results for predictive strategy
    const deletedAnalyses = await prisma.analysis.deleteMany({
      where: {
        userId: userId,
        strategy: 'predictive'
      }
    });

    // 2. Get all upload IDs for this user
    const userUploads = await prisma.upload.findMany({
      where: { userId: userId },
      select: { id: true }
    });

    const uploadIds = userUploads.map(u => u.id);

    // 3. Delete predictive data records
    const deletedPredictiveData = await prisma.predictiveData.deleteMany({
      where: {
        uploadId: { in: uploadIds }
      }
    });

    // 4. Delete property records (if any were created for predictive modelling)
    // Note: Be careful here as properties might be used by other modules
    // We'll only delete if explicitly requested via query parameter
    const clearProperties = req.nextUrl.searchParams.get('clearProperties') === 'true';
    let deletedProperties = 0;
    
    if (clearProperties) {
      const result = await prisma.property.deleteMany({
        where: {
          uploadId: { in: uploadIds }
        }
      });
      deletedProperties = result.count;
    }

    console.log('Cleared predictive data:', {
      userId,
      deletedAnalyses: deletedAnalyses.count,
      deletedPredictiveData: deletedPredictiveData.count,
      deletedProperties
    });

    return NextResponse.json({
      success: true,
      message: 'Predictive modelling data cleared successfully',
      deleted: {
        analyses: deletedAnalyses.count,
        predictiveData: deletedPredictiveData.count,
        properties: deletedProperties
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error clearing predictive data:', error);
    return NextResponse.json({
      error: error.message || 'Failed to clear predictive data'
    }, { status: 500 });
  }
}

