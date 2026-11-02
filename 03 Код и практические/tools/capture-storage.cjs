const {chromium}=require('C:/Users/Jaiso/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');const fs=require('node:fs/promises');const assert=require('node:assert/strict');
(async()=>{
 const context=await chromium.launchPersistentContext(path.resolve('tools/browser-profile'),{executablePath:'C:/Users/Jaiso/AppData/Local/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width:780,height:1000},args:['--remote-debugging-port=9227','--remote-allow-origins=devtools://devtools']});
 try {
 const page=await context.newPage();await page.goto('http://127.0.0.1:5500/practice-04/');
 await page.locator('#reset-data').click();await page.locator('#task-id').fill('20');await page.locator('#task-title').fill('Изучить localStorage');await page.locator('#task-priority').selectOption('high');await page.locator('#form-submit').click();await page.reload();
 assert.match(await page.locator('#storage-status').innerText(),/восстановлены/);
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('tip-js-practice-04:demo')));
 assert.equal(stored.version,1);assert.equal(stored.tasks.find(t=>t.id===20).priority,'high');
 await page.locator('#task-list').scrollIntoViewIfNeeded();
 const cdp=await context.newCDPSession(page);const {targetInfo}=await cdp.send('Target.getTargetInfo');
 const dev=await context.newPage();await dev.setViewportSize({width:1800,height:1100});
 await dev.goto('devtools://devtools/bundled/inspector.html?ws=127.0.0.1:9227/devtools/page/'+targetInfo.targetId);
 await dev.getByRole('button',{name:'Settings - F1 - Shift + ?'}).waitFor();
 if(await dev.getByRole('button',{name:'Don’t show again',exact:true}).count())await dev.getByRole('button',{name:'Don’t show again',exact:true}).click();
 // Resize the genuine DevTools screencast split; the left panel is the live inspected page.
 const divider=await dev.locator('.screencast-split-view > .shadow-split-widget > .shadow-split-widget-resizer').count();
 await dev.mouse.move(1500,550);await dev.mouse.down();await dev.mouse.move(820,550,{steps:10});await dev.mouse.up();
 await dev.getByRole('tab',{name:'Application',exact:true}).click();await dev.getByRole('treeitem',{name:'Local storage',exact:true}).dblclick();
 await dev.getByRole('treeitem',{name:'http://127.0.0.1:5500',exact:true}).click();
 await dev.getByRole('cell',{name:'tip-js-practice-04:demo',exact:true}).click();
 await dev.mouse.move(1400,900);await dev.mouse.down();await dev.mouse.move(1400,450,{steps:10});await dev.mouse.up();
 await dev.getByRole('treeitem',{name:/^tasks :/}).dblclick();
 await dev.getByRole('treeitem',{name:/^4 :/}).dblclick();
 console.log((await dev.locator('body').ariaSnapshot()).slice(-9000));
 await dev.screenshot({path:'Скриншоты/kr2-2.png'});
 await fs.writeFile('Протоколы/pr04-real-storage.json',JSON.stringify(stored,null,2));
 }finally{await context.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

