-- CreateTable
CREATE TABLE "anos" (
    "id" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,

    CONSTRAINT "anos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meses" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "anoId" TEXT NOT NULL,

    CONSTRAINT "meses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semanas" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "mesId" TEXT NOT NULL,

    CONSTRAINT "semanas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dias" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "semanaId" TEXT NOT NULL,

    CONSTRAINT "dias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "anos_ano_key" ON "anos"("ano");

-- AddForeignKey
ALTER TABLE "meses" ADD CONSTRAINT "meses_anoId_fkey" FOREIGN KEY ("anoId") REFERENCES "anos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semanas" ADD CONSTRAINT "semanas_mesId_fkey" FOREIGN KEY ("mesId") REFERENCES "meses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dias" ADD CONSTRAINT "dias_semanaId_fkey" FOREIGN KEY ("semanaId") REFERENCES "semanas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
