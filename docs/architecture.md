# System Architecture
## LCM Analytics MVP - Real Estate Intelligence Platform

### Document Information
- **Version**: 1.0
- **Date**: October 2024
- **Project**: LCM Analytics MVP

---

## 1. System Architecture Overview

The LCM Analytics MVP follows a hybrid full-stack architecture combining Next.js for the primary application with an optional Python FastAPI microservice for advanced analytics.

### 1.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React Frontend]
        Mobile[Mobile Browser]
    end
    
    subgraph "Application Layer"
        NextJS[Next.js Application]
        API[API Routes]
        Auth[Authentication]
    end
    
    subgraph "Business Logic Layer"
        Upload[File Upload Handler]
        Parser[Data Parser]
        Analytics[Analytics Engine]
        Scoring[Scoring Logic]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL Database)]
        Cache[(Redis Cache)]
        Files[File Storage]
    end
    
    subgraph "External Services"
        Python[Python FastAPI Service]
        ML[ML Models]
        External[External APIs]
    end
    
    UI --> NextJS
    Mobile --> NextJS
    NextJS --> API
    API --> Upload
    API --> Parser
    API --> Analytics
    Analytics --> Scoring
    Scoring --> DB
    Analytics --> Python
    Python --> ML
    NextJS --> Auth
    Auth --> DB
    API --> Cache
    Upload --> Files
    Python --> External
```

### 1.2 Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        Dashboard[Dashboard]
        Upload[File Upload]
        Charts[Charts & Visualizations]
        Tables[Data Tables]
        Maps[Interactive Maps]
    end
    
    subgraph "Backend Services"
        UploadAPI[Upload API]
        AnalysisAPI[Analysis API]
        ResultsAPI[Results API]
        AuthAPI[Auth API]
    end
    
    subgraph "Data Processing"
        Validation[Data Validation]
        Parsing[CSV/Excel Parsing]
        Scoring[Portfolio Scoring]
        Analytics[Analytics Engine]
    end
    
    subgraph "Storage"
        Database[(PostgreSQL)]
        FileStore[File Storage]
        Cache[(Redis)]
    end
    
    Dashboard --> UploadAPI
    Upload --> UploadAPI
    Charts --> ResultsAPI
    Tables --> ResultsAPI
    Maps --> ResultsAPI
    
    UploadAPI --> Validation
    Validation --> Parsing
    Parsing --> Scoring
    Scoring --> Analytics
    Analytics --> Database
    UploadAPI --> FileStore
    ResultsAPI --> Cache
```

---

## 2. Data Flow Architecture

### 2.1 Primary Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Routes
    participant P as Parser
    participant S as Scoring Engine
    participant D as Database
    participant V as Visualization
    
    U->>F: Upload CSV/Excel file
    F->>A: POST /api/upload
    A->>P: Parse and validate data
    P->>A: Return parsed data
    A->>S: Process scoring logic
    S->>D: Store results
    D->>S: Confirm storage
    S->>A: Return analysis results
    A->>F: Send JSON response
    F->>V: Render charts/tables
    V->>U: Display dashboard
```

### 2.2 Analytics Processing Flow

```mermaid
flowchart TD
    A[File Upload] --> B{File Validation}
    B -->|Valid| C[Parse Data]
    B -->|Invalid| D[Return Error]
    C --> E[Data Cleaning]
    E --> F[Strategy Selection]
    F --> G[Apply Scoring Weights]
    G --> H[Calculate Metrics]
    H --> I[Generate Scores]
    I --> J[Risk Assessment]
    J --> K[Recommendations]
    K --> L[Store Results]
    L --> M[Return Analysis]
    M --> N[Display Dashboard]
```

---

## 3. Technology Stack Architecture

### 3.1 Frontend Architecture

```mermaid
graph TB
    subgraph "Next.js 14 App Router"
        Pages[Pages & Layouts]
        Components[React Components]
        Hooks[Custom Hooks]
        Utils[Utility Functions]
    end
    
    subgraph "UI Framework"
        Tailwind[TailwindCSS]
        Icons[Lucide Icons]
        Charts[Recharts]
        Tables[TanStack Table]
    end
    
    subgraph "State Management"
        Context[React Context]
        Local[Local State]
        Server[Server State]
    end
    
    Pages --> Components
    Components --> Hooks
    Components --> Utils
    Components --> Tailwind
    Components --> Icons
    Components --> Charts
    Components --> Tables
    Components --> Context
```

### 3.2 Backend Architecture

```mermaid
graph TB
    subgraph "Next.js API Routes"
        UploadRoute[/api/upload]
        AnalysisRoute[/api/analyze]
        ResultsRoute[/api/results]
        AuthRoute[/api/auth]
    end
    
    subgraph "Business Logic"
        FileHandler[File Handler]
        DataParser[Data Parser]
        ScoringEngine[Scoring Engine]
        AnalyticsEngine[Analytics Engine]
    end
    
    subgraph "Database Layer"
        Prisma[Prisma ORM]
        Migrations[Database Migrations]
        Queries[Query Builder]
    end
    
    subgraph "External Services"
        PythonAPI[Python FastAPI]
        MLModels[ML Models]
        ExternalAPIs[External APIs]
    end
    
    UploadRoute --> FileHandler
    AnalysisRoute --> DataParser
    AnalysisRoute --> ScoringEngine
    ResultsRoute --> AnalyticsEngine
    ScoringEngine --> Prisma
    AnalyticsEngine --> PythonAPI
    PythonAPI --> MLModels
    PythonAPI --> ExternalAPIs
```

---

## 4. Database Architecture

### 4.1 Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ ANALYSIS : creates
    USER ||--o{ UPLOAD : performs
    ANALYSIS ||--o{ PORTFOLIO_SCORE : contains
    ANALYSIS ||--o{ LEASE_SCORE : contains
    ANALYSIS ||--o{ OCCUPANCY_SCORE : contains
    UPLOAD ||--o{ PROPERTY : contains
    UPLOAD ||--o{ LEASE : contains
    PROPERTY ||--o{ LEASE : has
    PROPERTY ||--o{ OCCUPANCY : has
    
    USER {
        string id PK
        string email
        string name
        datetime created_at
        datetime updated_at
    }
    
    ANALYSIS {
        string id PK
        string user_id FK
        string strategy
        datetime created_at
        json results
    }
    
    UPLOAD {
        string id PK
        string user_id FK
        string filename
        string file_type
        datetime uploaded_at
        json metadata
    }
    
    PROPERTY {
        string id PK
        string upload_id FK
        string property_id
        string name
        string type
        string location
        decimal purchase_price
        decimal current_value
        decimal noi
        decimal occupancy_rate
        date purchase_date
        date lease_expiry
        string epc_rating
        decimal maintenance_score
    }
    
    LEASE {
        string id PK
        string property_id FK
        string lease_id
        string tenant_name
        date start_date
        date end_date
        decimal monthly_rent
        decimal security_deposit
        boolean renewal_option
        boolean break_clause
    }
    
    OCCUPANCY {
        string id PK
        string property_id FK
        decimal total_sq_ft
        decimal occupied_sq_ft
        decimal vacant_sq_ft
        decimal common_areas
        integer parking_spaces
        integer occupied_parking
    }
    
    PORTFOLIO_SCORE {
        string id PK
        string analysis_id FK
        decimal health_score
        string risk_level
        string performance_grade
        json weighted_metrics
        json recommendations
    }
    
    LEASE_SCORE {
        string id PK
        string analysis_id FK
        string lease_id FK
        boolean expiry_alert
        decimal renewal_probability
        decimal rent_optimization
        decimal lease_score
        string action_required
    }
    
    OCCUPANCY_SCORE {
        string id PK
        string analysis_id FK
        string property_id FK
        decimal occupancy_rate
        decimal efficiency_score
        decimal vacancy_cost
        decimal market_rate_comparison
        json optimization_recommendations
    }
```

### 4.2 Database Schema Design

```sql
-- Core Tables
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE uploads (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE analyses (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    upload_id VARCHAR(36) NOT NULL,
    strategy ENUM('growth', 'hold', 'divest') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    results JSON,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (upload_id) REFERENCES uploads(id)
);

-- Property Data Tables
CREATE TABLE properties (
    id VARCHAR(36) PRIMARY KEY,
    upload_id VARCHAR(36) NOT NULL,
    property_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    purchase_price DECIMAL(15,2),
    current_value DECIMAL(15,2),
    noi DECIMAL(15,2),
    occupancy_rate DECIMAL(5,2),
    purchase_date DATE,
    lease_expiry_date DATE,
    epc_rating VARCHAR(10),
    maintenance_score DECIMAL(3,1),
    FOREIGN KEY (upload_id) REFERENCES uploads(id)
);

CREATE TABLE leases (
    id VARCHAR(36) PRIMARY KEY,
    property_id VARCHAR(36) NOT NULL,
    lease_id VARCHAR(100) NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(15,2) NOT NULL,
    security_deposit DECIMAL(15,2),
    renewal_option BOOLEAN DEFAULT FALSE,
    break_clause BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE occupancy (
    id VARCHAR(36) PRIMARY KEY,
    property_id VARCHAR(36) NOT NULL,
    total_sq_ft DECIMAL(12,2) NOT NULL,
    occupied_sq_ft DECIMAL(12,2) NOT NULL,
    vacant_sq_ft DECIMAL(12,2) NOT NULL,
    common_areas DECIMAL(12,2),
    parking_spaces INTEGER,
    occupied_parking INTEGER,
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Scoring Tables
CREATE TABLE portfolio_scores (
    id VARCHAR(36) PRIMARY KEY,
    analysis_id VARCHAR(36) NOT NULL,
    health_score DECIMAL(5,2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    performance_grade VARCHAR(5) NOT NULL,
    weighted_metrics JSON NOT NULL,
    recommendations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_id) REFERENCES analyses(id)
);

CREATE TABLE lease_scores (
    id VARCHAR(36) PRIMARY KEY,
    analysis_id VARCHAR(36) NOT NULL,
    lease_id VARCHAR(36) NOT NULL,
    expiry_alert BOOLEAN NOT NULL,
    renewal_probability DECIMAL(5,2),
    rent_optimization DECIMAL(5,2),
    lease_score DECIMAL(5,2) NOT NULL,
    action_required VARCHAR(50),
    FOREIGN KEY (analysis_id) REFERENCES analyses(id),
    FOREIGN KEY (lease_id) REFERENCES leases(id)
);

CREATE TABLE occupancy_scores (
    id VARCHAR(36) PRIMARY KEY,
    analysis_id VARCHAR(36) NOT NULL,
    property_id VARCHAR(36) NOT NULL,
    occupancy_rate DECIMAL(5,2) NOT NULL,
    efficiency_score DECIMAL(5,2) NOT NULL,
    vacancy_cost DECIMAL(15,2),
    market_rate_comparison DECIMAL(5,2),
    optimization_recommendations JSON,
    FOREIGN KEY (analysis_id) REFERENCES analyses(id),
    FOREIGN KEY (property_id) REFERENCES properties(id)
);
```

---

## 5. API Architecture

### 5.1 REST API Endpoints

```mermaid
graph TB
    subgraph "Authentication Endpoints"
        Login[POST /api/auth/login]
        Register[POST /api/auth/register]
        Logout[POST /api/auth/logout]
        Refresh[POST /api/auth/refresh]
    end
    
    subgraph "File Management"
        Upload[POST /api/upload]
        List[GET /api/uploads]
        Delete[DELETE /api/uploads/:id]
    end
    
    subgraph "Analysis Endpoints"
        Analyze[POST /api/analyze]
        Results[GET /api/analyze/:id/results]
        Status[GET /api/analyze/:id/status]
    end
    
    subgraph "Data Endpoints"
        Properties[GET /api/properties]
        Leases[GET /api/leases]
        Occupancy[GET /api/occupancy]
    end
    
    subgraph "Export Endpoints"
        ExportPDF[GET /api/export/pdf/:id]
        ExportExcel[GET /api/export/excel/:id]
        ExportCSV[GET /api/export/csv/:id]
    end
```

### 5.2 API Request/Response Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API Gateway
    participant U as Upload Service
    participant P as Parser Service
    participant S as Scoring Service
    participant D as Database
    participant R as Results Service
    
    C->>A: POST /api/upload (file)
    A->>U: Process file upload
    U->>D: Store file metadata
    U->>A: Return upload ID
    A->>C: 201 Created
    
    C->>A: POST /api/analyze (upload_id, strategy)
    A->>P: Parse uploaded data
    P->>S: Apply scoring logic
    S->>D: Store analysis results
    S->>R: Generate insights
    R->>A: Return analysis ID
    A->>C: 202 Accepted
    
    C->>A: GET /api/analyze/:id/results
    A->>R: Fetch results
    R->>D: Query analysis data
    D->>R: Return results
    R->>A: Return formatted data
    A->>C: 200 OK (JSON)
```

---

## 6. Security Architecture

### 6.1 Security Layers

```mermaid
graph TB
    subgraph "Client Security"
        HTTPS[HTTPS/TLS]
        CSP[Content Security Policy]
        CORS[CORS Configuration]
    end
    
    subgraph "Authentication"
        JWT[JWT Tokens]
        Session[Session Management]
        OAuth[OAuth 2.0]
    end
    
    subgraph "Authorization"
        RBAC[Role-Based Access]
        Permissions[Permission Matrix]
        Middleware[Auth Middleware]
    end
    
    subgraph "Data Security"
        Encryption[Data Encryption]
        Validation[Input Validation]
        Sanitization[Data Sanitization]
    end
    
    subgraph "Infrastructure Security"
        Firewall[Network Firewall]
        WAF[Web Application Firewall]
        Monitoring[Security Monitoring]
    end
```

### 6.2 Security Implementation

```typescript
// Authentication Middleware
export async function authenticateToken(req: NextRequest) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        return decoded;
    } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}

// File Upload Security
export async function validateFileUpload(file: File) {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type');
    }
    
    if (file.size > maxSize) {
        throw new Error('File too large');
    }
    
    return true;
}

// Data Validation
export function validatePropertyData(data: any) {
    const schema = z.object({
        property_id: z.string().min(1),
        name: z.string().min(1),
        type: z.enum(['Office', 'Retail', 'Industrial', 'Residential']),
        location: z.string().min(1),
        purchase_price: z.number().positive(),
        current_value: z.number().positive(),
        noi: z.number(),
        occupancy_rate: z.number().min(0).max(1)
    });
    
    return schema.parse(data);
}
```

---

## 7. Deployment Architecture

### 7.1 Production Deployment

```mermaid
graph TB
    subgraph "CDN Layer"
        Cloudflare[Cloudflare CDN]
        Static[Static Assets]
    end
    
    subgraph "Application Layer"
        Vercel[Vercel Platform]
        NextJS[Next.js App]
        Functions[Serverless Functions]
    end
    
    subgraph "Database Layer"
        Supabase[Supabase PostgreSQL]
        Redis[Redis Cache]
        Storage[File Storage]
    end
    
    subgraph "External Services"
        Python[Python FastAPI Service]
        ML[ML Model Service]
        Monitoring[Monitoring & Logging]
    end
    
    Cloudflare --> Vercel
    Vercel --> NextJS
    NextJS --> Functions
    Functions --> Supabase
    Functions --> Redis
    Functions --> Storage
    Functions --> Python
    Python --> ML
    Vercel --> Monitoring
```

### 7.2 Development Environment

```mermaid
graph TB
    subgraph "Local Development"
        DevServer[Next.js Dev Server]
        HotReload[Hot Reload]
        DevTools[Dev Tools]
    end
    
    subgraph "Database"
        LocalDB[Local PostgreSQL]
        PrismaStudio[Prisma Studio]
        Migrations[DB Migrations]
    end
    
    subgraph "Python Service"
        FastAPI[FastAPI Dev Server]
        Jupyter[Jupyter Notebooks]
        MLDev[ML Development]
    end
    
    DevServer --> LocalDB
    DevServer --> FastAPI
    LocalDB --> PrismaStudio
    FastAPI --> MLDev
    MLDev --> Jupyter
```

---

## 8. Monitoring and Observability

### 8.1 Monitoring Stack

```mermaid
graph TB
    subgraph "Application Monitoring"
        Sentry[Sentry Error Tracking]
        LogRocket[LogRocket Session Replay]
        Analytics[User Analytics]
    end
    
    subgraph "Performance Monitoring"
        Vercel[Vercel Analytics]
        WebVitals[Core Web Vitals]
        APM[Application Performance Monitoring]
    end
    
    subgraph "Infrastructure Monitoring"
        Uptime[Uptime Monitoring]
        Database[Database Monitoring]
        API[API Monitoring]
    end
    
    subgraph "Logging"
        Structured[Structured Logging]
        Centralized[Centralized Logs]
        Alerting[Alert System]
    end
```

### 8.2 Health Checks

```typescript
// Health Check Endpoint
export async function GET() {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            database: await checkDatabase(),
            redis: await checkRedis(),
            python: await checkPythonService(),
            storage: await checkFileStorage()
        }
    };
    
    return NextResponse.json(health);
}

async function checkDatabase() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
        return { status: 'unhealthy', error: error.message };
    }
}
```

---

*This architecture document provides the foundation for implementing the LCM Analytics MVP with clear separation of concerns, scalable design patterns, and modern development practices.*
