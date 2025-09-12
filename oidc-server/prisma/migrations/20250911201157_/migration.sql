/*
  Warnings:

  - The primary key for the `Grant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Grant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Grant" DROP CONSTRAINT "Grant_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Grant_pkey" PRIMARY KEY ("usuarioId", "clientId");
