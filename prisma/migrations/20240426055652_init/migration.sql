-- Add a DROP TABLE statement if the table already exists
DROP TABLE IF EXISTS "market_item";

-- Create the "market_item" table
CREATE TABLE "market_item" (
    "name" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "totalTrades" INTEGER NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "mainCategory" INTEGER NOT NULL,
    "subCategory" INTEGER NOT NULL,

    CONSTRAINT "market_item_pkey" PRIMARY KEY ("id")
);
