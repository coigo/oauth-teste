/*
  Warnings:

  - The primary key for the `Grant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `claims` on the `Grant` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `Grant` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `Grant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId,clientId]` on the table `Grant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `Grant` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Grant` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `scopes` to the `Grant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Grant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Grant" DROP CONSTRAINT "Grant_pkey",
DROP COLUMN "claims",
DROP COLUMN "scope",
DROP COLUMN "usuarioId",
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "resources" JSONB,
ADD COLUMN     "scopes" JSONB NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Grant_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Grant_accountId_clientId_key" ON "Grant"("accountId", "clientId");
