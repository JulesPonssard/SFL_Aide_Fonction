import puppeteer from "puppeteer";
import {Ingredient} from "./ingredient.js"
import {Seed} from "./seed.js"
import {Cooking} from "./cooking.js";


const URL = "https://sfl.world/list/1387223998081691/inventory";

/**
 * Clique sur le bouton "Update"
 */
async function clickUpdateButton(page) {
  console.log("➡️ Recherche du bouton Update...");

  await page.waitForFunction(() => {
    return [...document.querySelectorAll("button")]
      .some(b => b.innerText.toLowerCase().includes("update"));
  }, { timeout: 15000 });

  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")]
      .find(b => b.innerText.toLowerCase().includes("update"));
    btn.click();
  });

  console.log("✅ Bouton Update cliqué");
}


/**
 * Récupère toutes les données de la Full farm inventory list
 */
async function getFullInventory(page) {
  console.log("➡️ Attente du tableau d'inventaire...");

  await page.waitForSelector("table.no-w100p.p-5 tbody tr", {
    timeout: 20000
  });

  const inventory = await page.evaluate(() => {
    const rows = document.querySelectorAll(
      "table.no-w100p.p-5 tbody tr"
    );

    const items = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length !== 2) return;

      const name = cells[0].innerText.trim();

      // enlève les espaces insécables (3 586 → 3586)
      const rawAmount = cells[1].innerText
        .replace(/\s/g, "")
        .replace(/\u00A0/g, "");

      const amount = Number(rawAmount);

      if (!name || Number.isNaN(amount)) return;

      items.push({ name, amount });
    });

    return items;
  });

  console.log(`✅ ${inventory.length} items récupérés`);
  return inventory;
}


async function waitWithCountdown(seconds) {
  for (let i = seconds; i > 0; i--) {
    console.log(`⏳ Récupération des données dans ${i}s...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
/**
 * Main
 */
async function main() {
 /*
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"]
  });

  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: "networkidle2" });

  //await clickUpdateButton(page);

  // laisse le temps au refresh
  await waitWithCountdown(10);

  const inventory = await getFullInventory(page);

  console.log("📦 INVENTAIRE COMPLET :");
  console.table(inventory);

  await browser.close();

  crop(inventory);
  seeds(inventory);

        */
        const inventory = [
        { name: "Potato Seed", amount: 396 },
        { name: "Zucchini Seed", amount: 295 },
        { name: "Carrot Seed", amount: 18 }
        ];

        

        // 1️⃣ Construire les seeds avec quantités
        const seedsData = Seed.withOwnedCounts(inventory);

        console.log(seedsData);

        // 2️⃣ Paramètres
        const boost = [10, 20, 0]; // basic, medium, advanced
        const SAISONS_PRINTEMPS_ETE = [0, 0, 1, 0];

        // 3️⃣ Appel de la simulation
        const result = Seed.hoursToCrop(seedsData, boost, SAISONS_PRINTEMPS_ETE);

        // 4️⃣ Affichage
        console.log("⏱ Temps total (heures):", result.totalHours);

        console.log("⏳ Temps restant par seed :");
        for (const [seed, times] of Object.entries(result.perSeed)) {
        console.log(
            seed,
            "→",
            Math.max(...times).toFixed(1),
            "minutes"
        );
      }
      const inventory2 = {
          Banana: 4,
          Barley: 3,
          Beetroot: 147,
          Blueberry: 10,
          Cabbage: 16,
          Sunflower : 10000
        };
        const craftable = Cooking.getCraftableRecipes(inventory2);

          console.log("🍳 Plats craftables :");
          console.table(
            Object.entries(craftable).map(([name, data]) => ({
              plat: name,
              batiment: data.building,
              ingredients: data.ingredients,
              xp: data.xp,
              temps_min: data.time,
              max: data.maxCraftable,
              xp_total: data.xp * data.maxCraftable
            }))
          );
}





function seeds(inventory){
    const seeds = Seed.getAll();

    inventory.forEach(item => {
    if (seeds[item.name] !== undefined) {
        seeds[item.name] = item.amount;
    }
    });

    console.log("🌱 SEEDS UNIQUEMENT");
    console.table(seeds);

}

function crop(inventory){
    const crops = Ingredient.getAll();

    inventory.forEach(item => {
    if (crops[item.name] !== undefined) {
        crops[item.name] = item.amount;
    }
    });

    console.log("🌱 CROPS UNIQUEMENT");
    console.table(crops);

}

main().catch(err => {
  console.error(err);
});
