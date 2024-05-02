const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


async function main() {

  // await prisma.marketItem.deleteMany();

  let items = [];

  console.log("Fetching Market Items...");

  await fetch('https://api.arsha.io/v2/na/market', { method: 'GET' })
    .then(res => res.text())
    .then(result => JSON.parse(result))
    .then(data => {
      for (let item of data) {
        items.push(item);
      }
    })
    .catch(err => {
      console.error("An error occurred while attempting to fetch item data:", err);
    });

  console.log("Seeding Market Items...");

  for (let item of items) {
    // console.log("Seeding item: ", item.name);
    await prisma.marketItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        name: item.name,
        current_stock: item.currentStock,
        total_trades: item.totalTrades,
        base_price: item.basePrice,
        main_category: item.mainCategory,
        sub_category: item.subCategory,
      },
    });

  }

};

main();