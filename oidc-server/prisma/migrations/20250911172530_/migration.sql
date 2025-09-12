-- CreateTable
CREATE TABLE "Grant" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "Grant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grant_clientId_key" ON "Grant"("clientId");
