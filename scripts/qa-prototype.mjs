import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await fs.mkdir('artifacts/qa',{recursive:true});
await page.goto('http://localhost:5173/',{waitUntil:'networkidle'});
await page.screenshot({path:'artifacts/qa/home-desktop.png'});
await page.locator('.axis').nth(1).click();
await page.waitForTimeout(800);
await page.screenshot({path:'artifacts/qa/orbit-selected.png'});
const routes=['/sobre','/jornalismo','/comunicacao','/fotografia','/fotografia/brasilia-em-pausa','/fotografia/presencas','/fotografia/cultura-em-movimento','/projetos','/projetos/cidade-em-voz-alta','/projetos/presenca-que-aproxima','/projetos/entre-luz-e-silencio','/projetos/vozes-do-encontro','/blog',...['historias-continuam-importando','a-pergunta-antes-da-resposta','a-cidade-em-pequenos-gestos','fotografar-e-perceber','conteudo-com-intencao','o-tempo-da-escuta'].map(x=>'/blog/'+x),'/depoimentos','/contato','/admin'];
const results=[];
for(const route of routes){const response=await page.goto('http://localhost:5173'+route,{waitUntil:'networkidle'});await page.screenshot({path:'artifacts/qa/'+route.slice(1).replaceAll('/','-')+'.png',fullPage:true});results.push({route,status:response.status(),h1:await page.locator('h1').first().innerText(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),images:await page.locator('img').evaluateAll(images=>images.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src))});}
await page.setViewportSize({width:390,height:844});
for(const route of ['/','/sobre','/jornalismo','/comunicacao','/fotografia','/fotografia/brasilia-em-pausa','/projetos','/projetos/cidade-em-voz-alta','/blog','/blog/historias-continuam-importando','/depoimentos','/contato','/admin']){await page.goto('http://localhost:5173'+route,{waitUntil:'networkidle'});await page.screenshot({path:'artifacts/qa/mobile-'+(route==='/'?'home':route.slice(1).replaceAll('/','-'))+'.png',fullPage:true});results.push({route,mobile:true,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});}
await fs.writeFile('artifacts/qa/results.json',JSON.stringify({errors,results},null,2));
console.log(JSON.stringify({errors,failures:results.filter(r=>r.status&&r.status!==200||r.overflow||r.images?.length),tested:results.length}));
await browser.close();if(errors.length||results.some(r=>r.status&&r.status!==200||r.overflow||r.images?.length))process.exitCode=1;


