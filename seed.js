// Seed data format:
// "X Seed": [ownedCount, growMinutes, [autumn, winter, spring, summer], category]

export class Seed {
  static createEmpty() {
    return {
      // ---------- BASIC CROPS ----------
      "Sunflower Seed": [0, 1,   [0, 0, 1, 1], "basic"],
      "Potato Seed":    [0, 5,   [1, 1, 0, 1], "basic"],
      "Rhubarb Seed":   [0, 10,  [0, 0, 1, 0], "basic"],
      "Pumpkin Seed":   [0, 30,  [1, 0, 0, 0], "basic"],
      "Zucchini Seed":  [0, 30,  [0, 0, 0, 1], "basic"],

      // ---------- MEDIUM CROPS ----------
      "Carrot Seed":    [0, 60,  [1, 0, 1, 0], "medium"],
      "Yam Seed":       [0, 60,  [1, 0, 0, 0], "medium"],
      "Cabbage Seed":   [0, 120, [0, 1, 1, 0], "medium"],
      "Broccoli Seed":  [0, 120, [1, 0, 0, 0], "medium"],
      "Soybean Seed":   [0, 180, [1, 0, 1, 0], "medium"],
      "Beetroot Seed":  [0, 240, [0, 1, 0, 1], "medium"],
      "Pepper Seed":    [0, 240, [0, 0, 0, 1], "medium"],
      "Cauliflower Seed":[0,480, [0, 1, 0, 1], "medium"],
      "Parsnip Seed":   [0, 720, [0, 1, 0, 0], "medium"],

      // ---------- ADVANCED CROPS ----------
      "Eggplant Seed":  [0, 960,  [0, 0, 0, 1], "advanced"],
      "Corn Seed":      [0, 1200, [0, 0, 1, 0], "advanced"],
      "Onion Seed":     [0, 1200, [0, 1, 0, 0], "advanced"],
      "Radish Seed":    [0, 1440, [0, 0, 0, 1], "advanced"],
      "Wheat Seed":     [0, 1440, [1, 1, 1, 1], "advanced"],
      "Turnip Seed":    [0, 1440, [0, 1, 0, 0], "advanced"],
      "Kale Seed":      [0, 2160, [0, 1, 1, 0], "advanced"],
      "Artichoke Seed": [0, 2160, [1, 0, 0, 0], "advanced"],
      "Barley Seed":    [0, 2880, [1, 0, 1, 0], "advanced"],

      // ---------- FRUIT PATCH ----------
      "Tomato Seed":    [0, 120, [1, 0, 1, 0], "fruit"],
      "Lemon Seed":     [0, 240, [0, 1, 0, 1], "fruit"],
      "Blueberry Seed": [0, 360, [0, 1, 1, 0], "fruit"],
      "Orange Seed":    [0, 480, [0, 0, 1, 1], "fruit"],
      "Banana Seed":    [0, 720, [1, 0, 0, 1], "fruit"],
      "Apple Seed":     [0, 720, [1, 1, 0, 0], "fruit"],
    };

  }



  /**
   * 

   * Injecte les quantités depuis ton inventaire scrapé
   * inventoryItems = [{ name: "Potato Seed", amount: 396 }, ...]
   */
  static withOwnedCounts(inventoryItems) {
    const seeds = Seed.createEmpty();

    for (const item of inventoryItems) {
      if (!item?.name) continue;
      if (seeds[item.name]) {
        seeds[item.name][0] = Number(item.amount ?? 0);
      }
    }

    return seeds;
  }

  static hoursToCrop(seeds, boost, saison) {
        const nbCrop = 30;

        const boostMap = {
            basic: boost[0] ?? 0,
            medium: boost[1] ?? 0,
            advanced: boost[2] ?? 0
        };

        const tasks = [];

        // 1️⃣ construire les tâches valides
        for (const [name, [owned, minutes, seedSeasons, category]] of Object.entries(seeds)) {
            if (!owned) continue;

            // 👉 vérifie si la seed pousse dans AU MOINS une saison active
            const growsThisSeason = seedSeasons.some(
            (v, i) => v === 1 && saison[i] === 1
            );
            if (!growsThisSeason) continue;

            const reduction = boostMap[category] ?? 0;
            const effectiveMinutes = minutes * (1 - reduction / 100);

            for (let i = 0; i < owned; i++) {
            tasks.push({
                seed: name,
                duration: effectiveMinutes
            });
            }
        }

        if (tasks.length === 0) {
            return {
            totalMinutes: 0,
            totalHours: 0,
            perSeed: {}
            };
        }

        // 2️⃣ initialisation des champs
        const fields = Array(nbCrop).fill(0);
        const perSeed = {};

        // 3️⃣ scheduling
        for (const task of tasks) {
            let fieldIndex = 0;
            for (let i = 1; i < fields.length; i++) {
            if (fields[i] < fields[fieldIndex]) {
                fieldIndex = i;
            }
            }

            const start = fields[fieldIndex];
            const end = start + task.duration;
            fields[fieldIndex] = end;

            if (!perSeed[task.seed]) {
            perSeed[task.seed] = [];
            }
            perSeed[task.seed].push(end);
        }

        const totalMinutes = Math.max(...fields);

        return {
            totalMinutes,
            totalHours: +(totalMinutes / 60).toFixed(2),
            perSeed
        };
}
  
}
