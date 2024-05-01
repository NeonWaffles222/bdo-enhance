-- CreateTable
CREATE TABLE "market_items" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "current_stock" INTEGER NOT NULL,
    "total_trades" INTEGER NOT NULL,
    "base_price" INTEGER NOT NULL,
    "main_category" INTEGER NOT NULL,
    "sub_category" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_items_id_key" ON "market_items"("id");
