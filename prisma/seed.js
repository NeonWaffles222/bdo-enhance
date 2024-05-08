const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


async function main() {

  // await prisma.marketItem.deleteMany();
  let start = new Date();
  console.log("Fetching Market Items...");

  let items = await getMarketItems();

  console.log("Seeding Market Items...");
  await seedItems(items);
  let end = new Date();
  console.log("Seededing done in: ", (end - start) / 1000, " seconds.");

  // start = new Date();
  // console.log("Seeding Market Item SIDs...");
  // let itemIds = [];
  // for (let item of items) {
  //   itemIds.push(item.id);
  // }
  // await seedItemSids(itemIds);
  // end = new Date();
  // console.log("Seededing done in: ", (end - start) / 1000, " seconds.");



  // let itemCount = 0;

  // for (let item of items) {
  //   // category 20 is accessories
  //   // sid seeding breaks if we try to seed all items at once (fix later)
  //   // takes 1 hour to seed all items so dont remove if statement
  //   if (item.mainCategory == 20) {
  //     // seeds item data for item
  //     await seedItem(item);
  //     // seeds sid data for item 
  //     await seedItemSid(item.id);

  //     itemCount++;
  //   }
  // }
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

async function seedItems(items) {
  // seeds item data for all items in the array
  let promises = [];

  for (let item of items) {
    promises.push(seedItem(item));
  }

  await Promise.all(promises);

}

async function seedItem(item) {
  // console.log("Seeding item: ", item.name);
  // create item in the database
  await prisma.marketItem.upsert({
    where: { id: item.id },
    update: {
      current_stock: item.currentStock,
      total_trades: item.totalTrades,
      base_price: item.basePrice,
      main_category: item.mainCategory,
      sub_category: item.subCategory,
    },
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

async function seedItemSids(itemIds) {
  // seeds sid data for item
  let itemSids = await getItemSids(itemIds);
  let promises = [];

  for (let itemSid of itemSids) {
    promises.push(seedItemSid(itemSid));
  }

  await Promise.all(promises);
}

async function seedItemSid(sid) {
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

async function getItemSids(itemIds) {
  // fetches item SID data for a given item ID

  let allPromises = [];
  let itemSids = [];
  let promises = [];

  for (let itemId of itemIds) {
    if (itemId == 20) {
      promises.push(fetchItemSid(itemId));
      if (promises.length >= 10) {
        allPromises.push(promises);
        promises = [];
      }
    }
  }
  for (let promises of allPromises) {
    await Promise.all(promises).then(values => {
      for (let value of values) {
        for (let sid of value) {
          itemSids.push(sid);
        }
      }
    });
  }

  return itemSids;

}

async function fetchItemSid(itemId) {
  // fetches item SID data for a given item ID

  let itemSid = [];

  await fetch(`https://api.arsha.io/v2/na/item?id=${itemId}&lang=en`, { method: 'GET' })
    .then(res => res.text())
    .then(result => JSON.parse(result))
    .then(data => {
      console.log("Fetched SID data for item: ", itemId);
      if (Array.isArray(data)) {
        for (let sid of data) {
          itemSid.push(sid);
        }
      } else {
        itemSid.push(data);
      }
    })
    .catch(err => {
      console.error(`An error occurred while attempting to fetch item SID data for item: ${itemId}:`, err);
      return null;
    });

  return itemSid;
}

main();