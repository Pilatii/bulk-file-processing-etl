/*
  Warnings:

  - You are about to drop the column `invalidRows` on the `Job` table. All the data in the column will be lost.
  - Changed the type of `entity` on the `Job` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "JobEntity" AS ENUM ('USER', 'PRODUCT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JobStatus" ADD VALUE 'QUEUED';
ALTER TYPE "JobStatus" ADD VALUE 'VALIDATING';

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "invalidRows",
ADD COLUMN     "errorFilePath" TEXT,
DROP COLUMN "entity",
ADD COLUMN     "entity" "JobEntity" NOT NULL;
