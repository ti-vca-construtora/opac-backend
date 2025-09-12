/*
  Warnings:

  - You are about to alter the column `locadora` on the `medicao_mensal` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `usina` on the `medicao_mensal` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.

*/
-- AlterTable
ALTER TABLE "medicao_mensal" ALTER COLUMN "locadora" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "usina" SET DATA TYPE DECIMAL(15,2);
