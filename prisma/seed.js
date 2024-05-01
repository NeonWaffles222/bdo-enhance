const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.marketItem.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "test",
      current_stock: 10,
      total_trades: 5,
      base_price: 100,
      main_category: 1,
      sub_category: 1,
    },
  });
};

main();