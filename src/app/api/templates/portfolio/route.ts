import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Portfolio template with dummy data
    const templateData = [
      {
        property_id: 'PROP-001',
        name: 'Downtown Office Tower',
        type: 'Office',
        location: 'New York, NY',
        purchase_price: 25000000,
        current_value: 27500000,
        noi: 1800000,
        occupancy_rate: 0.92,
        purchase_date: '2020-01-15',
        lease_expiry_date: '2025-12-31',
        epc_rating: 'B',
        maintenance_score: 8
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
        'Content-Disposition': 'attachment; filename="portfolio_template.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
