/*
  Warnings:

  - Added the required column `grantId` to the `Tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `Tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userCode` to the `Tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tokens" ADD COLUMN     "grantId" TEXT NOT NULL,
ADD COLUMN     "uid" TEXT NOT NULL,
ADD COLUMN     "userCode" TEXT NOT NULL;
