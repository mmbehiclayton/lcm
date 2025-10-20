import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Call Python service for lease risk analysis
    const response = await fetch(`${PYTHON_SERVICE_URL}/lease-risk/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.statusText}`);
    }

    const analysisResult = await response.json();
    
    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error in lease risk analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze lease risk data' },
      { status: 500 }
    );
  }
}
