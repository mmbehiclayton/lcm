-- Migration: Add missing fields to Transaction, Lease, and OccupancyData models
-- Date: 2025-10-20
-- Description: Adds tenant_id, lease_id, and other reconciliation fields

-- Add fields to transactions table
ALTER TABLE `transactions` 
  ADD COLUMN `tenantId` VARCHAR(191) NULL AFTER `propertyId`,
  ADD COLUMN `leaseId` VARCHAR(191) NULL AFTER `tenantId`,
  ADD COLUMN `expectedAmount` DOUBLE NULL AFTER `amount`,
  ADD COLUMN `dueDate` DATETIME(3) NULL AFTER `transactionDate`,
  ADD COLUMN `paymentMethod` VARCHAR(191) NULL AFTER `status`,
  ADD COLUMN `reference` VARCHAR(191) NULL AFTER `paymentMethod`;

-- Add fields to leases table
ALTER TABLE `leases`
  ADD COLUMN `tenantId` VARCHAR(191) NULL AFTER `leaseId`,
  ADD COLUMN `escalationRate` DOUBLE NULL AFTER `monthlyRent`,
  ADD COLUMN `tenantCreditRating` VARCHAR(191) NULL AFTER `breakClause`,
  ADD COLUMN `leaseStatus` VARCHAR(191) NULL AFTER `tenantCreditRating`;

-- Add sensor and compliance fields to occupancy_data table
ALTER TABLE `occupancy_data`
  ADD COLUMN `deskUsage` DOUBLE NULL AFTER `riskLevel`,
  ADD COLUMN `badgeIns` DOUBLE NULL AFTER `deskUsage`,
  ADD COLUMN `meetingRoomUsage` DOUBLE NULL AFTER `badgeIns`,
  ADD COLUMN `lightingUsage` DOUBLE NULL AFTER `meetingRoomUsage`,
  ADD COLUMN `temperatureAvg` DOUBLE NULL AFTER `lightingUsage`,
  ADD COLUMN `avgOccupancy3Months` DOUBLE NULL AFTER `temperatureAvg`,
  ADD COLUMN `avgOccupancy6Months` DOUBLE NULL AFTER `avgOccupancy3Months`,
  ADD COLUMN `avgOccupancy12Months` DOUBLE NULL AFTER `avgOccupancy6Months`,
  ADD COLUMN `peakUsage` DOUBLE NULL AFTER `avgOccupancy12Months`,
  ADD COLUMN `permittedUsage` VARCHAR(191) NULL AFTER `peakUsage`,
  ADD COLUMN `sublettingAllowed` BOOLEAN NULL AFTER `permittedUsage`,
  ADD COLUMN `coworkingRestrictions` BOOLEAN NULL AFTER `sublettingAllowed`,
  ADD COLUMN `maxOccupancy` INT NULL AFTER `coworkingRestrictions`,
  ADD COLUMN `businessType` VARCHAR(191) NULL AFTER `maxOccupancy`,
  ADD COLUMN `headcountEstimate` INT NULL AFTER `businessType`,
  ADD COLUMN `actualHeadcount` INT NULL AFTER `headcountEstimate`;

