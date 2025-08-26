/*
  Warnings:

  - You are about to drop the column `cheque` on the `empreendimentos` table. All the data in the column will be lost.
  - Added the required column `chequeValor` to the `empreendimentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `custoObra` to the `empreendimentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `custoTerreno` to the `empreendimentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `custosAdicionais` to the `empreendimentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idSienge` to the `empreendimentos` table without a default value. This is not possible if the table is not empty.
  - Made the column `chequeData` on table `empreendimentos` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "empreendimentos" DROP COLUMN "cheque",
ADD COLUMN     "chequeValor" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "custoObra" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "custoTerreno" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "custosAdicionais" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "dataFimObra" TIMESTAMP(3),
ADD COLUMN     "dataInicioObra" TIMESTAMP(3),
ADD COLUMN     "idSienge" INTEGER NOT NULL,
ALTER COLUMN "chequeData" SET NOT NULL;
