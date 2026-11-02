const {chromium}=require('C:/Users/Jaiso/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const path=require('node:path');const fs=require('node:fs/promises');const assert=require('node:assert/strict');
(async()=>{
 const context=await chromium.launchPersistentContext(path.resolve('tools/browser-profile'),{executablePath:'C:/Users/Jaiso/AppData/Local/Google/Chrome/Application/chrome.exe',headless:true,viewport:{width:780,height:1000},args:['--remote-debugging-port=9227','--remote-allow-origins=devtools://devtools']});
 const results=[];
 async function inspect(page){
  const cdp=await context.newCDPSession(page);const {targetInfo}=await cdp.send('Target.getTargetInfo');
  const dev=await context.newPage();await dev.setViewportSize({width:1800,height:1100});await dev.goto('devtools://devtools/bundled/inspector.html?ws=127.0.0.1:9227/devtools/page/'+targetInfo.targetId);await dev.getByRole('button',{name:'Settings - F1 - Shift + ?'}).waitFor();const cast=dev.getByRole('button',{name:'Toggle screencast',exact:true});if(await cast.getAttribute('aria-pressed')==='true')await cast.click();await dev.getByRole('tab',{name:'Sources',exact:true}).click();await cdp.send('Debugger.enable');return{cdp,dev};
 }
 const pause=cdp=>new Promise(r=>cdp.once('Debugger.paused',r));
 async function values(cdp,state,expression){const r=await cdp.send('Debugger.evaluateOnCallFrame',{callFrameId:state.callFrames[0].callFrameId,expression,returnByValue:true});assert.ok(!r.exceptionDetails);return r.result.value;}
 try{
 // P3: a genuine breakpoint inside the button listener, while the original target is span.
 const page3=await context.newPage();await page3.goto('http://127.0.0.1:5500/practice-03/examples/dom-events.html');const a=await inspect(page3);
 const lines3=(await fs.readFile('practice-03/examples/dom-events.js','utf8')).split('\n');const bp3=await a.cdp.send('Debugger.setBreakpointByUrl',{url:'http://127.0.0.1:5500/practice-03/examples/dom-events.js',lineNumber:lines3.findIndex(l=>l.trim()==='record(event);')});
 let waiting=pause(a.cdp);const clicked3=page3.locator('#lab-label').click({timeout:20000});let state=await waiting;
 const event=await values(a.cdp,state,'({target:event.target.id,currentTarget:event.currentTarget.id,phase:event.eventPhase})');assert.deepEqual(event,{target:'lab-label',currentTarget:'lab-button',phase:3});results.push({practice:3,event});
 await a.dev.getByRole('button',{name:/Resume script execution/}).waitFor();await a.dev.screenshot({path:'Скриншоты/pr03-breakpoint.png'});await a.cdp.send('Debugger.removeBreakpoint',{breakpointId:bp3.breakpointId});await a.cdp.send('Debugger.resume');await clicked3;await a.dev.close();await page3.close();
 // P4: pause after validation and service operation, before assigning and saving state.
 const page4=await context.newPage();await page4.goto('http://127.0.0.1:5500/practice-04/');await page4.locator('#reset-data').click();await page4.locator('#task-id').fill('20');await page4.locator('#task-title').fill('  Изучить localStorage  ');await page4.locator('#task-priority').selectOption('high');const b=await inspect(page4);
 const lines4=(await fs.readFile('practice-04/src/main.js','utf8')).split('\n');const start=lines4.findIndex(l=>l.startsWith('function handleFormSubmit'));
 const bp4=await b.cdp.send('Debugger.setBreakpointByUrl',{url:'http://127.0.0.1:5500/practice-04/src/main.js',lineNumber:lines4.findIndex((l,i)=>i>start&&l.includes('if (!result.ok)'))});
 waiting=pause(b.cdp);const clicked4=page4.locator('#form-submit').click({timeout:20000});state=await waiting;
 const success=await values(b.cdp,state,'({draft,checked,result:{ok:result.ok,added:result.tasks.find(t=>t.id===20)}})');assert.equal(success.draft.title,'  Изучить localStorage  ');assert.equal(success.checked.value.title,'Изучить localStorage');assert.equal(success.result.ok,true);results.push({practice:4,success});
 await b.dev.getByRole('button',{name:/Resume script execution/}).waitFor();
 for(const name of ['draft','checked']){const item=b.dev.getByRole('treeitem',{name:new RegExp('^'+name+' :')});if(await item.count())await item.dblclick();}
 await b.dev.screenshot({path:'Скриншоты/pr04-breakpoint.png'});await b.cdp.send('Debugger.removeBreakpoint',{breakpointId:bp4.breakpointId});await b.cdp.send('Debugger.resume');await clicked4;
 const stored=await page4.evaluate(()=>localStorage.getItem('tip-js-practice-04:demo'));assert.equal(JSON.parse(stored).tasks.length,5);
 const failureBP=await b.cdp.send('Debugger.setBreakpointByUrl',{url:'http://127.0.0.1:5500/practice-04/src/main.js',lineNumber:lines4.findIndex((l,i)=>i>start&&l.includes('if (!checked.ok)')),condition:'!checked.ok'});
 await page4.locator('#task-id').fill('4');await page4.locator('#task-title').fill('Дубликат');waiting=pause(b.cdp);const failedClick=page4.locator('#form-submit').click({timeout:20000});state=await waiting;const failure=await values(b.cdp,state,'({draft,checked})');assert.equal(failure.checked.ok,false);assert.ok(failure.checked.errors.id);results.push({practice:4,failure});await b.dev.screenshot({path:'Скриншоты/pr04-duplicate-breakpoint.png'});await b.cdp.send('Debugger.removeBreakpoint',{breakpointId:failureBP.breakpointId});await b.cdp.send('Debugger.resume');await failedClick;assert.equal(await page4.evaluate(()=>localStorage.getItem('tip-js-practice-04:demo')),stored);
 await fs.writeFile('Протоколы/pr03-pr04-real-debug.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
 }finally{await context.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
