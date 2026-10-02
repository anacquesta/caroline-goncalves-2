import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.PAGES_QA_URL || 'http://127.0.0.1:5180/caroline-goncalves-2';
const routes = ['', 'sobre', 'jornalismo', 'comunicacao', 'trabalhos', 'projetos', 'fotografia', 'blog', 'depoimentos', 'contato', 'agendamento', 'privacidade', 'cookies', 'admin'];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({viewport:{width:1440,height:1000}});
const page = await context.newPage();
const errors = [], results = [], apiRequests = [];
page.on('pageerror', e => errors.push(e.message));
page.on('request', r => { if (new URL(r.url()).pathname.startsWith('/api/')) apiRequests.push(r.url()); });
await mkdir('artifacts/qa', {recursive:true});
for(const route of routes) {
 const response=await page.goto(`${base}/${route ? route+'/' : ''}`,{waitUntil:'networkidle'});
 await page.locator('h1').first().waitFor();
 await page.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
 results.push({route:route||'/',status:response.status(),brokenImages:await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.naturalWidth).map(i=>i.src))});
 if(route==='contato' && await page.getByRole('button',{name:'PREPARAR E-MAIL'}).count()!==1)errors.push('Contato sem alternativa de e-mail.');
 if(route==='agendamento' && !await page.locator('a[href^="https://wa.me/"]').count())errors.push('Agendamento sem WhatsApp.');
}
await page.goto(base+'/',{waitUntil:'networkidle'});
await page.screenshot({path:'artifacts/qa/pages-home-desktop.png'});
await page.getByRole('link',{name:'Perfil',exact:true}).first().click();
await page.waitForURL('**/sobre/');
await page.reload({waitUntil:'networkidle'});
if(!page.url().endsWith('/caroline-goncalves-2/sobre/'))errors.push('Rota direta incorreta.');
for(const width of [1440,834,390,320]) {
 await page.setViewportSize({width,height:900});await page.goto(base+'/',{waitUntil:'networkidle'});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errors.push(`Transbordamento ${width}px`);
 if(width===390)await page.screenshot({path:'artifacts/qa/pages-home-mobile.png'});
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 if(audit.violations.length)errors.push(...audit.violations.map(v=>`${width}px: ${v.id}`));
}
await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
await page.locator('.mobile-menu').getByRole('link',{name:/Fotografia/}).click();await page.waitForURL('**/fotografia/');
if(apiRequests.length)errors.push('Chamadas de servidor na versão estática: '+apiRequests.join(', '));
await writeFile('artifacts/qa/pages-results.json',JSON.stringify({errors,results,apiRequests},null,2));
console.log(JSON.stringify({tested:results.length,errors,failures:results.filter(r=>r.status!==200||r.brokenImages.length)}));
await browser.close();if(errors.length||results.some(r=>r.status!==200||r.brokenImages.length))process.exitCode=1;
