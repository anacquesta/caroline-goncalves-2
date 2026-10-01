import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const results = [];
for (const width of [1440, 390]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of [
    "/",
    "/sobre",
    "/fotografia",
    "/blog",
    "/contato",
    "/admin",
  ]) {
    await page.goto("http://localhost:5174" + route, {
      waitUntil: "networkidle",
    });
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    results.push({
      route,
      width,
      violations: audit.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
    });
  }
}
await fs.writeFile(
  "artifacts/model2/accessibility.json",
  JSON.stringify(results, null, 2),
);
console.log(
  JSON.stringify(
    results.filter((r) => r.violations.length),
    null,
    2,
  ),
);
await browser.close();
