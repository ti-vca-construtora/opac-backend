-- CreateTable
CREATE TABLE "Aditivo" (
    "id" TEXT NOT NULL,
    "aditivo" DECIMAL(15,2) NOT NULL,
    "obs" TEXT,
    "anexoLink" TEXT,
    "empreendimentoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aditivo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Aditivo" ADD CONSTRAINT "Aditivo_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "empreendimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
