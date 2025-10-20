import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Comprehensive transactions template with various risk profiles
    const templateData = [
      {
        transaction_id: 'TXN-001',
        property_id: 'PROP-001',
        transaction_type: 'Rent',
        transaction_date: '2024-01-01',
        amount: 15000,
        counterparty: 'Goldman Sachs',
        status: 'Completed',
        legal_fees: 0,
        brokerage_fees: 0,
        other_fees: 0,
        net_amount: 15000,
        notes: 'Monthly rent payment - on time'
      },
      {
        transaction_id: 'TXN-002',
        property_id: 'PROP-001',
        transaction_type: 'Service',
        transaction_date: '2024-01-15',
        amount: 2500,
        counterparty: 'Maintenance Co',
        status: 'Completed',
        legal_fees: 0,
        brokerage_fees: 0,
        other_fees: 0,
        net_amount: 2500,
        notes: 'Building maintenance service charge'
      },
      {
        transaction_id: 'TXN-003',
        property_id: 'PROP-002',
        transaction_type: 'Rent',
        transaction_date: '2024-01-05',
        amount: 12000,
        counterparty: 'Netflix Inc',
        status: 'Completed',
        legal_fees: 0,
        brokerage_fees: 0,
        other_fees: 0,
        net_amount: 12000,
        notes: 'Monthly rent - 5 days late'
      },
      {
        transaction_id: 'TXN-004',
        property_id: 'PROP-003',
        transaction_type: 'Purchase',
        transaction_date: '2023-12-15',
        amount: 50000000,
        counterparty: 'Real Estate Partners',
        status: 'Completed',
        legal_fees: 250000,
        brokerage_fees: 150000,
        other_fees: 100000,
        net_amount: 49500000,
        notes: 'Office building acquisition'
      },
      {
        transaction_id: 'TXN-005',
        property_id: 'PROP-004',
        transaction_type: 'Sale',
        transaction_date: '2023-11-20',
        amount: 35000000,
        counterparty: 'Investment Group LLC',
        status: 'Completed',
        legal_fees: 175000,
        brokerage_fees: 105000,
        other_fees: 70000,
        net_amount: 34650000,
        notes: 'Retail property disposition'
      },
      {
        transaction_id: 'TXN-006',
        property_id: 'PROP-001',
        transaction_type: 'Deposit',
        transaction_date: '2023-06-01',
        amount: 45000,
        counterparty: 'Goldman Sachs',
        status: 'Completed',
        legal_fees: 0,
        brokerage_fees: 0,
        other_fees: 0,
        net_amount: 45000,
        notes: 'Security deposit - 3 months rent'
      },
      {
        transaction_id: 'TXN-007',
        property_id: 'PROP-002',
        transaction_type: 'Refinance',
        transaction_date: '2024-01-10',
        amount: 30000000,
        counterparty: 'Metro Bank',
        status: 'Pending',
        legal_fees: 150000,
        brokerage_fees: 90000,
        other_fees: 60000,
        net_amount: 29700000,
        notes: 'Property refinancing - pending approval'
      },
      {
        transaction_id: 'TXN-008',
        property_id: 'PROP-005',
        transaction_type: 'Rent',
        transaction_date: '2024-01-20',
        amount: 8000,
        counterparty: 'Startup Co',
        status: 'Failed',
        legal_fees: 0,
        brokerage_fees: 0,
        other_fees: 0,
        net_amount: 0,
        notes: 'Rent payment failed - insufficient funds'
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
