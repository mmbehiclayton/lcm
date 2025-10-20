import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Transactions template with dummy data
    const templateData = [
      {
        transaction_id: 'TXN-001',
        property_id: 'PROP-001',
        transaction_type: 'Purchase',
        transaction_date: '2023-06-15',
        amount: 25000000,
        counterparty: 'ABC Real Estate LLC',
        status: 'Completed',
        legal_fees: 125000,
        brokerage_fees: 75000,
        other_fees: 50000,
        net_amount: 24750000,
        notes: 'Office building acquisition'
      }
    ];

    // Convert to CSV format
    const headers = Object.keys(templateData[0]);
    const csvContent = [
      headers.join(','),
      ...templateData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="transactions_template.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
