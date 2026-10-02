import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:5174',{waitUntil:'networkidle'});
await page.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));
await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
await page.screenshot({path:'artifacts/model2/reference-desktop.png',fullPage:true});
const result={errors,headings:await page.locator('h1,h2').allTextContents(),images:await page.locator('img').evaluateAll(imgs=>imgs.map(i=>({src:i.currentSrc,valid:i.naturalWidth>0}))),widths:[]};
for(const width of [1440,834,390,320]){
 await page.setViewportSize({width,height:900});
 await page.screenshot({path:`artifacts/model2/reference-${width}.png`,fullPage:true});
 result.widths.push({width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
}
await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
await page.locator('.mobile-menu').getByRole('link',{name:/Fotografia/}).click();
await page.waitForURL('**/fotografia');
await page.waitForURL('**/fotografia');
result.mobileNavigation=page.url().endsWith('/fotografia');
await fs.writeFile('artifacts/model2/reference-qa.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2)); await browser.close();
if(errors.length||result.widths.some(w=>w.overflow)||result.images.some(i=>!i.valid)||!result.mobileNavigation)process.exitCode=1;
