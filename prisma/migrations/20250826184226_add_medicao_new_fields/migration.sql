-- AlterTable
ALTER TABLE "medicao_mensal" ADD COLUMN     "aGastar" DECIMAL(15,2),
ADD COLUMN     "aGastarAtualizado" DECIMAL(15,2),
ADD COLUMN     "aditivo" DECIMAL(15,2),
ADD COLUMN     "evolucaoMes" DOUBLE PRECISION,
ADD COLUMN     "evolucaoTotal" DOUBLE PRECISION,
ADD COLUMN     "gasto" DECIMAL(15,2),
ADD COLUMN     "incc" DOUBLE PRECISION,
ADD COLUMN     "orcamentoCorrigido" DECIMAL(15,2),
ADD COLUMN     "totalGasto" DECIMAL(15,2);
