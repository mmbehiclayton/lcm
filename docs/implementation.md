# Implementation Guidelines
## LCM Analytics MVP - Real Estate Intelligence Platform

### Document Information
- **Version**: 1.0
- **Date**: October 2024
- **Project**: LCM Analytics MVP

---

## 1. Development Environment Setup

### 1.1 Prerequisites

```bash
# Required Software
- Node.js 18+ (LTS recommended)
- pnpm 8+ (package manager)
- PostgreSQL 14+
- Python 3.9+ (for optional analytics service)
- Git (version control)
```

### 1.2 Project Initialization

```bash
# Initialize Next.js project
npx create-next-app@latest lcm-analytics --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install additional dependencies
pnpm add @prisma/client prisma
pnpm add @tanstack/react-table
pnpm add recharts
pnpm add lucide-react
pnpm add papaparse
pnpm add @types/papaparse
pnpm add zod
pnpm add bcryptjs jsonwebtoken
pnpm add @types/bcryptjs @types/jsonwebtoken

# Development dependencies
pnpm add -D @types/node
pnpm add -D jest @testing-library/react @testing-library/jest-dom
pnpm add -D @playwright/test
```

### 1.3 Database Setup

```bash
# Initialize Prisma
npx prisma init

# Configure database connection in .env
DATABASE_URL="postgresql://username:password@localhost:5432/lcm_analytics"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

---

## 2. Frontend Implementation

### 2.1 Next.js 14 App Router Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard main
│   │   └── layout.tsx          # Dashboard layout
│   ├── upload/
│   │   └── page.tsx            # File upload page
│   ├── analysis/
│   │   └── [id]/
│   │       └── page.tsx        # Analysis results
│   └── api/
│       ├── auth/
│       ├── upload/
│       ├── analyze/
│       └── results/
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── charts/                 # Chart components
│   ├── tables/                 # Data table components
│   └── forms/                  # Form components
├── lib/
│   ├── utils.ts                # Utility functions
│   ├── validations.ts          # Zod schemas
│   ├── auth.ts                 # Authentication logic
│   └── analytics.ts            # Analytics calculations
└── types/
    └── index.ts                # TypeScript definitions
```

### 2.2 Core Components Implementation

#### 2.2.1 File Upload Component

```typescript
// src/components/forms/FileUpload.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  selectedFile?: File;
  isLoading?: boolean;
}

export function FileUpload({ onFileSelect, onRemove, selectedFile, isLoading }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  return (
    <div className="w-full">
      {selectedFile ? (
        <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <File className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
              <p className="text-xs text-green-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="text-red-600 hover:text-red-800"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop your file here' : 'Upload your data file'}
          </p>
          <p className="text-sm text-gray-500">
            Supports CSV and Excel files up to 50MB
          </p>
        </div>
      )}
    </div>
  );
}
```

#### 2.2.2 Dashboard Layout

```typescript
// src/app/dashboard/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

#### 2.2.3 Portfolio Health Chart

```typescript
// src/components/charts/PortfolioHealthChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PortfolioHealthChartProps {
  data: {
    property: string;
    healthScore: number;
    riskLevel: string;
  }[];
}

export function PortfolioHealthChart({ data }: PortfolioHealthChartProps) {
  return (
    <div className="w-full h-96">
      <h3 className="text-lg font-semibold mb-4">Portfolio Health Scores</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="property" />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value: number) => [`${value}%`, 'Health Score']}
            labelFormatter={(label) => `Property: ${label}`}
          />
          <Bar 
            dataKey="healthScore" 
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 2.3 State Management

```typescript
// src/lib/store/analysisStore.ts
import { create } from 'zustand';

interface AnalysisState {
  currentAnalysis: Analysis | null;
  uploads: Upload[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentAnalysis: (analysis: Analysis) => void;
  addUpload: (upload: Upload) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysis: null,
  uploads: [],
  isLoading: false,
  error: null,
  
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  addUpload: (upload) => set((state) => ({ uploads: [...state.uploads, upload] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
```

---

## 3. Backend Implementation

### 3.1 API Routes Structure

```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { validateFileUpload } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = await validateFileUpload(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const path = join(process.cwd(), 'uploads', filename);
    
    await writeFile(path, buffer);

    // Save to database
    const upload = await prisma.upload.create({
      data: {
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: path,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      uploadId: upload.id,
      filename: file.name 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' }, 
      { status: 500 }
    );
  }
}
```

### 3.2 Data Processing Service

