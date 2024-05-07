/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `item_sids` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "item_sids_name_key" ON "item_sids"("name");
