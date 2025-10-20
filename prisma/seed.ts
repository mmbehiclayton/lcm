import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with live real estate data...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@lcm-analytics.com' },
    update: {},
    create: {
      email: 'demo@lcm-analytics.com',
      name: 'LCM Analytics Demo User',
      password: hashedPassword,
    },
  });

  console.log('✅ Created demo user:', user.email);

  // Create sample upload
  const upload = await prisma.upload.create({
    data: {
      userId: user.id,
      filename: 'real-estate-portfolio-2024.xlsx',
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileSize: 25680,
      filePath: '/uploads/real-estate-portfolio-2024.xlsx',
      metadata: {
        originalName: 'real-estate-portfolio-2024.xlsx',
        uploadedAt: new Date().toISOString(),
        summary: {
          totalProperties: 8,
          averageNOI: 1850000,
          averageOccupancy: 0.91,
          averageValue: 22500000,
          propertyTypes: { Office: 4, Retail: 2, Industrial: 2 },
          locations: { 'Manhattan, NY': 2, 'Brooklyn, NY': 1, 'Los Angeles, CA': 2, 'Chicago, IL': 1, 'Austin, TX': 1, 'Miami, FL': 1 }
        },
        warnings: []
      }
    },
  });

  console.log('✅ Created portfolio upload:', upload.filename);

  // Create realistic property portfolio
  const properties = [
    {
      uploadId: upload.id,
      propertyId: 'NYC-001',
      name: 'One World Trade Center Office Space',
      type: 'Office',
      location: 'Manhattan, NY',
      purchasePrice: 45000000,
      currentValue: 52000000,
      noi: 4160000,
      occupancyRate: 0.95,
      purchaseDate: new Date('2019-03-15'),
      leaseExpiryDate: new Date('2026-12-31'),
      epcRating: 'A',
      maintenanceScore: 9,
    },
    {
      uploadId: upload.id,
      propertyId: 'NYC-002',
      name: 'Brooklyn Heights Retail Complex',
      type: 'Retail',
      location: 'Brooklyn, NY',
      purchasePrice: 18000000,
      currentValue: 19500000,
      noi: 1560000,
      occupancyRate: 0.88,
      purchaseDate: new Date('2020-08-20'),
      leaseExpiryDate: new Date('2025-06-30'),
      epcRating: 'B',
      maintenanceScore: 7,
    },
    {
      uploadId: upload.id,
      propertyId: 'LA-001',
      name: 'Century City Office Tower',
      type: 'Office',
      location: 'Los Angeles, CA',
      purchasePrice: 32000000,
      currentValue: 35000000,
      noi: 2800000,
      occupancyRate: 0.92,
      purchaseDate: new Date('2018-11-05'),
      leaseExpiryDate: new Date('2027-03-15'),
      epcRating: 'A',
      maintenanceScore: 8,
    },
    {
      uploadId: upload.id,
      propertyId: 'LA-002',
      name: 'Beverly Hills Retail Plaza',
      type: 'Retail',
      location: 'Los Angeles, CA',
      purchasePrice: 22000000,
      currentValue: 24000000,
      noi: 1920000,
      occupancyRate: 0.94,
      purchaseDate: new Date('2021-01-10'),
      leaseExpiryDate: new Date('2026-08-20'),
      epcRating: 'B',
      maintenanceScore: 8,
    },
    {
      uploadId: upload.id,
      propertyId: 'CHI-001',
      name: 'Chicago Loop Office Building',
      type: 'Office',
      location: 'Chicago, IL',
      purchasePrice: 28000000,
      currentValue: 30000000,
      noi: 2400000,
      occupancyRate: 0.89,
      purchaseDate: new Date('2019-06-12'),
      leaseExpiryDate: new Date('2025-04-10'),
      epcRating: 'B',
      maintenanceScore: 7,
    },
    {
      uploadId: upload.id,
      propertyId: 'AUS-001',
      name: 'Austin Tech Campus',
      type: 'Office',
      location: 'Austin, TX',
      purchasePrice: 35000000,
      currentValue: 38000000,
      noi: 3040000,
      occupancyRate: 0.96,
      purchaseDate: new Date('2020-09-15'),
      leaseExpiryDate: new Date('2028-12-31'),
      epcRating: 'A',
      maintenanceScore: 9,
    },
    {
      uploadId: upload.id,
      propertyId: 'MIA-001',
      name: 'Miami Industrial Park',
      type: 'Industrial',
      location: 'Miami, FL',
      purchasePrice: 15000000,
      currentValue: 16500000,
      noi: 1320000,
      occupancyRate: 0.87,
      purchaseDate: new Date('2021-02-28'),
      leaseExpiryDate: new Date('2026-11-15'),
      epcRating: 'C',
      maintenanceScore: 6,
    },
    {
      uploadId: upload.id,
      propertyId: 'LA-003',
      name: 'Long Beach Industrial Complex',
      type: 'Industrial',
      location: 'Los Angeles, CA',
      purchasePrice: 12000000,
      currentValue: 13500000,
      noi: 1080000,
      occupancyRate: 0.85,
      purchaseDate: new Date('2020-04-22'),
      leaseExpiryDate: new Date('2025-09-30'),
      epcRating: 'B',
      maintenanceScore: 7,
    },
  ];

  for (const property of properties) {
    await prisma.property.create({ data: property });
  }

  console.log('✅ Created', properties.length, 'realistic properties');

  // Create sample leases for some properties
  const leases = [
    {
      uploadId: upload.id,
      propertyId: 'NYC-001',
      leaseId: 'LEASE-NYC-001-001',
      tenantName: 'Goldman Sachs',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2026-12-31'),
      monthlyRent: 180000,
      securityDeposit: 360000,
      renewalOption: true,
      breakClause: false,
    },
    {
      uploadId: upload.id,
      propertyId: 'NYC-001',
      leaseId: 'LEASE-NYC-001-002',
      tenantName: 'McKinsey & Company',
      startDate: new Date('2021-06-01'),
      endDate: new Date('2026-12-31'),
      monthlyRent: 120000,
      securityDeposit: 240000,
      renewalOption: true,
      breakClause: true,
    },
    {
      uploadId: upload.id,
      propertyId: 'LA-001',
      leaseId: 'LEASE-LA-001-001',
      tenantName: 'Netflix',
      startDate: new Date('2019-03-01'),
      endDate: new Date('2027-03-15'),
      monthlyRent: 200000,
      securityDeposit: 400000,
      renewalOption: true,
      breakClause: false,
    },
    {
      uploadId: upload.id,
      propertyId: 'AUS-001',
      leaseId: 'LEASE-AUS-001-001',
      tenantName: 'Tesla',
      startDate: new Date('2021-01-01'),
      endDate: new Date('2028-12-31'),
      monthlyRent: 250000,
      securityDeposit: 500000,
      renewalOption: true,
      breakClause: false,
    },
  ];

  for (const lease of leases) {
    await prisma.lease.create({ data: lease });
  }

  console.log('✅ Created', leases.length, 'sample leases');

  // Create sample transactions
  const transactions = [
    {
      uploadId: upload.id,
      propertyId: 'NYC-001',
      transactionId: 'TXN-001',
      transactionType: 'Rent',
      amount: 180000,
      transactionDate: new Date('2024-01-01'),
      counterparty: 'Goldman Sachs',
      status: 'Completed',
    },
    {
      uploadId: upload.id,
      propertyId: 'NYC-001',
      transactionId: 'TXN-002',
      transactionType: 'Rent',
      amount: 120000,
      transactionDate: new Date('2024-01-01'),
      counterparty: 'McKinsey & Company',
      status: 'Completed',
    },
    {
      uploadId: upload.id,
      propertyId: 'LA-001',
      transactionId: 'TXN-003',
      transactionType: 'Rent',
      amount: 200000,
      transactionDate: new Date('2024-01-01'),
      counterparty: 'Netflix',
      status: 'Completed',
    },
    {
      uploadId: upload.id,
      propertyId: 'AUS-001',
      transactionId: 'TXN-004',
      transactionType: 'Rent',
      amount: 250000,
      transactionDate: new Date('2024-01-01'),
      counterparty: 'Tesla',
      status: 'Completed',
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({ data: transaction });
  }

  console.log('✅ Created', transactions.length, 'sample transactions');

  // Create sample occupancy data
  const occupancyData = [
    {
      uploadId: upload.id,
      propertyId: 'NYC-001',
      propertyName: 'One World Trade Center Office Space',
      propertyType: 'Office',
      location: 'Manhattan, NY',
      totalUnits: 45,
      occupiedUnits: 43,
      occupancyRate: 0.96,
      averageRent: 180000,
      totalRevenue: 7740000,
      vacantUnits: 2,
      leaseExpirations: 3,
      riskLevel: 'Low',
    },
    {
      uploadId: upload.id,
      propertyId: 'LA-001',
      propertyName: 'Century City Office Tower',
      propertyType: 'Office',
      location: 'Los Angeles, CA',
      totalUnits: 38,
      occupiedUnits: 35,
      occupancyRate: 0.92,
      averageRent: 200000,
      totalRevenue: 8400000,
      vacantUnits: 3,
      leaseExpirations: 2,
      riskLevel: 'Low',
    },
  ];

  for (const occupancy of occupancyData) {
    await prisma.occupancyData.create({ data: occupancy });
  }

  console.log('✅ Created', occupancyData.length, 'sample occupancy records');

  // Create sample predictive data
  const predictiveData = [
    {
      uploadId: upload.id,
      propertyId: 'NYC-001',
      propertyName: 'One World Trade Center Office Space',
      propertyType: 'Office',
      location: 'Manhattan, NY',
      currentValue: 52000000,
      historicalValues: [45000000, 47000000, 49000000, 51000000, 52000000],
      marketTrends: { growth: 0.08, volatility: 0.12, demand: 0.95 },
      economicIndicators: { gdp: 0.025, inflation: 0.03, interest: 0.045 },
      rentalGrowthRates: [0.05, 0.06, 0.07, 0.08, 0.09],
      marketComparables: [
        { name: 'Empire State Building', value: 48000000, distance: 0.5 },
        { name: 'Chrysler Building', value: 42000000, distance: 0.8 }
      ],
      locationScore: 95,
      propertyAge: 5,
      condition: 'Excellent',
    },
    {
      uploadId: upload.id,
      propertyId: 'LA-001',
      propertyName: 'Century City Office Tower',
      propertyType: 'Office',
      location: 'Los Angeles, CA',
      currentValue: 35000000,
      historicalValues: [32000000, 33000000, 34000000, 34500000, 35000000],
      marketTrends: { growth: 0.06, volatility: 0.10, demand: 0.88 },
      economicIndicators: { gdp: 0.025, inflation: 0.03, interest: 0.045 },
      rentalGrowthRates: [0.04, 0.05, 0.06, 0.07, 0.08],
      marketComparables: [
        { name: 'US Bank Tower', value: 32000000, distance: 0.3 },
        { name: 'Aon Center', value: 28000000, distance: 0.6 }
      ],
      locationScore: 88,
      propertyAge: 6,
      condition: 'Very Good',
    },
  ];

  for (const predictive of predictiveData) {
    await prisma.predictiveData.create({ data: predictive });
  }

  console.log('✅ Created', predictiveData.length, 'sample predictive records');

  console.log('🎉 Database seeded successfully with live real estate data!');
  console.log('📧 Demo user: demo@lcm-analytics.com');
  console.log('🔑 Password: password123');
  console.log('🏢 Portfolio includes 8 properties across major US markets');
  console.log('📊 Data includes leases, transactions, occupancy, and predictive analytics');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });