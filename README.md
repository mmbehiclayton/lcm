# LCM Analytics MVP - Real Estate Intelligence Platform

## 🏢 Project Overview

LCM Analytics is a comprehensive real estate intelligence platform designed to transform structured data (CSV/Excel) into actionable analytical insights for real estate decision-making. The MVP focuses on five core analytical modules: Portfolio Analysis, Lease Analysis, Predictive Modelling, Transactions, and Occupancy.

## 🚀 Technology Stack

- **Frontend & Backend**: Next.js 14+ (React + Node.js)
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Database**: PostgreSQL with Prisma ORM
- **Analytics Engine**: Python FastAPI microservice (optional)
- **Data Parsing**: Papaparse
- **Development**: npm/pnpm

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+ (or MariaDB 10.3+)
- Python 3.9+ (for optional analytics service)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd lcm

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your database credentials

# Set up database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```

### Docker Setup (Alternative)

```bash
# Start all services with Docker Compose
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy
```

## 📁 Project Structure

```
lcm/
├── docs/                    # Technical documentation
├── src/
│   ├── app/                 # Next.js 14 app directory
│   │   ├── api/             # API routes
│   │   ├── upload/          # File upload page
│   │   └── analysis/        # Analysis results page
│   ├── components/          # React components
│   │   ├── charts/          # Chart components
│   │   ├── forms/           # Form components
│   │   └── tables/          # Data table components
│   ├── lib/                 # Utility functions
│   │   ├── analytics.ts     # Analytics engine
│   │   ├── dataProcessor.ts # Data processing
│   │   ├── validations.ts   # Data validation
│   │   └── utils.ts         # Utility functions
│   └── types/               # TypeScript definitions
├── prisma/                  # Database schema
├── python-service/          # FastAPI microservice
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   └── e2e/                 # End-to-end tests
└── docs/                    # Technical documentation
```

## 🎯 Core Features

### ✅ Implemented Features
- **File Upload**: CSV/Excel file upload with validation
- **Data Processing**: Automatic data parsing and cleaning
- **Portfolio Analysis**: Health scoring with weighted metrics
- **Interactive Dashboard**: Charts and visualizations
- **Risk Assessment**: Multi-factor risk analysis
- **Recommendations**: AI-generated actionable insights
- **Export Functionality**: PDF/Excel export capabilities
- **Responsive Design**: Mobile-friendly interface

### 🔄 In Development
- **Lease Analysis**: Advanced lease expiry tracking
- **Occupancy Management**: Space utilization optimization
- **Predictive Modelling**: ML-based forecasting
- **Transaction Analysis**: Deal flow metrics
- **User Authentication**: Secure user management

## 📊 Data Format Requirements

### Required Fields
- Property ID
- Property Name
- Property Type (Office, Retail, Industrial, Residential)
- Location
- Current Value
- NOI (Net Operating Income)
- Occupancy Rate (0-1)

### Optional Fields
- Purchase Price
- Purchase Date
- Lease Expiry Date
- EPC Rating (A-G)
- Maintenance Score (1-10)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run all tests
npm run test:all
```

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy
```

### Environment Variables
```bash
DATABASE_URL="mysql://username:password@localhost:3306/lcm_analytics"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
PYTHON_SERVICE_URL="http://localhost:8000"
```

## 📚 Documentation

- [System Requirements Specification](./docs/srs.md)
- [Architecture Overview](./docs/architecture.md)
- [Implementation Guide](./docs/implementation.md)
- [Testing Plan](./docs/testing.md)
- [Development Timeline](./docs/timeline.md)
- [Deliverables Checklist](./docs/deliverables.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@lcm-analytics.com or create an issue in the repository.

## 🎉 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Recharts team for the beautiful chart library
- TailwindCSS team for the utility-first CSS framework
