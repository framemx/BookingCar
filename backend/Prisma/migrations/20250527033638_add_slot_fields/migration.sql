/*
  Warnings:

  - You are about to drop the column `capacity` on the `Slot` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Slot` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Slot` table. All the data in the column will be lost.
  - You are about to drop the column `usedSlots` on the `Slot` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `BookingSlot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `BookingSlot` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "BookingSlot_bookingId_slotId_key";

-- AlterTable
ALTER TABLE "BookingSlot" ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Slot" DROP COLUMN "capacity",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "usedSlots",
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Unnamed Slot';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;

-- CreateIndex
CREATE INDEX "BookingSlot_slotId_idx" ON "BookingSlot"("slotId");
