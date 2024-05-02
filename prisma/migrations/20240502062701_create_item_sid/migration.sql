-- CreateTable
CREATE TABLE "item_sids" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "sid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "min_enhance" INTEGER NOT NULL,
    "max_enhance" INTEGER NOT NULL,
    "base_price" BIGINT NOT NULL,
    "current_stock" BIGINT NOT NULL,
    "total_trades" BIGINT NOT NULL,
    "price_min" BIGINT NOT NULL,
    "price_max" BIGINT NOT NULL,
    "last_sold_price" BIGINT NOT NULL,
    "last_sold_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_sids_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "item_sids" ADD CONSTRAINT "item_sids_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "market_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
