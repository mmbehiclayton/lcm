import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { validateFileUpload } from '@/lib/validations';
import { DataProcessor } from '@/lib/dataProcessor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'authenticated' : 'not authenticated');
    
    if (!session?.user?.id) {
      console.log('No user ID in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      console.log('Parsing file:', file.name, 'Type:', file.type);
      parsedData = await DataProcessor.parseFile(file, filePath);
      console.log('Parsed data length:', parsedData.length);
      console.log('First parsed record:', parsedData[0]);
      
      if (parsedData.length === 0) {
        return NextResponse.json(
          { 
            error: 'No data found in file. Please ensure your file contains data and is in the correct format.',
            details: {
              filename: file.name,
              fileType: file.type,
              fileSize: file.size
            }
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Data parsing error:', error);
      return NextResponse.json(
        { 
          error: `Data parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: {
            filename: file.name,
            fileType: file.type,
            fileSize: file.size
          }
        },
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
        console.log('Processing transaction data...');
        console.log('Raw parsed data before cleaning:', parsedData.slice(0, 2));
        cleanedData = DataProcessor.cleanTransactionData(parsedData);
        console.log('Cleaned data after processing:', cleanedData.slice(0, 2));
        validationResult = DataProcessor.validateTransactionDataCompleteness(cleanedData);
        console.log('Validation result:', validationResult);
        summary = DataProcessor.generateTransactionDataSummary(cleanedData);
        console.log('Summary:', summary);
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
        userId: session.user.id,
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
    
    console.log(`Processing ${module} data:`, { recordCount: cleanedData.length, userId: session.user.id });
    
    switch (module) {
      case 'portfolio':
        // Save properties to database
        savedRecords = await Promise.all(
          cleanedData.map(property =>
            prisma.property.create({
              data: {
                uploadId: upload.id,
                propertyId: property.property_id,
                name: property.property_name || property.name || 'Unknown Property',
                type: property.property_type || property.type || 'Unknown',
                location: property.location || 'Unknown Location',
                purchasePrice: property.purchase_price || 0,
                currentValue: property.current_value || 0,
                noi: property.noi || 0,
                occupancyRate: property.occupancy_rate || 0,
                purchaseDate: property.purchase_date ? new Date(property.purchase_date) : null,
                leaseExpiryDate: property.lease_expiry_date ? new Date(property.lease_expiry_date) : null,
                epcRating: property.epc_rating || null,
                maintenanceScore: property.maintenance_score || null
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
                tenantId: lease.tenant_id || null,
                tenantName: lease.tenant_name,
                startDate: new Date(lease.lease_start),
                endDate: new Date(lease.lease_end),
                monthlyRent: lease.monthly_rent,
                escalationRate: lease.escalation_rate || null,
                securityDeposit: lease.security_deposit,
                renewalOption: lease.renewal_option,
                breakClause: lease.break_clause,
                tenantCreditRating: lease.tenant_credit_rating || null,
                leaseStatus: lease.lease_status || 'Active'
              }
            })
          )
        );
        break;
      
      case 'transactions':
        // Save transaction data to database
        console.log('Raw cleaned data length:', cleanedData.length);
        console.log('First cleaned record:', cleanedData[0]);
        console.log('Upload ID:', upload.id);
        
        if (cleanedData.length === 0) {
          console.log('No cleaned data to save');
          return NextResponse.json(
            { 
              error: 'No valid transaction data found after processing. Please check your data format and required fields.',
              details: {
                validationResult,
                summary
              }
            },
            { status: 400 }
          );
        } else {
          try {
            console.log('Attempting to save transaction data...');
            
            // Use a database transaction to ensure all records are saved
            savedRecords = await prisma.$transaction(async (tx) => {
              const records = [];
              const propertyIds = Array.from(new Set(cleanedData.map(t => t.property_id)));
              
              // First, ensure all properties exist
              console.log('Ensuring properties exist for IDs:', propertyIds);
              for (const propertyId of propertyIds) {
                const existingProperty = await tx.property.findFirst({
                  where: { propertyId: propertyId }
                });
                
                if (!existingProperty) {
                  console.log(`Creating property record for ${propertyId}`);
                  
                  // Generate a more meaningful property name
                  const propertyName = propertyId.includes('PROP-') 
                    ? `Property ${propertyId.replace('PROP-', '')}`
                    : `Property ${propertyId}`;
                  
                  await tx.property.create({
                    data: {
                      uploadId: upload.id,
                      propertyId: propertyId,
                      name: propertyName,
                      location: 'Location TBD',
                      type: 'Commercial',
                      purchasePrice: 0,
                      currentValue: 0,
                      noi: 0,
                      occupancyRate: 0,
                      maintenanceScore: 0,
                      purchaseDate: new Date()
                    }
                  });
                }
              }
              
              // Then create transaction records
              for (let i = 0; i < cleanedData.length; i++) {
                const transaction = cleanedData[i];
                console.log(`Processing transaction ${i + 1}:`, {
                  transaction_id: transaction.transaction_id,
                  property_id: transaction.property_id,
                  amount: transaction.amount,
                  transaction_type: transaction.transaction_type
                });
                
                const record = await tx.transaction.create({
                  data: {
                    uploadId: upload.id,
                    propertyId: transaction.property_id,
                    tenantId: transaction.tenant_id || null,
                    leaseId: transaction.lease_id || null,
                    transactionId: transaction.transaction_id,
                    transactionType: transaction.transaction_type,
                    amount: transaction.amount,
                    expectedAmount: transaction.expected_amount || transaction.amount,
                    transactionDate: new Date(transaction.transaction_date),
                    dueDate: transaction.due_date ? new Date(transaction.due_date) : new Date(transaction.transaction_date),
                    counterparty: transaction.counterparty,
                    status: transaction.status,
                    paymentMethod: transaction.payment_method || null,
                    reference: transaction.reference || null,
                    legalFees: transaction.legal_fees,
                    brokerageFees: transaction.brokerage_fees,
                    otherFees: transaction.other_fees,
                    netAmount: transaction.net_amount,
                    notes: transaction.notes
                  }
                });
                records.push(record);
                console.log(`Saved transaction ${i + 1} with ID: ${record.id}`);
              }
              return records;
            });
            
            console.log(`Successfully saved ${savedRecords.length} transaction records`);
            
            // Verify the records were actually saved
            const verifyRecords = await prisma.transaction.findMany({
              where: { uploadId: upload.id }
            });
            console.log(`Verification: Found ${verifyRecords.length} records in database for upload ${upload.id}`);
          } catch (error) {
            console.error('Error saving transaction data:', error);
            console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            throw error;
          }
        }
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
                riskLevel: occupancy.risk_level,
                // Sensor data fields
                deskUsage: occupancy.desk_usage || null,
                badgeIns: occupancy.badge_ins || null,
                meetingRoomUsage: occupancy.meeting_room_usage || null,
                lightingUsage: occupancy.lighting_usage || null,
                temperatureAvg: occupancy.temperature_avg || null,
                // Historical data fields
                avgOccupancy3Months: occupancy.avg_occupancy_3_months || null,
                avgOccupancy6Months: occupancy.avg_occupancy_6_months || null,
                avgOccupancy12Months: occupancy.avg_occupancy_12_months || null,
                peakUsage: occupancy.peak_usage || null,
                // Lease compliance fields
                permittedUsage: occupancy.permitted_usage || null,
                sublettingAllowed: occupancy.subletting_allowed !== undefined ? occupancy.subletting_allowed : null,
                coworkingRestrictions: occupancy.coworking_restrictions !== undefined ? occupancy.coworking_restrictions : null,
                maxOccupancy: occupancy.max_occupancy || null,
                // Tenant info fields
                businessType: occupancy.business_type || null,
                headcountEstimate: occupancy.headcount_estimate || null,
                actualHeadcount: occupancy.actual_headcount || null
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

    console.log('Upload completed successfully:', {
      uploadId: upload.id,
      filename: file.name,
      module: module,
      recordsCount: savedRecords.length
    });

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
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uploads = await prisma.upload.findMany({
      where: {
        userId: session.user.id
      },
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
