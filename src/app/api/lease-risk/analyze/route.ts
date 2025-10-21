import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
import {
  calculateLeaseRiskScores,
  generateLeaseRiskActions,
  identifyLeaseRiskFactors,
  prioritizeLeaseInterventions,
  type PropertyData,
  type LeaseData,
  type MarketData,
  type LeaseRiskResponse
} from '@/lib/analytics-engine';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Extract data from request body
    const { properties, leases, market_data } = body;
    
    // Transform data to match analytics engine types
    const propertyData: PropertyData[] = properties.map((prop: any) => ({
      property_id: prop.property_id,
      name: prop.name || prop.property_id,
      type: prop.type?.toLowerCase() || 'office',
      location: prop.location,
      purchase_price: prop.purchase_price || 0,
      current_value: prop.current_value || 0,
      noi: prop.noi || 0,
      occupancy_rate: prop.occupancy_rate || 0.8,
      purchase_date: prop.purchase_date,
      lease_expiry_date: prop.lease_expiry_date,
      epc_rating: prop.epc_rating,
      maintenance_score: prop.maintenance_score
    }));

    const leaseData: LeaseData[] = leases.map((lease: any) => ({
      lease_id: lease.lease_id,
      property_id: lease.property_id,
      tenant_name: lease.tenant_name,
      lease_start: lease.lease_start,
      lease_end: lease.lease_end,
      monthly_rent: lease.monthly_rent,
      security_deposit: lease.security_deposit,
      renewal_option: lease.renewal_option,
      break_clause: lease.break_clause
    }));

    const marketData: MarketData[] = market_data.map((market: any) => ({
      location: market.location,
      property_type: market.property_type,
      market_rent: market.market_rent,
      demand_index: market.demand_index,
      economic_indicators: market.economic_indicators
    }));

    // Calculate lease risk scores
    const riskScores = calculateLeaseRiskScores(propertyData, leaseData, marketData);
    
    // Generate recommended actions
    const recommendedActions = generateLeaseRiskActions(riskScores, propertyData, leaseData);
    
    // Identify risk factors
    const riskFactors = identifyLeaseRiskFactors(propertyData, leaseData, marketData);
    
    // Set intervention priorities
    const interventionPriorities = prioritizeLeaseInterventions(riskScores, recommendedActions);
    
    // Create analysis result
    const analysisResult: LeaseRiskResponse = {
      risk_scores: riskScores,
      recommended_actions: recommendedActions,
      risk_factors: riskFactors,
      intervention_priorities: interventionPriorities
    };
    
    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error in lease risk analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze lease risk data' },
      { status: 500 }
    );
  }
}
