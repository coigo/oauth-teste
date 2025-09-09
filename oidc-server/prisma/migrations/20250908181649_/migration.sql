/*
  Warnings:

  - You are about to drop the column `grantId` on the `Tokens` table. All the data in the column will be lost.
  - You are about to drop the column `uid` on the `Tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userCode` on the `Tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tokens" DROP COLUMN "grantId",
DROP COLUMN "uid",
DROP COLUMN "userCode";
