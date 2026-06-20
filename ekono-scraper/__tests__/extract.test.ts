import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { extractProduct } from "../src/scraper/extract.js";
import { isProductUrl, productIdFromUrl } from "../src/scraper/discover.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, "fixtures", "product.html"), "utf8");
const url = "https://www.tiendasekono.com/snacks-5010348.html";

describe("discover", () => {
  it("recognizes product urls and extracts ids", () => {
    expect(isProductUrl(url)).toBe(true);
    expect(isProductUrl("https://www.tiendasekono.com/mujer.html")).toBe(false);
    expect(productIdFromUrl(url)).toBe("5010348");
  });
});

describe("extractProduct", () => {
  it("pulls product data from JSON-LD", () => {
    const product = extractProduct(fixture, url);
    expect(product).not.toBeNull();
    expect(product!.id).toBe("5010348");
    expect(product!.name).toBe("Snacks para perros");
    expect(product!.brand).toBe("Mascotas Ekono");
    expect(product!.category).toBe("Mascotas");
    expect(product!.offers).toHaveLength(1);
    expect(product!.offers[0]).toMatchObject({ price: 2990, currency: "CRC", inStock: true });
  });

  it("returns null when the url is not a product", () => {
    expect(extractProduct(fixture, "https://www.tiendasekono.com/mujer.html")).toBeNull();
  });
});
