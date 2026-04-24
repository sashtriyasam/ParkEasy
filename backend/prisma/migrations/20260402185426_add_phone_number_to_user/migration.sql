/*
  Warnings:

  - You are about to drop the column `account_info` on the `withdrawals` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `withdrawals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idempotency_key]` on the table `withdrawals` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone_number" TEXT;

-- Step 1: Add new columns first (without dropping old ones yet)
ALTER TABLE "withdrawals" 
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "destination_account" TEXT,
ADD COLUMN     "idempotency_key" TEXT,
ADD COLUMN     "payout_details" TEXT,
ADD COLUMN     "payout_method" TEXT NOT NULL DEFAULT 'UPI',
ADD COLUMN     "remarks" TEXT;

-- Step 2: Data Migration - Copy existing data to new schema
-- Mapping account_info -> destination_account and method -> payout_method
-- Also backfill idempotency_key for legacy rows to allow safe NOT NULL constraint
UPDATE "withdrawals"
SET 
    "destination_account" = "account_info",
    "payout_method" = COALESCE("method", 'UPI'),
    "idempotency_key" = 'LEGACY_' || "id"
WHERE "idempotency_key" IS NULL;

-- Step 3: Now safely drop old columns and apply constraints
ALTER TABLE "withdrawals" 
DROP COLUMN "account_info",
DROP COLUMN "method",
ALTER COLUMN "idempotency_key" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number") WHERE "phone_number" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "withdrawals_idempotency_key_key" ON "withdrawals"("idempotency_key");
