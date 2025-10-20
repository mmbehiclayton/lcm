-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uploads` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analyses` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `uploadId` VARCHAR(191) NOT NULL,
    `strategy` VARCHAR(191) NOT NULL,
    `results` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `properties` (
    `id` VARCHAR(191) NOT NULL,
    `uploadId` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `purchasePrice` DOUBLE NULL,
    `currentValue` DOUBLE NULL,
    `noi` DOUBLE NULL,
    `occupancyRate` DOUBLE NULL,
    `purchaseDate` DATETIME(3) NULL,
    `leaseExpiryDate` DATETIME(3) NULL,
    `epcRating` VARCHAR(191) NULL,
    `maintenanceScore` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leases` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `tenantName` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `monthlyRent` DOUBLE NOT NULL,
    `securityDeposit` DOUBLE NULL,
    `renewalOption` BOOLEAN NOT NULL DEFAULT false,
    `breakClause` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `occupancy` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `totalSqFt` DOUBLE NOT NULL,
    `occupiedSqFt` DOUBLE NOT NULL,
    `vacantSqFt` DOUBLE NOT NULL,
    `commonAreas` DOUBLE NULL,
    `parkingSpaces` INTEGER NULL,
    `occupiedParking` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portfolio_scores` (
    `id` VARCHAR(191) NOT NULL,
    `analysisId` VARCHAR(191) NOT NULL,
    `healthScore` DOUBLE NOT NULL,
    `riskLevel` VARCHAR(191) NOT NULL,
    `performanceGrade` VARCHAR(191) NOT NULL,
    `weightedMetrics` JSON NOT NULL,
    `recommendations` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lease_scores` (
    `id` VARCHAR(191) NOT NULL,
    `analysisId` VARCHAR(191) NOT NULL,
    `leaseId` VARCHAR(191) NOT NULL,
    `expiryAlert` BOOLEAN NOT NULL,
    `renewalProbability` DOUBLE NULL,
    `rentOptimization` DOUBLE NULL,
    `leaseScore` DOUBLE NOT NULL,
    `actionRequired` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `occupancy_scores` (
    `id` VARCHAR(191) NOT NULL,
    `analysisId` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `occupancyRate` DOUBLE NOT NULL,
    `efficiencyScore` DOUBLE NOT NULL,
    `vacancyCost` DOUBLE NULL,
    `marketRateComparison` DOUBLE NULL,
    `optimizationRecommendations` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analyses` ADD CONSTRAINT `analyses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analyses` ADD CONSTRAINT `analyses_uploadId_fkey` FOREIGN KEY (`uploadId`) REFERENCES `uploads`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `properties` ADD CONSTRAINT `properties_uploadId_fkey` FOREIGN KEY (`uploadId`) REFERENCES `uploads`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
