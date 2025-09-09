/*
  Warnings:

  - Made the column `grantId` on table `Tokens` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uid` on table `Tokens` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userCode` on table `Tokens` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Tokens" ALTER COLUMN "grantId" SET NOT NULL,
ALTER COLUMN "uid" SET NOT NULL,
ALTER COLUMN "userCode" SET NOT NULL;
