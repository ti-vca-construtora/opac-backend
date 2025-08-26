/*
  Warnings:

  - A unique constraint covering the columns `[idSienge]` on the table `empreendimentos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "empreendimentos_idSienge_key" ON "empreendimentos"("idSienge");
