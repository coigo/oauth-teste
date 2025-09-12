/*
  Warnings:

  - Added the required column `claims` to the `Grant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scope` to the `Grant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Grant" ADD COLUMN     "claims" TEXT NOT NULL,
ADD COLUMN     "scope" TEXT NOT NULL;
