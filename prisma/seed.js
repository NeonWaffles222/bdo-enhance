const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


async function main() {

  // await prisma.marketItem.deleteMany();
  let start = new Date();
  console.log("Fetching Market Items...");

  let items = await getMarketItems();

  console.log("Seeding Market Items...");

  for (let item of items) {
    // category 20 is accessories
    // sid seeding breaks if we try to seed all items at once (fix later)
    // takes 1 hour to seed all items so dont remove if statement
    if (item.mainCategory == 20) {
      // seeds item data for item
      await seedItem(item);
      // seeds sid data for item 
      await seedItemSid(item.id);
    }
  }
  let end = new Date();
  console.log("Seeding Done in: ", (end - start) / 1000, " seconds.");
}

async function getMarketItems() {
  // get all items from the market and return them as an array
  let items = [];
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
  return items;
}

async function seedItem(item) {
  // console.log("Seeding item: ", item.name);
  // create item in the database
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

async function seedItemSid(itemId) {
  // seeds sid data for item
  let itemSid = await getItemSid(itemId);
  if (itemSid) {
    // console.log("seeding item sid for item: ", item.name);
    for (let sid of itemSid) {
      let date = new Date(sid.lastSoldTime * 1000);
      await prisma.itemSid.upsert({
        where: {
          // very scuffed fix for duplicate sids
          name: `+${sid.sid} ` + sid.name
        },
        update: {
          base_price: sid.basePrice,
          current_stock: sid.currentStock,
          total_trades: sid.totalTrades,
          price_min: sid.priceMin,
          price_max: sid.priceMax,
          last_sold_price: sid.lastSoldPrice,
          last_sold_time: date
        },
        create: {
          item_id: sid.id,
          sid: sid.sid,
          // very scuffed fix for duplicate sids
          name: `+${sid.sid} ` + sid.name,
          min_enhance: sid.minEnhance,
          max_enhance: sid.maxEnhance,
          base_price: sid.basePrice,
          current_stock: sid.currentStock,
          total_trades: sid.totalTrades,
          price_min: sid.priceMin,
          price_max: sid.priceMax,
          last_sold_price: sid.lastSoldPrice,
          last_sold_time: date
        }
      });
    }
  }
}

async function getItemSid(itemId) {
  // fetches item SID data for a given item ID

  //console.log("Fetching Item SIDs for item: ", itemId);
  let itemSid = [];

  await fetch(`https://api.arsha.io/v2/na/item?id=${itemId}&lang=en`, { method: 'GET' })
    .then(res => res.text())
    .then(result => JSON.parse(result))
    .then(data => {
      if (Array.isArray(data)) {
        for (let sid of data) {
          itemSid.push(sid);
        }
      } else {
        itemSid.push(data);
      }
    })
    .catch(err => {
      console.error("An error occurred while attempting to fetch item SID data:", err);
      return null;
    });

  return itemSid;

}

main();