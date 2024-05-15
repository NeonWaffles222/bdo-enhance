-- CreateTable
CREATE TABLE "sid_prices" (
    "id" SERIAL NOT NULL,
    "sid_id" INTEGER NOT NULL,
    "price" BIGINT NOT NULL,
    "buy_orders" INTEGER NOT NULL,
    "sell_orders" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sid_prices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sid_prices" ADD CONSTRAINT "sid_prices_sid_id_fkey" FOREIGN KEY ("sid_id") REFERENCES "item_sids"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
