import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lease Analysis template with dummy data
    const templateData = [
      {
        lease_id: 'LEASE-001',
        property_id: 'PROP-001',
        tenant_name: 'TechCorp Inc.',
        lease_start: '2020-01-01',
        lease_end: '2025-12-31',
        monthly_rent: 45000,
        escalation_rate: 3.5,
        security_deposit: 135000,
        renewal_option: 'Yes',
        break_clause: 'No',
        tenant_credit_rating: 'A+',
        lease_status: 'Active'
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
        'Content-Disposition': 'attachment; filename="lease_analysis_template.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
