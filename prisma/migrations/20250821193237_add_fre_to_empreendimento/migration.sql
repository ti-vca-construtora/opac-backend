/*
  Warnings:

  - Added the required column `freId` to the `empreendimentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "empreendimentos" ADD COLUMN     "freId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "FRE" (
    "id" TEXT NOT NULL,
    "custoObra" DECIMAL(15,2) NOT NULL,
    "custosAdicionais" DECIMAL(15,2) NOT NULL,
    "custoTerreno" DECIMAL(15,2) NOT NULL,
    "dataInicioObra" TIMESTAMP(3),
    "dataFimObra" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FRE_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "empreendimentos" ADD CONSTRAINT "empreendimentos_freId_fkey" FOREIGN KEY ("freId") REFERENCES "FRE"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
