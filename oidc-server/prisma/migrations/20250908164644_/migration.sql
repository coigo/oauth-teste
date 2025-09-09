/*
  Warnings:

  - You are about to drop the `AccessToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuthorizationCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TokenTipo" AS ENUM ('Session', 'AccessToken', 'RefreshToken', 'AuthorizationCode');

-- DropTable
DROP TABLE "AccessToken";

-- DropTable
DROP TABLE "AuthorizationCode";

-- DropTable
DROP TABLE "RefreshToken";

-- DropTable
DROP TABLE "Session";

-- CreateTable
CREATE TABLE "Tokens" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "tipo" "TokenTipo" NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Tokens_pkey" PRIMARY KEY ("id")
);
