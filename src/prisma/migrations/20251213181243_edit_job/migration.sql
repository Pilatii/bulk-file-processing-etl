/*
  Warnings:

  - You are about to drop the column `processed` on the `Job` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "JobStatus" ADD VALUE 'RETRYING';

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "processed",
ADD COLUMN     "errorMesage" TEXT,
ADD COLUMN     "invalidRows" JSONB;
