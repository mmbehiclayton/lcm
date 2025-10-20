import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });

  console.log('✅ Created test user:', user.email);

  // Create sample upload
  const upload = await prisma.upload.create({
    data: {
      userId: user.id,
      filename: 'sample-real-estate-data.xlsx',
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileSize: 15420,
      filePath: '/uploads/sample-real-estate-data.xlsx',
      metadata: {
        originalName: 'sample-real-estate-data.xlsx',
        uploadedAt: new Date().toISOString(),
        summary: {
          totalProperties: 10,
          averageNOI: 1440000,
          averageOccupancy: 0.88,
          averageValue: 18500000,
          propertyTypes: { Office: 3, Retail: 3, Industrial: 3, Residential: 1 },
          locations: { 'New York, NY': 1, 'Los Angeles, CA': 1, 'Chicago, IL': 1, 'Miami, FL': 1, 'Seattle, WA': 1, 'Dallas, TX': 1, 'Detroit, MI': 1, 'San Francisco, CA': 1, 'Boston, MA': 1, 'Atlanta, GA': 1 }
        },
        warnings: []
      }
    },
  });

  console.log('✅ Created sample upload:', upload.filename);

  // Create sample properties
  const properties = [
    {
      uploadId: upload.id,
      propertyId: 'prop-001',
      name: 'Downtown Office Tower',
      type: 'Office',
      location: 'New York, NY',
      purchasePrice: 22000000,
      currentValue: 25000000,
      noi: 1800000,
      occupancyRate: 0.85,
      purchaseDate: new Date('2020-03-15'),
      leaseExpiryDate: new Date('2025-12-31'),
      epcRating: 'B',
      maintenanceScore: 7,
    },
    {
      uploadId: upload.id,
      propertyId: 'prop-002',
      name: 'Retail Plaza Center',
      type: 'Retail',
      location: 'Los Angeles, CA',
      purchasePrice: 11000000,
      currentValue: 12000000,
      noi: 960000,
      occupancyRate: 0.92,
      purchaseDate: new Date('2019-08-20'),
      leaseExpiryDate: new Date('2024-06-30'),
      epcRating: 'C',
      maintenanceScore: 6,
    },
    {
      uploadId: upload.id,
      propertyId: 'prop-003',
      name: 'Industrial Warehouse Complex',
      type: 'Industrial',
      location: 'Chicago, IL',
      purchasePrice: 8000000,
      currentValue: 8500000,
      noi: 680000,
      occupancyRate: 0.78,
      purchaseDate: new Date('2021-01-10'),
      leaseExpiryDate: new Date('2026-03-15'),
      epcRating: 'A',
      maintenanceScore: 8,
    },
    {
      uploadId: upload.id,
      propertyId: 'prop-004',
      name: 'Residential Apartment Building',
      type: 'Residential',
      location: 'Miami, FL',
      purchasePrice: 14000000,
      currentValue: 15000000,
      noi: 1200000,
      occupancyRate: 0.95,
      purchaseDate: new Date('2018-11-05'),
      leaseExpiryDate: new Date('2023-08-20'),
      epcRating: 'B',
      maintenanceScore: 7,
    },
    {
      uploadId: upload.id,
      propertyId: 'prop-005',
      name: 'Mixed-Use Development',
      type: 'Office',
      location: 'Seattle, WA',
      purchasePrice: 30000000,
      currentValue: 32000000,
      noi: 2560000,
      occupancyRate: 0.88,
      purchaseDate: new Date('2020-06-12'),
      leaseExpiryDate: new Date('2027-04-10'),
      epcRating: 'A',
      maintenanceScore: 9,
    },
  ];

  for (const property of properties) {
    await prisma.property.create({ data: property });
  }

  console.log('✅ Created', properties.length, 'sample properties');

  // Create sample analysis
  const analysis = await prisma.analysis.create({
    data: {
      userId: user.id,
      uploadId: upload.id,
      strategy: 'growth',
      results: {
        portfolioHealth: 78.5,
        riskLevel: 'Medium',
        performanceGrade: 'B+',
        recommendations: [
          'Consider divesting the Retail Plaza Center due to low maintenance score',
          'Focus on lease renewals for properties expiring in 2024-2025',
          'Invest in energy efficiency upgrades for properties with C/D EPC ratings'
        ],
        metrics: [
          {
            propertyId: 'prop-001',
            leaseScore: 85,
            occupancyScore: 85,
            noiScore: 90,
            energyScore: 70,
            capexScore: 80
          },
          {
            propertyId: 'prop-002',
            leaseScore: 75,
            occupancyScore: 92,
            noiScore: 85,
            energyScore: 50,
            capexScore: 60
          },
          {
            propertyId: 'prop-003',
            leaseScore: 90,
            occupancyScore: 78,
            noiScore: 85,
            energyScore: 95,
            capexScore: 90
          },
          {
            propertyId: 'prop-004',
            leaseScore: 60,
            occupancyScore: 95,
            noiScore: 90,
            energyScore: 75,
            capexScore: 80
          },
          {
            propertyId: 'prop-005',
            leaseScore: 95,
            occupancyScore: 88,
            noiScore: 95,
            energyScore: 95,
            capexScore: 95
          }
        ]
      }
    },
  });

  console.log('✅ Created sample analysis');

  console.log('🎉 Database seeded successfully!');
  console.log('📧 Test user: test@example.com');
  console.log('🔑 Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
