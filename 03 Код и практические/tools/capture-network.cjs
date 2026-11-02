const {chromium}=require('C:/Users/Jaiso/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const path=require('node:path');const fs=require('node:fs/promises');const assert=require('node:assert/strict');
(async()=>{
 const context=await chromium.launchPersistentContext(path.resolve('tools/browser-profile'),{executablePath:'C:/Users/Jaiso/AppData/Local/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width:780,height:1000},args:['--remote-debugging-port=9227','--remote-allow-origins=devtools://devtools']});
 try{
 const page=await context.newPage();page.on('dialog',d=>d.accept());await page.goto('http://127.0.0.1:5500/practice-06/');await page.waitForFunction(()=>window.practice06);await page.evaluate(()=>window.practice06.ready);await page.locator('#reset-data').click();await page.waitForFunction(()=>document.querySelectorAll('#task-list > li').length===12);
 await page.locator('#filter-completed').selectOption('false');await page.locator('#filters-form').getByRole('button',{name:'Применить',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('#task-list > li').length===7);
 const cdp=await context.newCDPSession(page);const {targetInfo}=await cdp.send('Target.getTargetInfo');
 const dev=await context.newPage();await dev.setViewportSize({width:1800,height:1100});await dev.goto('devtools://devtools/bundled/inspector.html?ws=127.0.0.1:9227/devtools/page/'+targetInfo.targetId);await dev.getByRole('button',{name:'Settings - F1 - Shift + ?'}).waitFor();
 await dev.getByRole('tab',{name:'Network',exact:true}).click();
 await dev.getByRole('button',{name:/Clear network log/}).waitFor();
 await dev.evaluate(async()=>{const C=await import('./core/common/common.js');const setting=C.Settings.Settings.instance().createSetting('network-log-columns',{});const value=setting.get();value.name={visible:true,weight:15};value.method={visible:true,weight:12};value.url={visible:true,weight:52};value.status={visible:true,weight:8};value.type={visible:true,weight:8};value.initiator={visible:false};value.size={visible:false};value.time={visible:false};setting.set(value);});
 await dev.reload();await dev.getByRole('button',{name:/Clear network log/}).waitFor();
 const cast=dev.getByRole('button',{name:'Toggle screencast',exact:true});if(await cast.getAttribute('aria-pressed')!=='true')await cast.click();await dev.getByRole('textbox',{name:'Address bar',exact:true}).waitFor();await dev.getByRole('button',{name:/Clear network log/}).click();
 console.log((await dev.locator('body').ariaSnapshot()).slice(0,12000));
 await dev.screenshot({path:'Скриншоты/network-before.png'});
 const trace=[];page.on('response',response=>{if(response.url().includes('/api/tasks'))trace.push({method:response.request().method(),url:response.url(),status:response.status()});});
 const updated=page.waitForResponse(r=>r.request().method()==='PATCH'&&r.url().endsWith('/api/tasks/4'));
 await page.locator('[data-task-id="4"] [data-action="toggle"]').click();assert.equal((await updated).status(),200);await page.waitForFunction(()=>!document.querySelector('[data-task-id="4"]')&&document.querySelectorAll('#task-list > li').length===6);
 await page.locator('#filters-form').scrollIntoViewIfNeeded();
 console.log((await dev.locator('body').ariaSnapshot()).slice(-14000));
 const resize=await dev.locator('.data-grid-resizer').first().boundingBox();
 await dev.mouse.move(resize.x+2,resize.y+100);await dev.mouse.down();await dev.mouse.move(965,resize.y+100,{steps:15});await dev.mouse.up();
 const resizeURL=await dev.locator('.data-grid-resizer').nth(1).boundingBox();
 await dev.mouse.move(resizeURL.x+2,resizeURL.y+100);await dev.mouse.down();await dev.mouse.move(1470,resizeURL.y+100,{steps:15});await dev.mouse.up();
 await dev.screenshot({path:'Скриншоты/kr2-5.png'});await fs.writeFile('Протоколы/pr06-real-network.json',JSON.stringify(trace,null,2));
 }finally{await context.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
