import { databaseService } from '../services/DatabaseService';
import { InventoryItem } from '../types/inventory';

const categories = ['Clothes','Electronics','Kitchen','Books','Tools','Games','Outdoor','Sports','Home Decor','Collectibles','Art','Photography','Accessories'];
const locations = ['Living Room','Bedroom Closet','Garage','Attic','Basement','Office','Kitchen','Storage Unit'];
const names = ['Item','Gadget','Thing','Widget','Product','Gear','Equipment','Accessory'];

function randomFrom<T>(arr: T[]) { return arr[Math.floor(Math.random()*arr.length)]; }

function randomDate(pastYears = 5) {
  const now = new Date();
  const past = new Date();
  past.setFullYear(now.getFullYear() - pastYears);
  const ts = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(ts).toISOString().split('T')[0];
}

function randomPrice(max = 300) {
  return Math.round((Math.random() * max + 1) * 100) / 100;
}

function simpleId() {
  // lightweight unique id for dev population (timestamp + random)
  return `${Date.now().toString(36)}-${Math.floor(Math.random()*1e6).toString(36)}`;
}

export async function populateRandomItems(count = 50) {
  await databaseService.init();
  const items: InventoryItem[] = [];
  for (let i = 0; i < count; i++) {
    const item: InventoryItem = {
      id: simpleId(),
      name: `${randomFrom(names)} ${Math.floor(Math.random()*9000)+1000}`,
      category: randomFrom(categories),
      location: randomFrom(locations),
      lastUsed: randomDate(6),
      imageUrl: undefined,
      pricePaid: randomPrice(250),
      priceExpected: randomPrice(400)
    };
    items.push(item);
  }

  for (const it of items) {
    try {
      await databaseService.saveInventoryItem(it);
    } catch (err) {
      console.error('Failed to save item', it, err);
    }
  }
  console.log(`Inserted ${items.length} random items`);
}
