import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Occupancy template with dummy data
    const templateData = [
      {
        property_id: 'PROP-001',
        property_name: 'Downtown Office Tower',
        property_type: 'Office',
        location: 'New York, NY',
        total_units: 100,
        occupied_units: 92,
        occupancy_rate: 0.92,
        average_rent: 4500,
        total_revenue: 414000,
        vacant_units: 8,
        lease_expirations: 5,
        risk_level: 'Low'
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
        'Content-Disposition': 'attachment; filename="occupancy_template.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
