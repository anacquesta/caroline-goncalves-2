import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const base = 'http://127.0.0.1:4173/caroline-goncalves-1';
const routes = [
  '', 'sobre', 'jornalismo', 'comunicacao', 'projetos', 'fotografia', 'blog', 'depoimentos', 'contato', 'admin',
  ...['cidade-em-voz-alta', 'presenca-que-aproxima', 'entre-luz-e-silencio', 'vozes-do-encontro'].map(slug => `projetos/${slug}`),
  ...['brasilia-em-pausa', 'presencas', 'cultura-em-movimento'].map(slug => `fotografia/${slug}`),
  ...['historias-continuam-importando', 'a-pergunta-antes-da-resposta', 'a-cidade-em-pequenos-gestos', 'fotografar-e-perceber', 'conteudo-com-intencao', 'o-tempo-da-escuta'].map(slug => `blog/${slug}`),
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const results = [];
await mkdir('artifacts/qa', { recursive: true });

for (const route of routes) {
  const response = await page.goto(`${base}/${route ? `${route}/` : ''}`, { waitUntil: 'networkidle' });
  await page.locator('h1').first().waitFor();
  const brokenImages = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src));
  results.push({ route: route || '/', status: response?.status(), brokenImages, heading: await page.locator('h1').first().innerText() });
}

await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'artifacts/qa/pages-home-desktop.png' });
await page.getByRole('link', { name: /Perfil/ }).first().click();
if (!page.url().endsWith('/caroline-goncalves-1/sobre/')) errors.push('A navegação para Perfil não funcionou.');
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'artifacts/qa/pages-home-mobile.png' });
if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) errors.push('A página inicial extrapola a largura mobile.');

await writeFile('artifacts/qa/pages-results.json', JSON.stringify({ errors, results }, null, 2));
console.log(JSON.stringify({ tested: results.length, errors, failures: results.filter(result => result.status !== 200 || result.brokenImages.length) }));
await browser.close();
if (errors.length || results.some(result => result.status !== 200 || result.brokenImages.length)) process.exitCode = 1;