```typescript
// src/lib/services/dataProcessor.ts
import Papa from 'papaparse';
import { z } from 'zod';

const PropertySchema = z.object({
  property_id: z.string(),
  name: z.string(),
  type: z.enum(['Office', 'Retail', 'Industrial', 'Residential']),
  location: z.string(),
  purchase_price: z.number().positive(),
  current_value: z.number().positive(),
  noi: z.number(),
  occupancy_rate: z.number().min(0).max(1),
  purchase_date: z.string().optional(),
  lease_expiry_date: z.string().optional(),
  epc_rating: z.string().optional(),
  maintenance_score: z.number().min(1).max(10).optional()
});

export class DataProcessor {
  static async parseCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(filePath, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const validatedData = results.data.map((row, index) => {
              const parsed = PropertySchema.parse(row);
              return { ...parsed, rowIndex: index + 1 };
            });
            resolve(validatedData);
          } catch (error) {
            reject(new Error(`Validation error at row ${error.issues[0]?.path}: ${error.issues[0]?.message}`));
          }
        },
        error: (error) => reject(error)
      });
    });
  }

  static async parseExcel(filePath: string): Promise<any[]> {
    // Implementation for Excel parsing using xlsx library
    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return data.map((row, index) => {
      const parsed = PropertySchema.parse(row);
      return { ...parsed, rowIndex: index + 1 };
    });
  }
}
```

### 3.3 Analytics Engine

```typescript
// src/lib/services/analyticsEngine.ts
export class AnalyticsEngine {
  static calculatePortfolioHealth(
    properties: Property[],
    strategy: 'growth' | 'hold' | 'divest'
  ): PortfolioAnalysis {
    const weights = this.getStrategyWeights(strategy);
    
    const metrics = properties.map(property => ({
      propertyId: property.property_id,
      leaseScore: this.calculateLeaseScore(property),
      occupancyScore: this.calculateOccupancyScore(property),
      noiScore: this.calculateNOIScore(property),
      energyScore: this.calculateEnergyScore(property),
      capexScore: this.calculateCapexScore(property)
    }));

    const portfolioHealth = metrics.reduce((total, metric) => {
      const weightedScore = 
        metric.leaseScore * weights.lease +
        metric.occupancyScore * weights.occupancy +
        metric.noiScore * weights.noi +
        metric.energyScore * weights.energy +
        metric.capexScore * weights.capex;
      
      return total + weightedScore;
    }, 0) / metrics.length;

    return {
      portfolioHealth,
      riskLevel: this.assessRiskLevel(portfolioHealth),
      performanceGrade: this.calculatePerformanceGrade(portfolioHealth),
      recommendations: this.generateRecommendations(metrics, strategy),
      metrics
    };
  }

  private static getStrategyWeights(strategy: string) {
    const weightConfigs = {
      growth: { lease: 0.3, occupancy: 0.2, noi: 0.3, energy: 0.1, capex: 0.1 },
      hold: { lease: 0.25, occupancy: 0.25, noi: 0.2, energy: 0.15, capex: 0.15 },
      divest: { lease: 0.4, occupancy: 0.1, noi: 0.2, energy: 0.2, capex: 0.1 }
    };
    
    return weightConfigs[strategy] || weightConfigs.hold;
  }

  private static calculateLeaseScore(property: Property): number {
    // Lease expiry analysis
    const daysToExpiry = property.lease_expiry_date 
      ? Math.ceil((new Date(property.lease_expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 365;
    
    if (daysToExpiry < 90) return 20; // High risk
    if (daysToExpiry < 180) return 40; // Medium risk
    if (daysToExpiry < 365) return 60; // Low risk
    return 80; // Good
  }

  private static calculateOccupancyScore(property: Property): number {
    const occupancyRate = property.occupancy_rate;
    if (occupancyRate >= 0.95) return 100;
    if (occupancyRate >= 0.90) return 90;
    if (occupancyRate >= 0.80) return 75;
    if (occupancyRate >= 0.70) return 60;
    return 40;
  }

  private static calculateNOIScore(property: Property): number {
    const noiYield = property.noi / property.current_value;
    if (noiYield >= 0.08) return 100;
    if (noiYield >= 0.06) return 80;
    if (noiYield >= 0.04) return 60;
    return 40;
  }

  private static calculateEnergyScore(property: Property): number {
    const epcRatings = { 'A': 100, 'B': 80, 'C': 60, 'D': 40, 'E': 20, 'F': 10, 'G': 0 };
    return epcRatings[property.epc_rating] || 50;
  }

  private static calculateCapexScore(property: Property): number {
    return (property.maintenance_score || 5) * 10;
  }

  private static assessRiskLevel(score: number): string {
    if (score >= 80) return 'Low';
    if (score >= 60) return 'Medium';
    return 'High';
  }

  private static calculatePerformanceGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    return 'C';
  }

  private static generateRecommendations(
    metrics: PropertyMetrics[],
    strategy: string
  ): string[] {
    const recommendations = [];
    
    const lowLeaseScores = metrics.filter(m => m.leaseScore < 50);
    if (lowLeaseScores.length > 0) {
      recommendations.push('Review lease renewals for properties with expiring leases');
    }
    
    const lowOccupancyScores = metrics.filter(m => m.occupancyScore < 60);
    if (lowOccupancyScores.length > 0) {
      recommendations.push('Implement marketing strategy for vacant properties');
    }
    
    if (strategy === 'growth') {
      recommendations.push('Consider acquisition opportunities in high-performing markets');
    } else if (strategy === 'divest') {
      recommendations.push('Identify underperforming assets for potential divestment');
    }
    
    return recommendations;
  }
}
```

