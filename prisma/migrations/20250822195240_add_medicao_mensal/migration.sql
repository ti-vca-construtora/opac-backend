-- CreateTable
CREATE TABLE "medicao_mensal" (
    "id" TEXT NOT NULL,
    "idSienge" INTEGER NOT NULL,
    "totalDistorcoes" DECIMAL(15,2) NOT NULL,
    "totalCustoPorNivel" DECIMAL(15,2) NOT NULL,
    "totalEstoque" DECIMAL(15,2) NOT NULL,
    "totalMedicoes" DECIMAL(15,2) NOT NULL,
    "custoIncorrido" DECIMAL(15,2) NOT NULL,
    "empreendimentoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicao_mensal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "medicao_mensal" ADD CONSTRAINT "medicao_mensal_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "empreendimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
