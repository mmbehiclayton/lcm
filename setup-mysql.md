# MySQL Setup Guide for LCM Analytics

## Option 1: Using Docker (Recommended)

This is the easiest way to get started without installing MySQL locally.

```bash
# Start MySQL with Docker
docker run --name lcm-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=lcm_analytics -p 3306:3306 -d mysql:8.0

# Or use the full Docker Compose setup
docker-compose up -d db
```

## Option 2: Local MySQL Installation

### Windows
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Install MySQL Server 8.0
3. Set root password during installation
4. Create database: `CREATE DATABASE lcm_analytics;`

### macOS
```bash
# Using Homebrew
brew install mysql
brew services start mysql

# Create database
mysql -u root -p
CREATE DATABASE lcm_analytics;
```

### Linux (Ubuntu/Debian)
```bash
# Install MySQL
sudo apt update
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation

# Create database
mysql -u root -p
CREATE DATABASE lcm_analytics;
```

## Environment Configuration

Create your `.env.local` file:

```bash
# Copy the example file
cp env.example .env.local

# Edit with your MySQL credentials
DATABASE_URL="mysql://root:password@localhost:3306/lcm_analytics"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

## Troubleshooting

### Connection Issues
- Make sure MySQL is running: `sudo systemctl status mysql` (Linux) or check Services (Windows)
- Verify port 3306 is not blocked by firewall
- Check MySQL user permissions

### Common MySQL Commands
```sql
-- Connect to MySQL
mysql -u root -p

-- Show databases
SHOW DATABASES;

-- Use the database
USE lcm_analytics;

-- Show tables
SHOW TABLES;

-- Check table structure
DESCRIBE users;
```

### Reset Database (if needed)
```bash
# Reset Prisma migrations
npx prisma migrate reset

# Or drop and recreate database
mysql -u root -p
DROP DATABASE lcm_analytics;
CREATE DATABASE lcm_analytics;
```

## Alternative: Use Docker Compose (Easiest)

If you don't want to install MySQL locally, just use Docker Compose:

```bash
# Start all services
docker-compose up -d

# The database will be automatically created and configured
# Your app will be available at http://localhost:3000
```
