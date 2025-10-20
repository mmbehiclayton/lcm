-- =====================================================
-- LCM Analytics - Database Reset Script
-- =====================================================
-- This script clears all data from the LCM Analytics database
-- Use this before uploading the comprehensive sample data
-- =====================================================

-- Disable foreign key checks temporarily (MySQL/MariaDB)
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- STEP 1: Clear Analysis Results
-- =====================================================
-- Remove all computed analysis results
TRUNCATE TABLE analyses;
SELECT 'Cleared analyses table' AS Status;

-- =====================================================
-- STEP 2: Clear Transactional Data
-- =====================================================
-- Remove all transaction records
TRUNCATE TABLE transactions;
SELECT 'Cleared transactions table' AS Status;

-- =====================================================
-- STEP 3: Clear Occupancy Data
-- =====================================================
-- Remove all occupancy sensor data and records
TRUNCATE TABLE occupancy_data;
SELECT 'Cleared occupancy_data table' AS Status;

-- =====================================================
-- STEP 4: Clear Predictive Data
-- =====================================================
-- Remove all predictive modelling records
TRUNCATE TABLE predictive_data;
SELECT 'Cleared predictive_data table' AS Status;

-- =====================================================
-- STEP 5: Clear Lease Contracts
-- =====================================================
-- Remove all lease agreement records
TRUNCATE TABLE leases;
SELECT 'Cleared leases table' AS Status;

-- =====================================================
-- STEP 6: Clear Property Portfolio
-- =====================================================
-- Remove all property records
TRUNCATE TABLE properties;
SELECT 'Cleared properties table' AS Status;

-- =====================================================
-- STEP 7: Clear Upload Records
-- =====================================================
-- Remove all upload metadata
TRUNCATE TABLE uploads;
SELECT 'Cleared uploads table' AS Status;

-- =====================================================
-- STEP 8: Reset Auto-Increment Counters (Optional)
-- =====================================================
-- Uncomment these lines if you want to reset IDs to start from 1

-- ALTER TABLE analyses AUTO_INCREMENT = 1;
-- ALTER TABLE transactions AUTO_INCREMENT = 1;
-- ALTER TABLE occupancy_data AUTO_INCREMENT = 1;
-- ALTER TABLE predictive_data AUTO_INCREMENT = 1;
-- ALTER TABLE leases AUTO_INCREMENT = 1;
-- ALTER TABLE properties AUTO_INCREMENT = 1;
-- ALTER TABLE uploads AUTO_INCREMENT = 1;

-- SELECT 'Reset all auto-increment counters' AS Status;

-- =====================================================
-- STEP 9: Re-enable Foreign Key Checks
-- =====================================================
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Verification Queries
-- =====================================================
-- Check that all tables are empty
SELECT 'analyses' AS table_name, COUNT(*) AS record_count FROM analyses
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'occupancy_data', COUNT(*) FROM occupancy_data
UNION ALL
SELECT 'predictive_data', COUNT(*) FROM predictive_data
UNION ALL
SELECT 'leases', COUNT(*) FROM leases
UNION ALL
SELECT 'properties', COUNT(*) FROM properties
UNION ALL
SELECT 'uploads', COUNT(*) FROM uploads;

-- =====================================================
-- DONE!
-- =====================================================
SELECT '✅ Database reset complete! Ready for sample data upload.' AS Status;
SELECT 'Upload files in this order:' AS Instructions;
SELECT '1. portfolio_properties.csv → Portfolio Module' AS step_1;
SELECT '2. lease_contracts.csv → Lease Analysis Module' AS step_2;
SELECT '3. property_transactions.csv → Transactions Module' AS step_3;
SELECT '4. occupancy_data.csv → Occupancy Module' AS step_4;
SELECT '5. predictive_inputs.csv → Predictive Modelling Module' AS step_5;