---

## 4. Database Implementation

### 4.1 Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  uploads   Upload[]
  analyses  Analysis[]
  
  @@map("users")
}

model Upload {
  id        String   @id @default(cuid())
  userId    String
  filename  String
  fileType  String
  fileSize  Int
  filePath  String
  metadata  Json?
  createdAt DateTime @default(now())
  
  user      User      @relation(fields: [userId], references: [id])
  analyses  Analysis[]
  properties Property[]
  
  @@map("uploads")
}

model Analysis {
  id        String   @id @default(cuid())
  userId    String
  uploadId  String
  strategy  String
  results   Json?
  createdAt DateTime @default(now())
  
  user      User   @relation(fields: [userId], references: [id])
  upload    Upload @relation(fields: [uploadId], references: [id])
  
  @@map("analyses")
}

model Property {
  id               String   @id @default(cuid())
  uploadId         String
  propertyId       String
  name             String
  type             String
  location         String
  purchasePrice    Float?
  currentValue     Float?
  noi              Float?
  occupancyRate    Float?
  purchaseDate     DateTime?
  leaseExpiryDate  DateTime?
  epcRating        String?
  maintenanceScore Float?
  createdAt        DateTime @default(now())
  
  upload Upload @relation(fields: [uploadId], references: [id])
  
  @@map("properties")
}
```

### 4.2 Database Migrations

```bash
# Create initial migration
npx prisma migrate dev --name init

# Create migration for new features
npx prisma migrate dev --name add_scoring_tables

# Reset database (development only)
npx prisma migrate reset
```

---

## 5. Python Service Integration

### 5.1 FastAPI Service Setup

```python
# python-service/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

app = FastAPI(title="LCM Analytics Python Service")

class PropertyData(BaseModel):
    property_id: str
    name: str
    type: str
    location: str
    purchase_price: float
    current_value: float
    noi: float
    occupancy_rate: float
    purchase_date: str = None
    lease_expiry_date: str = None
    epc_rating: str = None
    maintenance_score: float = None

class AnalysisRequest(BaseModel):
    properties: List[PropertyData]
    strategy: str
    weights: Dict[str, float] = None

