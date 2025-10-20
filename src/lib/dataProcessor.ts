import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

export class DataProcessor {
  /**
   * Parse CSV file and return data
   */
  static async parseCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(filePath, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            resolve(results.data as any[]);
          } catch (error) {
            reject(new Error(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        },
        error: (error: any) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  }

  /**
   * Parse Excel file and return data
   */
  static async parseExcel(filePath: string): Promise<any[]> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      return data as any[];
    } catch (error) {
      throw new Error(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect file type based on content
   */
  static detectFileType(file: File): 'csv' | 'excel' | 'unknown' {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'csv') return 'csv';
    if (['xlsx', 'xls'].includes(extension || '')) return 'excel';
    
    return 'unknown';
  }

  /**
   * Parse file based on detected type
   */
  static async parseFile(file: File, filePath: string): Promise<any[]> {
    const fileType = this.detectFileType(file);
    
    switch (fileType) {
      case 'csv':
        return await this.parseCSV(filePath);
      case 'excel':
        return await this.parseExcel(filePath);
      default:
        throw new Error('Unsupported file type');
    }
  }

  /**
   * Clean and normalize property data
   */
  static cleanPropertyData(properties: any[]): any[] {
    return properties.map(property => ({
      ...property,
      name: property.name?.trim() || '',
      location: property.location?.trim() || '',
      type: property.type?.trim() || '',
      // Ensure numeric values are properly formatted
      purchase_price: Number(property.purchase_price || 0),
      current_value: Number(property.current_value || 0),
      noi: Number(property.noi || 0),
      occupancy_rate: Number(property.occupancy_rate || 0),
      maintenance_score: property.maintenance_score ? Number(property.maintenance_score) : undefined,
      // Ensure dates are properly formatted
      purchase_date: property.purchase_date ? this.formatDate(property.purchase_date) : undefined,
      lease_expiry_date: property.lease_expiry_date ? this.formatDate(property.lease_expiry_date) : undefined,
    }));
  }

  /**
   * Validate property data completeness
   */
  static validateDataCompleteness(properties: any[]): {
    isValid: boolean;
    missingFields: string[];
    warnings: string[];
  } {
    const missingFields: string[] = [];
    const warnings: string[] = [];
    
    // Check for required fields
    const requiredFields = ['property_id', 'name', 'type', 'location', 'current_value', 'noi', 'occupancy_rate'];
    
    properties.forEach((property, index) => {
      requiredFields.forEach(field => {
        if (!property[field]) {
          missingFields.push(`Row ${index + 1}: ${field}`);
        }
      });
      
      // Check for data quality issues
      if (property.occupancy_rate && property.occupancy_rate > 1) {
        warnings.push(`Row ${index + 1}: Occupancy rate > 100%`);
      }
      
      if (property.noi && property.noi < 0) {
        warnings.push(`Row ${index + 1}: Negative NOI`);
      }
      
      if (property.current_value && property.current_value <= 0) {
        warnings.push(`Row ${index + 1}: Invalid current value`);
      }
    });
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings
    };
  }

