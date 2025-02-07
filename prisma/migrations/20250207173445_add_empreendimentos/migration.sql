-- CreateTable
CREATE TABLE "empreendimentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "tipo" TEXT,
    "cidade" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "entregaData" TIMESTAMP(3),
    "cheque" TEXT,
    "chequeData" TEXT,

    CONSTRAINT "empreendimentos_pkey" PRIMARY KEY ("id")
);
