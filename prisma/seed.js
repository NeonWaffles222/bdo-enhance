const { PrismaClient } = require('@prisma/client');
const Bottleneck = require('bottleneck');

const prisma = new PrismaClient();

// limiter to prevent rate limiting
const limiter = new Bottleneck({
  maxConcurrent: 50,
  minTime: 50
});

async function main() {

  // await prisma.marketItem.deleteMany();
  let start = new Date();
  console.log("Fetching Market Items...");

  let items = await getMarketItems();

  console.log("Seeding Market Items...");
  await seedItems(items);
  let end = new Date();
  console.log("Seeding done in: ", (end - start) / 1000, " seconds.");

  console.log("Seeding Market Item SIDs...");
  let itemIds = [];
  for (let item of items) {
    if (item.mainCategory === 20) {
      itemIds.push(item.id);
    }
  }
  await seedItemSids(itemIds);

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

// async function seedItemSids(itemIds) {
//   // seeds sid data for item
//   let itemSids = await getItemSids(itemIds);
//   let promises = [];

//   for (let itemSid of itemSids) {
//     promises.push(seedItemSid(itemSid));
//   }

//   await Promise.all(promises);
// }

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

async function seedItemSids(itemIds) {
  // fetches item SID data for a given item ID

  let promises = [];

  for (let itemId of itemIds) {
    limiter.schedule(fetchItemSid, itemId)
      .then(value => {
        for (let sid of value) {
          promises.push(seedItemSid(sid));
        }
      })
      .then(() => {
        Promise.all(promises);
        // console.log(`Seeded ${promises.length} SIDs.`);
        promises = [];
      })
      .catch(err => {
        console.error("An error occurred while attempting to fetch item SID data for item: ", itemId, err);
        setTimeout(() => {
          retrySeedItemSid(itemId, 1);
        }, 1000);
      });
  }

  console.log("All SID promises scheduled.");

  return;
}

async function retrySeedItemSid(itemId, count) {
  // attempts to fetches item SID data for a given item ID if it fails
  let promises = [];


  if (count < 3) {
    console.log(`Retrying SID seeding for item: ${itemId}. Attempt: ${count}`);
    limiter.schedule(fetchItemSid, itemId)
      .then(value => {
        for (let sid of value) {
          promises.push(seedItemSid(sid));
        }
      })
      .then(() => {
        Promise.all(promises);
        // console.log(`Seeded ${promises.length} SIDs.`);
        promises = [];
      })
      .catch(err => {
        console.error("An error occurred while attempting to fetch item SID data for item: ", itemId, err);
        count++;
        setTimeout(() => {
          retrySeedItemSid(itemId, count);
        }, 1000);
      });
  }

  return;
}

async function fetchItemSid(itemId) {
  // fetches item SID data for a given item ID

  let itemSid = [];

  return new Promise((resolve, reject) => {
    fetch(`https://api.arsha.io/v2/na/item?id=${itemId}&lang=en`, { method: 'GET' })
      .then(res => res.text())
      .then(result => JSON.parse(result))
      .then(data => {
        // console.log("Fetched SID data for item: ", itemId);
        if (Array.isArray(data)) {
          for (let sid of data) {
            itemSid.push(sid);
          }
        } else {
          itemSid.push(data);
        }
        resolve(itemSid);
      })
      .catch(err => {
        console.error(`An error occurred while attempting to fetch item SID data for item: ${itemId}:`, err);
        reject(null);
      });
  });

  // await fetch(`https://api.arsha.io/v2/na/item?id=${itemId}&lang=en`, { method: 'GET' })
  //   .then(res => res.text())
  //   .then(result => JSON.parse(result))
  //   .then(data => {
  //     console.log("Fetched SID data for item: ", itemId);
  //     if (Array.isArray(data)) {
  //       for (let sid of data) {
  //         itemSid.push(sid);
  //       }
  //     } else {
  //       itemSid.push(data);
  //     }
  //   })
  //   .catch(err => {
  //     console.error(`An error occurred while attempting to fetch item SID data for item: ${itemId}:`, err);
  //     return null;
  //   });


  // return itemSid;
}

main();