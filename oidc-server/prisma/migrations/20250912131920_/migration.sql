/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Tokens` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `Tokens` table. All the data in the column will be lost.
  - You are about to drop the column `payload` on the `Tokens` table. All the data in the column will be lost.
  - Added the required column `data` to the `Tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Tokens` table without a default value. This is not possible if the table is not empty.
  - Made the column `grantId` on table `Tokens` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Tokens_expiresAt_idx";

-- DropIndex
DROP INDEX "Tokens_grantId_idx";

-- DropIndex
DROP INDEX "Tokens_model_idx";

-- AlterTable
ALTER TABLE "Tokens" DROP COLUMN "createdAt",
DROP COLUMN "model",
DROP COLUMN "payload",
ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "tipo" TEXT NOT NULL,
ADD COLUMN     "uid" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "userCode" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "grantId" SET NOT NULL,
ALTER COLUMN "grantId" SET DEFAULT '';
