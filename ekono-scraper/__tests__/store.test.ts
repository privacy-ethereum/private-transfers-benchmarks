import { describe, expect, it } from "vitest";
import { openDb } from "../src/store/db.js";
import { normalize } from "../src/normalize.js";
import { getPriceHistory, getProduct, listPriceDrops, saveProduct } from "../src/store/repository.js";
import type { RawProduct } from "../src/types.js";

const raw = (price: number): RawProduct => ({
  id: "5010348",
  url: "https://www.tiendasekono.com/snacks-5010348.html",
  name: "Snacks para perros",
  brand: "Mascotas Ekono",
  category: "Mascotas",
  offers: [{ price, currency: "CRC", inStock: true }],
});

const cond = { etag: null, lastModified: null };

describe("delta storage", () => {
  it("only writes a snapshot when the price changes", () => {
    const db = openDb(":memory:");

    expect(saveProduct(db, normalize(raw(2990), "2026-06-01"), cond)).toBe(1);
    // Same price next day -> no new snapshot.
    expect(saveProduct(db, normalize(raw(2990), "2026-06-02"), cond)).toBe(0);
    // Price drop -> one snapshot.
    expect(saveProduct(db, normalize(raw(1990), "2026-06-03"), cond)).toBe(1);

    expect(getPriceHistory(db, "5010348")).toHaveLength(2);

    const product = getProduct(db, "5010348");
    expect(product?.variants[0].price).toBe(1990);

    const drops = listPriceDrops(db, "2026-06-01");
    expect(drops).toHaveLength(1);
    expect(drops[0]).toMatchObject({ oldPrice: 2990, newPrice: 1990, dropPct: 33.4 });

    db.close();
  });
});
