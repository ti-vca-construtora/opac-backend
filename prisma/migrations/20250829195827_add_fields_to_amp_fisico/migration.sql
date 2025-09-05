/*
  Warnings:

  - You are about to drop the column `ampFisico` on the `medicao_mensal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "medicao_mensal" DROP COLUMN "ampFisico",
ADD COLUMN     "ampFisicoMes" DOUBLE PRECISION,
ADD COLUMN     "ampFisicoTotal" DOUBLE PRECISION;
