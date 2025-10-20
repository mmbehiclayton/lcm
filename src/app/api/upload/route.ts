import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { validateFileUpload } from '@/lib/validations';
import { DataProcessor } from '@/lib/dataProcessor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const module = formData.get('module') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!module) {
      return NextResponse.json({ error: 'Module type is required' }, { status: 400 });
    }

    // Validate file
    const validation = await validateFileUpload(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const filePath = join(uploadsDir, filename);
    
    await writeFile(filePath, buffer);

    // Parse and validate data based on module type
    let parsedData;
    let cleanedData;
    let validationResult;
    let summary;

    try {
      parsedData = await DataProcessor.parseFile(file, filePath);
    } catch (error) {
      return NextResponse.json(
        { error: `Data parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    // Module-specific processing
    switch (module) {
      case 'portfolio':
        cleanedData = DataProcessor.cleanPropertyData(parsedData);
        validationResult = DataProcessor.validateDataCompleteness(cleanedData);
        summary = DataProcessor.generateDataSummary(cleanedData);
        break;
      
      case 'lease-analysis':
        cleanedData = DataProcessor.cleanLeaseData(parsedData);
        validationResult = DataProcessor.validateLeaseDataCompleteness(cleanedData);
        summary = DataProcessor.generateLeaseDataSummary(cleanedData);
        break;
      
      case 'transactions':
        cleanedData = DataProcessor.cleanTransactionData(parsedData);
        validationResult = DataProcessor.validateTransactionDataCompleteness(cleanedData);
        summary = DataProcessor.generateTransactionDataSummary(cleanedData);
        break;
      
      case 'occupancy':
        cleanedData = DataProcessor.cleanOccupancyData(parsedData);
        validationResult = DataProcessor.validateOccupancyDataCompleteness(cleanedData);
        summary = DataProcessor.generateOccupancyDataSummary(cleanedData);
        break;
      
      case 'predictive-modelling':
        cleanedData = DataProcessor.cleanPredictiveData(parsedData);
        validationResult = DataProcessor.validatePredictiveDataCompleteness(cleanedData);
        summary = DataProcessor.generatePredictiveDataSummary(cleanedData);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid module type' }, { status: 400 });
    }
    
    if (!validationResult.isValid) {
      return NextResponse.json(
        { 
          error: 'Data validation failed',
          details: {
            missingFields: validationResult.missingFields,
            warnings: validationResult.warnings
          }
        },
        { status: 400 }
      );
    }

    // Save to database
    const upload = await prisma.upload.create({
      data: {
        userId: 'default-user', // TODO: Get from authentication
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: filePath,
        module: module,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          summary: summary,
          warnings: validationResult.warnings,
          module: module
        }
      }
    });

    // Module-specific database operations
    let savedRecords = [];
    
    switch (module) {
      case 'portfolio':
        // Save properties to database
        savedRecords = await Promise.all(
          cleanedData.map(property =>
            prisma.property.create({
              data: {
                uploadId: upload.id,
                propertyId: property.property_id,
                name: property.name,
                type: property.type,
                location: property.location,
                purchasePrice: property.purchase_price,
                currentValue: property.current_value,
                noi: property.noi,
                occupancyRate: property.occupancy_rate,
                purchaseDate: property.purchase_date ? new Date(property.purchase_date) : null,
                leaseExpiryDate: property.lease_expiry_date ? new Date(property.lease_expiry_date) : null,
                epcRating: property.epc_rating,
                maintenanceScore: property.maintenance_score
              }
            })
          )
        );
        break;
      
      case 'lease-analysis':
        // Save lease data to database
        savedRecords = await Promise.all(
          cleanedData.map(lease =>
            prisma.lease.create({
              data: {
                uploadId: upload.id,
                propertyId: lease.property_id,
                leaseId: lease.lease_id,
                tenantName: lease.tenant_name,
                startDate: new Date(lease.lease_start),
                endDate: new Date(lease.lease_end),
                monthlyRent: lease.monthly_rent,
                securityDeposit: lease.security_deposit,
                renewalOption: lease.renewal_option,
                breakClause: lease.break_clause
              }
            })
          )
        );
        break;
      
      case 'transactions':
        // Save transaction data to database
        savedRecords = await Promise.all(
          cleanedData.map(transaction =>
            prisma.transaction.create({
              data: {
                uploadId: upload.id,
                propertyId: transaction.property_id,
                transactionId: transaction.transaction_id,
                transactionType: transaction.transaction_type,
                amount: transaction.amount,
                transactionDate: new Date(transaction.transaction_date),
                counterparty: transaction.counterparty,
                status: transaction.status,
                legalFees: transaction.legal_fees,
                brokerageFees: transaction.brokerage_fees,
                otherFees: transaction.other_fees,
                netAmount: transaction.net_amount,
                notes: transaction.notes
              }
            })
          )
        );
        break;
      
      case 'occupancy':
        // Save occupancy data to database
        savedRecords = await Promise.all(
          cleanedData.map(occupancy =>
            prisma.occupancyData.create({
              data: {
                uploadId: upload.id,
                propertyId: occupancy.property_id,
                propertyName: occupancy.property_name,
                propertyType: occupancy.property_type,
                location: occupancy.location,
                totalUnits: occupancy.total_units,
                occupiedUnits: occupancy.occupied_units,
                occupancyRate: occupancy.occupancy_rate,
                averageRent: occupancy.average_rent,
                totalRevenue: occupancy.total_revenue,
                vacantUnits: occupancy.vacant_units,
                leaseExpirations: occupancy.lease_expirations,
                riskLevel: occupancy.risk_level
              }
            })
          )
        );
        break;
      
      case 'predictive-modelling':
        // Save predictive data to database
        savedRecords = await Promise.all(
          cleanedData.map(predictive =>
            prisma.predictiveData.create({
              data: {
                uploadId: upload.id,
                propertyId: predictive.property_id,
                propertyName: predictive.property_name,
                propertyType: predictive.property_type,
                location: predictive.location,
                currentValue: predictive.current_value,
                historicalValues: predictive.historical_values,
                marketTrends: predictive.market_trends,
                economicIndicators: predictive.economic_indicators,
                rentalGrowthRates: predictive.rental_growth_rates,
                marketComparables: predictive.market_comparables,
                locationScore: predictive.location_score,
                propertyAge: predictive.property_age,
                condition: predictive.condition
              }
            })
          )
        );
        break;
    }

    return NextResponse.json({ 
      success: true, 
      uploadId: upload.id,
      filename: file.name,
      module: module,
      summary: summary,
      recordCount: savedRecords.length,
      warnings: validationResult.warnings
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const uploads = await prisma.upload.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        properties: true,
        analyses: true
      }
    });

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}