class AnalysisResponse(BaseModel):
    portfolio_health: float
    risk_level: str
    performance_grade: str
    recommendations: List[str]
    property_scores: List[Dict[str, Any]]

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_portfolio(request: AnalysisRequest):
    try:
        # Convert to DataFrame for analysis
        df = pd.DataFrame([prop.dict() for prop in request.properties])
        
        # Calculate individual scores
        property_scores = []
        for _, property in df.iterrows():
            scores = calculate_property_scores(property)
            property_scores.append({
                "property_id": property["property_id"],
                "lease_score": scores["lease_score"],
                "occupancy_score": scores["occupancy_score"],
                "noi_score": scores["noi_score"],
                "energy_score": scores["energy_score"],
                "capex_score": scores["capex_score"]
            })
        
        # Calculate portfolio health
        weights = get_strategy_weights(request.strategy, request.weights)
        portfolio_health = calculate_portfolio_health(property_scores, weights)
        
        # Generate recommendations
        recommendations = generate_recommendations(property_scores, request.strategy)
        
        return AnalysisResponse(
            portfolio_health=portfolio_health,
            risk_level=assess_risk_level(portfolio_health),
            performance_grade=calculate_performance_grade(portfolio_health),
            recommendations=recommendations,
            property_scores=property_scores
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_property_scores(property: pd.Series) -> Dict[str, float]:
    """Calculate individual property scores"""
    scores = {}
    
    # Lease score calculation
    if pd.notna(property["lease_expiry_date"]):
        days_to_expiry = (pd.to_datetime(property["lease_expiry_date"]) - pd.Timestamp.now()).days
        if days_to_expiry < 90:
            scores["lease_score"] = 20
        elif days_to_expiry < 180:
            scores["lease_score"] = 40
        elif days_to_expiry < 365:
            scores["lease_score"] = 60
        else:
            scores["lease_score"] = 80
    else:
        scores["lease_score"] = 50
    
    # Occupancy score
    occupancy_rate = property["occupancy_rate"]
    if occupancy_rate >= 0.95:
        scores["occupancy_score"] = 100
    elif occupancy_rate >= 0.90:
        scores["occupancy_score"] = 90
    elif occupancy_rate >= 0.80:
        scores["occupancy_score"] = 75
    elif occupancy_rate >= 0.70:
        scores["occupancy_score"] = 60
    else:
        scores["occupancy_score"] = 40
    
    # NOI score
    noi_yield = property["noi"] / property["current_value"]
    if noi_yield >= 0.08:
        scores["noi_score"] = 100
    elif noi_yield >= 0.06:
        scores["noi_score"] = 80
    elif noi_yield >= 0.04:
        scores["noi_score"] = 60
    else:
        scores["noi_score"] = 40
    
    # Energy score
    epc_ratings = {"A": 100, "B": 80, "C": 60, "D": 40, "E": 20, "F": 10, "G": 0}
    scores["energy_score"] = epc_ratings.get(property["epc_rating"], 50)
    
    # Capex score
    scores["capex_score"] = (property["maintenance_score"] or 5) * 10
    
    return scores

def get_strategy_weights(strategy: str, custom_weights: Dict[str, float] = None) -> Dict[str, float]:
    """Get weights based on strategy"""
    if custom_weights:
        return custom_weights
    
    weight_configs = {
        "growth": {"lease": 0.3, "occupancy": 0.2, "noi": 0.3, "energy": 0.1, "capex": 0.1},
        "hold": {"lease": 0.25, "occupancy": 0.25, "noi": 0.2, "energy": 0.15, "capex": 0.15},
        "divest": {"lease": 0.4, "occupancy": 0.1, "noi": 0.2, "energy": 0.2, "capex": 0.1}
    }
    
    return weight_configs.get(strategy, weight_configs["hold"])

def calculate_portfolio_health(property_scores: List[Dict], weights: Dict[str, float]) -> float:
    """Calculate overall portfolio health score"""
    total_score = 0
    for property in property_scores:
        weighted_score = (
            property["lease_score"] * weights["lease"] +
            property["occupancy_score"] * weights["occupancy"] +
            property["noi_score"] * weights["noi"] +
            property["energy_score"] * weights["energy"] +
            property["capex_score"] * weights["capex"]
        )
        total_score += weighted_score
    
    return total_score / len(property_scores)

def assess_risk_level(score: float) -> str:
    """Assess risk level based on score"""
    if score >= 80:
        return "Low"
    elif score >= 60:
        return "Medium"
    else:
        return "High"

def calculate_performance_grade(score: float) -> str:
    """Calculate performance grade"""
    if score >= 90:
        return "A+"
    elif score >= 85:
        return "A"
    elif score >= 80:
        return "B+"
    elif score >= 75:
        return "B"
    elif score >= 70:
        return "C+"
    else:
        return "C"

def generate_recommendations(property_scores: List[Dict], strategy: str) -> List[str]:
    """Generate actionable recommendations"""
    recommendations = []
    
    # Analyze lease scores
    low_lease_scores = [p for p in property_scores if p["lease_score"] < 50]
    if low_lease_scores:
        recommendations.append("Review lease renewals for properties with expiring leases")
    
    # Analyze occupancy scores
    low_occupancy_scores = [p for p in property_scores if p["occupancy_score"] < 60]
    if low_occupancy_scores:
        recommendations.append("Implement marketing strategy for vacant properties")
    
    # Strategy-specific recommendations
    if strategy == "growth":
        recommendations.append("Consider acquisition opportunities in high-performing markets")
    elif strategy == "divest":
        recommendations.append("Identify underperforming assets for potential divestment")
    
    return recommendations

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 5.2 Python Service Integration

```typescript
// src/lib/services/pythonService.ts
export class PythonService {
  private static baseUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

  static async analyzePortfolio(
    properties: Property[],
    strategy: string,
    customWeights?: Record<string, number>
  ): Promise<AnalysisResult> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties,
          strategy,
          weights: customWeights
        })
      });

      if (!response.ok) {
        throw new Error(`Python service error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Python service error:', error);
      throw new Error('Failed to analyze portfolio with Python service');
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
```

---

## 6. Testing Implementation

### 6.1 Unit Testing Setup

```typescript
// tests/unit/analytics.test.ts
import { AnalyticsEngine } from '@/lib/services/analyticsEngine';
import { Property } from '@/types';

describe('AnalyticsEngine', () => {
  const mockProperties: Property[] = [
    {
      property_id: 'PROP_001',
      name: 'Test Property',
      type: 'Office',
      location: 'New York',
      purchase_price: 1000000,
      current_value: 1100000,
      noi: 88000,
      occupancy_rate: 0.85,
      purchase_date: '2020-01-01',
      lease_expiry_date: '2025-12-31',
      epc_rating: 'B',
      maintenance_score: 8
    }
  ];

  test('should calculate portfolio health for growth strategy', () => {
    const result = AnalyticsEngine.calculatePortfolioHealth(mockProperties, 'growth');
    
    expect(result.portfolioHealth).toBeGreaterThan(0);
    expect(result.portfolioHealth).toBeLessThanOrEqual(100);
    expect(result.riskLevel).toMatch(/Low|Medium|High/);
    expect(result.performanceGrade).toMatch(/A\+|A|B\+|B|C\+|C/);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  test('should handle missing optional fields', () => {
    const propertyWithMissingFields = {
      ...mockProperties[0],
      epc_rating: undefined,
      maintenance_score: undefined
    };

    const result = AnalyticsEngine.calculatePortfolioHealth([propertyWithMissingFields], 'hold');
    
    expect(result.portfolioHealth).toBeGreaterThan(0);
    expect(result.metrics[0].energyScore).toBe(50); // Default value
    expect(result.metrics[0].capexScore).toBe(50); // Default value
  });
});
```

### 6.2 Integration Testing

```typescript
// tests/integration/api.test.ts
import { NextRequest } from 'next/server';
import { POST as uploadHandler } from '@/app/api/upload/route';
import { POST as analyzeHandler } from '@/app/api/analyze/route';

describe('API Integration Tests', () => {
  test('should handle complete upload and analysis workflow', async () => {
    // Mock file upload
    const formData = new FormData();
    const mockFile = new File(['property_id,name,type\nPROP_001,Test,Office'], 'test.csv', {
      type: 'text/csv'
    });
    formData.append('file', mockFile);

    const uploadRequest = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });

    const uploadResponse = await uploadHandler(uploadRequest);
    const uploadData = await uploadResponse.json();
    
    expect(uploadResponse.status).toBe(200);
    expect(uploadData.uploadId).toBeDefined();

    // Mock analysis request
    const analysisRequest = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        uploadId: uploadData.uploadId,
        strategy: 'growth'
      })
    });

    const analysisResponse = await analyzeHandler(analysisRequest);
    const analysisData = await analysisResponse.json();
    
    expect(analysisResponse.status).toBe(200);
    expect(analysisData.portfolioHealth).toBeDefined();
    expect(analysisData.recommendations).toBeDefined();
  });
});
```

### 6.3 End-to-End Testing

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test('should complete full analysis workflow', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/upload');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample-data.csv');
    
    // Wait for upload to complete
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    
    // Navigate to analysis
    await page.click('[data-testid="analyze-button"]');
    
    // Select strategy
    await page.selectOption('[data-testid="strategy-select"]', 'growth');
    
    // Start analysis
    await page.click('[data-testid="start-analysis"]');
    
    // Wait for results
    await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible();
    
    // Verify dashboard elements
    await expect(page.locator('[data-testid="portfolio-health-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommendations-list"]')).toBeVisible();
    
    // Test export functionality
    await page.click('[data-testid="export-pdf"]');
    await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
  });
});
```

---

## 7. Deployment Configuration

### 7.1 Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/lcm_analytics"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
PYTHON_SERVICE_URL="http://localhost:8000"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="52428800" # 50MB
```

### 7.2 Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 7.3 Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "PYTHON_SERVICE_URL": "@python_service_url"
  }
}
```

---

*This implementation guide provides comprehensive instructions for building the LCM Analytics MVP with modern development practices, robust testing, and scalable architecture.*
