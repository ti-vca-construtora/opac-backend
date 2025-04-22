/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `empreendimentos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "empreendimentos_cnpj_key" ON "empreendimentos"("cnpj");
