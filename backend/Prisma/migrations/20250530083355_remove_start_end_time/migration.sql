/*
  Warnings:

  - You are about to drop the column `endTime` on the `BookingSlot` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `BookingSlot` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Slot` table. All the data in the column will be lost.
  - Added the required column `date` to the `Slot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Slot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Slot` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- DropIndex
DROP INDEX "BookingSlot_slotId_idx";

-- AlterTable
ALTER TABLE "BookingSlot" DROP COLUMN "endTime",
DROP COLUMN "startTime";

-- AlterTable
ALTER TABLE "Slot" DROP COLUMN "name",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "slotName" TEXT NOT NULL DEFAULT 'Unnamed Slot',
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'AVAILABLE';