  /**
   * Generate data summary statistics
   */
  static generateDataSummary(properties: any[]): {
    totalProperties: number;
    averageNOI: number;
    averageOccupancy: number;
    averageValue: number;
    propertyTypes: Record<string, number>;
    locations: Record<string, number>;
  } {
    const totalProperties = properties.length;
    const averageNOI = properties.reduce((sum, p) => sum + (p.noi || 0), 0) / totalProperties;
    const averageOccupancy = properties.reduce((sum, p) => sum + (p.occupancy_rate || 0), 0) / totalProperties;
    const averageValue = properties.reduce((sum, p) => sum + (p.current_value || 0), 0) / totalProperties;
    
    const propertyTypes = properties.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const locations = properties.reduce((acc, p) => {
      acc[p.location] = (acc[p.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalProperties,
      averageNOI: Math.round(averageNOI * 100) / 100,
      averageOccupancy: Math.round(averageOccupancy * 100) / 100,
      averageValue: Math.round(averageValue * 100) / 100,
      propertyTypes,
      locations
    };
  }

  /**
   * Clean and validate lease data
   */
  static cleanLeaseData(data: any[]): any[] {
    return data.map(lease => ({
      lease_id: lease.lease_id || lease.leaseId,
      property_id: lease.property_id || lease.propertyId,
      tenant_name: lease.tenant_name || lease.tenantName,
      lease_start: lease.lease_start || lease.leaseStart,
      lease_end: lease.lease_end || lease.leaseEnd,
      monthly_rent: parseFloat(lease.monthly_rent || lease.monthlyRent || 0),
      escalation_rate: parseFloat(lease.escalation_rate || lease.escalationRate || 0),
      security_deposit: parseFloat(lease.security_deposit || lease.securityDeposit || 0),
      renewal_option: lease.renewal_option === 'Yes' || lease.renewalOption === true,
      break_clause: lease.break_clause === 'Yes' || lease.breakClause === true,
      tenant_credit_rating: lease.tenant_credit_rating || lease.tenantCreditRating,
      lease_status: lease.lease_status || lease.leaseStatus || 'Active'
    }));
  }

  /**
   * Validate lease data completeness
   */
  static validateLeaseDataCompleteness(data: any[]): { isValid: boolean; missingFields: string[]; warnings: string[] } {
    const requiredFields = ['lease_id', 'property_id', 'tenant_name', 'lease_start', 'lease_end', 'monthly_rent'];
    const missingFields: string[] = [];
    const warnings: string[] = [];

    data.forEach((lease, index) => {
      requiredFields.forEach(field => {
        if (!lease[field] || lease[field] === '') {
          missingFields.push(`Row ${index + 1}: ${field}`);
        }
      });

      // Check for data quality issues
      if (lease.monthly_rent && lease.monthly_rent <= 0) {
        warnings.push(`Row ${index + 1}: Monthly rent should be positive`);
      }
      
      if (lease.lease_start && lease.lease_end && new Date(lease.lease_start) >= new Date(lease.lease_end)) {
        warnings.push(`Row ${index + 1}: Lease start date should be before end date`);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings
    };
  }

  /**
   * Generate lease data summary
   */
  static generateLeaseDataSummary(data: any[]): any {
    if (data.length === 0) {
      return { totalLeases: 0, totalRent: 0, averageRent: 0, expiringSoon: 0 };
    }

    const totalRent = data.reduce((sum, lease) => sum + (lease.monthly_rent || 0), 0);
    const now = new Date();
    const expiringSoon = data.filter(lease => {
      const endDate = new Date(lease.lease_end);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 90 && diffDays > 0;
    }).length;

    return {
      totalLeases: data.length,
      totalRent,
      averageRent: totalRent / data.length,
      expiringSoon
    };
  }

  /**
   * Clean and validate transaction data
   */
  static cleanTransactionData(data: any[]): any[] {
    return data.map(transaction => ({
      transaction_id: transaction.transaction_id || transaction.transactionId,
      property_id: transaction.property_id || transaction.propertyId,
      transaction_type: transaction.transaction_type || transaction.transactionType,
      transaction_date: transaction.transaction_date || transaction.transactionDate,
      amount: parseFloat(transaction.amount || 0),
      counterparty: transaction.counterparty || transaction.counterpartyName,
      status: transaction.status || 'Completed',
      legal_fees: parseFloat(transaction.legal_fees || transaction.legalFees || 0),
      brokerage_fees: parseFloat(transaction.brokerage_fees || transaction.brokerageFees || 0),
      other_fees: parseFloat(transaction.other_fees || transaction.otherFees || 0),
      net_amount: parseFloat(transaction.net_amount || transaction.netAmount || 0),
      notes: transaction.notes || transaction.transactionNotes
    }));
  }

  /**
   * Validate transaction data completeness
   */
  static validateTransactionDataCompleteness(data: any[]): { isValid: boolean; missingFields: string[]; warnings: string[] } {
    const requiredFields = ['transaction_id', 'property_id', 'transaction_type', 'transaction_date', 'amount'];
    const missingFields: string[] = [];
    const warnings: string[] = [];

    data.forEach((transaction, index) => {
      requiredFields.forEach(field => {
        if (!transaction[field] || transaction[field] === '') {
          missingFields.push(`Row ${index + 1}: ${field}`);
        }
      });

      if (transaction.amount && transaction.amount <= 0) {
        warnings.push(`Row ${index + 1}: Transaction amount should be positive`);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings
    };
  }

  /**
   * Generate transaction data summary
   */
  static generateTransactionDataSummary(data: any[]): any {
    if (data.length === 0) {
      return { totalTransactions: 0, totalVolume: 0, totalFees: 0 };
    }

    const totalVolume = data.reduce((sum, txn) => sum + (txn.amount || 0), 0);
    const totalFees = data.reduce((sum, txn) => sum + ((txn.legal_fees || 0) + (txn.brokerage_fees || 0) + (txn.other_fees || 0)), 0);
    const completedTransactions = data.filter(txn => txn.status === 'Completed').length;

    return {
      totalTransactions: data.length,
      totalVolume,
      totalFees,
      completedTransactions
    };
  }

  /**
   * Clean and validate occupancy data
   */
  static cleanOccupancyData(data: any[]): any[] {
    return data.map(occupancy => ({
      property_id: occupancy.property_id || occupancy.propertyId,
      property_name: occupancy.property_name || occupancy.propertyName,
      property_type: occupancy.property_type || occupancy.propertyType,
      location: occupancy.location,
      total_units: parseInt(occupancy.total_units || occupancy.totalUnits || 0),
      occupied_units: parseInt(occupancy.occupied_units || occupancy.occupiedUnits || 0),
      occupancy_rate: parseFloat(occupancy.occupancy_rate || occupancy.occupancyRate || 0),
      average_rent: parseFloat(occupancy.average_rent || occupancy.averageRent || 0),
      total_revenue: parseFloat(occupancy.total_revenue || occupancy.totalRevenue || 0),
      vacant_units: parseInt(occupancy.vacant_units || occupancy.vacantUnits || 0),
      lease_expirations: parseInt(occupancy.lease_expirations || occupancy.leaseExpirations || 0),
      risk_level: occupancy.risk_level || occupancy.riskLevel || 'Low'
    }));
  }

  /**
   * Validate occupancy data completeness
   */
  static validateOccupancyDataCompleteness(data: any[]): { isValid: boolean; missingFields: string[]; warnings: string[] } {
    const requiredFields = ['property_id', 'property_name', 'total_units', 'occupied_units', 'occupancy_rate'];
    const missingFields: string[] = [];
    const warnings: string[] = [];

    data.forEach((occupancy, index) => {
      requiredFields.forEach(field => {
        if (!occupancy[field] || occupancy[field] === '') {
          missingFields.push(`Row ${index + 1}: ${field}`);
        }
      });

      if (occupancy.occupancy_rate && (occupancy.occupancy_rate < 0 || occupancy.occupancy_rate > 1)) {
        warnings.push(`Row ${index + 1}: Occupancy rate should be between 0 and 1`);
      }

      if (occupancy.occupied_units && occupancy.total_units && occupancy.occupied_units > occupancy.total_units) {
        warnings.push(`Row ${index + 1}: Occupied units cannot exceed total units`);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings
    };
  }

  /**
   * Generate occupancy data summary
   */
  static generateOccupancyDataSummary(data: any[]): any {
    if (data.length === 0) {
      return { totalProperties: 0, totalUnits: 0, overallOccupancy: 0, totalRevenue: 0 };
    }

    const totalUnits = data.reduce((sum, prop) => sum + (prop.total_units || 0), 0);
    const occupiedUnits = data.reduce((sum, prop) => sum + (prop.occupied_units || 0), 0);
    const totalRevenue = data.reduce((sum, prop) => sum + (prop.total_revenue || 0), 0);
    const overallOccupancy = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    return {
      totalProperties: data.length,
      totalUnits,
      overallOccupancy,
      totalRevenue
    };
  }

  /**
   * Clean and validate predictive data
   */
  static cleanPredictiveData(data: any[]): any[] {
    return data.map(predictive => ({
      property_id: predictive.property_id || predictive.propertyId,
      property_name: predictive.property_name || predictive.propertyName,
      property_type: predictive.property_type || predictive.propertyType,
      location: predictive.location,
      current_value: parseFloat(predictive.current_value || predictive.currentValue || 0),
      historical_values: predictive.historical_values || predictive.historicalValues,
      market_trends: predictive.market_trends || predictive.marketTrends,
      economic_indicators: predictive.economic_indicators || predictive.economicIndicators,
      rental_growth_rates: predictive.rental_growth_rates || predictive.rentalGrowthRates,
      market_comparables: predictive.market_comparables || predictive.marketComparables,
      location_score: parseFloat(predictive.location_score || predictive.locationScore || 0),
      property_age: parseInt(predictive.property_age || predictive.propertyAge || 0),
      condition: predictive.condition || 'Good'
    }));
  }

  /**
   * Validate predictive data completeness
   */
  static validatePredictiveDataCompleteness(data: any[]): { isValid: boolean; missingFields: string[]; warnings: string[] } {
    const requiredFields = ['property_id', 'property_name', 'current_value'];
    const missingFields: string[] = [];
    const warnings: string[] = [];

    data.forEach((predictive, index) => {
      requiredFields.forEach(field => {
        if (!predictive[field] || predictive[field] === '') {
          missingFields.push(`Row ${index + 1}: ${field}`);
        }
      });

      if (predictive.current_value && predictive.current_value <= 0) {
        warnings.push(`Row ${index + 1}: Current value should be positive`);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings
    };
  }

  /**
   * Generate predictive data summary
   */
  static generatePredictiveDataSummary(data: any[]): any {
    if (data.length === 0) {
      return { totalProperties: 0, totalValue: 0, averageLocationScore: 0 };
    }

    const totalValue = data.reduce((sum, prop) => sum + (prop.current_value || 0), 0);
    const totalLocationScore = data.reduce((sum, prop) => sum + (prop.location_score || 0), 0);
    const averageLocationScore = totalLocationScore / data.length;

    return {
      totalProperties: data.length,
      totalValue,
      averageLocationScore
    };
  }

  /**
   * Format date string to ISO format
   */
  private static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    } catch (error) {
      throw new Error(`Invalid date format: ${dateString}`);
    }
  }
}