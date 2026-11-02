const {chromium}=require('C:/Users/Jaiso/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const path=require('node:path');const fs=require('node:fs/promises');const assert=require('node:assert/strict');
(async()=>{
 const context=await chromium.launchPersistentContext(path.resolve('tools/browser-profile'),{executablePath:'C:/Users/Jaiso/AppData/Local/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width:780,height:1000},args:['--remote-debugging-port=9227','--remote-allow-origins=devtools://devtools']});
 try{
 const page=await context.newPage();await page.goto('http://127.0.0.1:5500/practice-01/debug.html');
 const cdp=await context.newCDPSession(page);const {targetInfo}=await cdp.send('Target.getTargetInfo');
 const dev=await context.newPage();await dev.setViewportSize({width:1800,height:1100});await dev.goto('devtools://devtools/bundled/inspector.html?ws=127.0.0.1:9227/devtools/page/'+targetInfo.targetId);await dev.getByRole('button',{name:'Settings - F1 - Shift + ?'}).waitFor();await dev.getByRole('button',{name:'Toggle screencast',exact:true}).click();await dev.getByRole('tab',{name:'Sources',exact:true}).click();
 await cdp.send('Debugger.enable');
 const text=await fs.readFile('practice-01/js/debug.js','utf8');const line=text.split('\n').findIndex(l=>l.startsWith('const completedTotal'));
 const {breakpointId}=await cdp.send('Debugger.setBreakpointByUrl',{url:'http://127.0.0.1:5500/practice-01/js/debug.js',lineNumber:line});
 let pausedPromise=new Promise(r=>cdp.once('Debugger.paused',r));const navigation=page.reload({timeout:15000});await pausedPromise;
 pausedPromise=new Promise(r=>cdp.once('Debugger.paused',r));await cdp.send('Debugger.stepOver');const pause=await pausedPromise;
 const values=await cdp.send('Debugger.evaluateOnCallFrame',{callFrameId:pause.callFrames[0].callFrameId,expression:'({completedText,additionalText,completedTotal,type:typeof completedTotal})',returnByValue:true});assert.equal(values.result.value.completedTotal,5);console.log('VALUES',values.result.value);
 await dev.getByRole('button',{name:/Resume script execution/}).waitFor();console.log((await dev.locator('body').ariaSnapshot()).slice(-15000));await dev.screenshot({path:'Скриншоты/pr01-breakpoint.png'});
 await cdp.send('Debugger.removeBreakpoint',{breakpointId});await cdp.send('Debugger.resume');await navigation;
 await fs.writeFile('Протоколы/pr01-real-debug.json',JSON.stringify(values.result.value,null,2));
 }finally{await context.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
