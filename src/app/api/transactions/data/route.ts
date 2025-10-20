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

    // Get all properties for the user to generate transaction data
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

    // Generate transaction data based on properties
    const transactionData = properties.map((prop, index) => {
      const transactionTypes = ['Purchase', 'Sale', 'Refinance'];
      const counterparties = ['ABC Real Estate LLC', 'XYZ Investment Group', 'Industrial Partners Inc', 'Metro Bank', 'City Holdings Ltd'];
      const statuses = ['Completed', 'Pending', 'In Progress'];
      
      const type = transactionTypes[index % transactionTypes.length];
      const counterparty = counterparties[index % counterparties.length];
      const status = statuses[index % statuses.length];
      
      // Calculate fees (0.5% of amount)
      const fees = Math.floor((prop.currentValue || 0) * 0.005);
      const netAmount = (prop.currentValue || 0) - fees;
      
      // Generate transaction date (within last 2 years)
      const transactionDate = new Date();
      transactionDate.setFullYear(transactionDate.getFullYear() - Math.floor(Math.random() * 2));
      transactionDate.setMonth(Math.floor(Math.random() * 12));
      transactionDate.setDate(Math.floor(Math.random() * 28) + 1);

      return {
        id: `txn-${String(index + 1).padStart(3, '0')}`,
        type,
        propertyName: prop.name,
        propertyId: prop.id,
        amount: prop.currentValue || 0,
        date: transactionDate.toISOString().split('T')[0],
        status,
        counterparty,
        fees,
        netAmount
      };
    });

    return NextResponse.json(transactionData, { status: 200 });
  } catch (error: any) {
    console.error('Transaction data error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch transaction data' }, { status: 500 });
  }
}
