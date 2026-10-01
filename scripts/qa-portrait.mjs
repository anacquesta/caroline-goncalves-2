import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch();
const page=await browser.newPage();
const issues=[];
page.on('pageerror',e=>issues.push(e.message));
for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1000});
  await page.goto('http://localhost:5173/',{waitUntil:'networkidle'});
  await expect(page.getByRole('heading',{name:/Caroline Gonçalves/})).toBeVisible();
  await expect(page.locator('.portrait-frame img')).toHaveAttribute('src','/images/caroline-principal.png');
  const loaded=await page.locator('.portrait-frame img').evaluate(img=>img.complete&&img.naturalWidth>0);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(!loaded||overflow)issues.push(`Home ${width}: image=${loaded}, overflow=${overflow}`);
  await page.screenshot({path:`artifacts/qa/caroline-home-${width}.png`});
}
await page.setViewportSize({width:1440,height:1000});
await page.goto('http://localhost:5173/sobre',{waitUntil:'networkidle'});
await expect(page.locator('.about-intro img')).toHaveAttribute('src','/images/caroline-perfil.png');
await page.screenshot({path:'artifacts/qa/caroline-sobre-desktop.png'});
await page.goto('http://localhost:5173/admin',{waitUntil:'networkidle'});
await expect(page.getByText('Caroline Gonçalves').first()).toBeVisible();
console.log(JSON.stringify({issues,checked:['home 1440','home 768','home 390','sobre','admin']}));
await browser.close();
if(issues.length)process.exitCode=1;
