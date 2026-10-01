import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await fs.mkdir("artifacts/model2", { recursive: true });
const results = [];
for (const route of [
  "/",
  "/sobre",
  "/trabalhos",
  "/jornalismo",
  "/comunicacao",
  "/fotografia",
  "/fotografia/brasilia-em-pausa",
  "/blog",
  "/blog/historias-continuam-importando",
  "/depoimentos",
  "/contato",
  "/agendamento",
  "/privacidade",
  "/admin",
  "/inexistente",
  "/blog/inexistente",
  "/robots.txt",
  "/sitemap.xml",
]) {
  const response = await page.goto("http://localhost:5174" + route, {
    waitUntil: "networkidle",
  });
  await page.locator('img').evaluateAll(images=>images.forEach(image=>{image.loading='eager'}));
  await page.waitForFunction(()=>Array.from(document.images).every(image=>image.complete));
  results.push({
    route,
    status: response.status(),
    heading: await page
      .locator("h1")
      .first()
      .textContent()
      .catch(() => ""),
    brokenImages: await page
      .locator("img")
      .evaluateAll((imgs) =>
        imgs.filter((i) => !i.complete || !i.naturalWidth).map((i) => i.src),
      ),
  });
}
for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["tablet", 834, 1112],
  ["mobile", 390, 844],
]) {
  await page.setViewportSize({ width, height });
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
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    if (overflow) errors.push(`${route}: overflow ${name}`);
    if (route === "/")
      await page.screenshot({
        path: `artifacts/model2/home-${name}.png`,
        fullPage: false,
      });
  }
}
const auth = await page.request.get("http://localhost:5174/api/cms");
results.push({ route: "/api/cms unauthorized", status: auth.status() });
await fs.writeFile(
  "artifacts/model2/qa.json",
  JSON.stringify({ errors, results }, null, 2),
);
console.log(JSON.stringify({ errors, results }, null, 2));
await browser.close();
if(errors.length||results.some(r=>r.brokenImages?.length))process.exitCode=1;
