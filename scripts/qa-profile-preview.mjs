import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch();
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const width of [1440,390]){
 await page.setViewportSize({width,height:1000});
 await page.goto('http://localhost:5173/',{waitUntil:'networkidle'});
 const section=page.locator('.profile-preview');
 await expect(section).toContainText('PERFIL / CAROLINE GONÇALVES');
 await expect(section.locator('img')).toHaveAttribute('src','/images/caroline-perfil-home.png');
 const loaded=await section.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 if(!loaded||overflow)errors.push(`${width}: loaded=${loaded}, overflow=${overflow}`);
 await section.screenshot({path:`artifacts/qa/perfil-home-${width}.png`});
}
await page.goto('http://localhost:5173/sobre',{waitUntil:'networkidle'});
await expect(page.locator('.about-intro img')).toHaveAttribute('src','/images/caroline-perfil.png');
console.log(JSON.stringify({errors}));
await browser.close();
if(errors.length)process.exitCode=1;
