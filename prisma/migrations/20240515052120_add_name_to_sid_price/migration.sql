/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `sid_prices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `sid_prices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sid_prices" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sid_prices_name_key" ON "sid_prices"("name");
