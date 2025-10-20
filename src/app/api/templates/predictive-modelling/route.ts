import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Predictive Modelling template with dummy data
    const templateData = [
      {
        property_id: 'PROP-001',
        property_name: 'Downtown Office Tower',
        property_type: 'Office',
        location: 'New York, NY',
        current_value: 27500000,
        historical_values: '25000000,26000000,27000000,27500000',
        market_trends: 'Growing',
        economic_indicators: 'Stable',
        rental_growth_rates: '3.5%',
        market_comparables: 'Similar properties in area',
        location_score: 8.5,
        property_age: 15,
        condition: 'Excellent'
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
        'Content-Disposition': 'attachment; filename="predictive_modelling_template.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
