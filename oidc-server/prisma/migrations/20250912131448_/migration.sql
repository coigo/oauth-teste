/*
  Warnings:

  - You are about to drop the column `data` on the `Tokens` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Tokens` table. All the data in the column will be lost.
  - You are about to drop the column `uid` on the `Tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userCode` on the `Tokens` table. All the data in the column will be lost.
  - Added the required column `model` to the `Tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payload` to the `Tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tokens" DROP COLUMN "data",
DROP COLUMN "tipo",
DROP COLUMN "uid",
DROP COLUMN "userCode",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "payload" JSONB NOT NULL,
ALTER COLUMN "grantId" DROP NOT NULL,
ALTER COLUMN "grantId" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Tokens_model_idx" ON "Tokens"("model");

-- CreateIndex
CREATE INDEX "Tokens_grantId_idx" ON "Tokens"("grantId");

-- CreateIndex
CREATE INDEX "Tokens_expiresAt_idx" ON "Tokens"("expiresAt");
