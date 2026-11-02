import {fileURLToPath} from "node:url";
import { JSDOM } from 'jsdom';
import { readFile,writeFile } from 'node:fs/promises';
import {resolve}from'node:path';
const base=fileURLToPath(new URL('..',import.meta.url));
const messages=['Среда: jsdom 30.1.3 под Node.js; эти наблюдения не являются запуском в настоящем браузере.'];
const show=(...items)=>messages.push(items.map(v=>typeof v==='string'?v:JSON.stringify(v)).join(' '));
for(const [n,filename]of [[3,'dom-events'],[4,'forms-storage']]) {
 const folder=`practice-0${n}/examples/`;
 const dom=new JSDOM(await readFile(resolve(base,folder+filename+'.html'),'utf8'),{url:`http://127.0.0.1:5500/${folder}${filename}.html`,runScripts:'outside-only'});
 const w=dom.window,d=w.document;w.console.log=show;
 show(`ПР${n} — эксперименты`);
 w.eval(await readFile(resolve(base,folder+filename+'.js'),'utf8'));
 if(n===3){
  d.querySelector('#append-button').click();d.querySelector('#append-button').click();
  d.querySelector('#lab-label').click();
  show('Название после клика:',d.querySelector('#lab-title').textContent,'дочерних HTML-элементов:',d.querySelector('#lab-title').children.length);
 } else {
  let submits=0;const form=d.querySelector('#lab-form');form.addEventListener('submit',()=>submits++);
  form.requestSubmit();show('Пустое название: submit-событий',submits,'validity.valid',d.querySelector('#lab-title').validity.valid);
  const input=value=>{d.querySelector('#lab-title').value=value;d.querySelector('#lab-title').dispatchEvent(new w.Event('input',{bubbles:true}));};
  input('   ');form.requestSubmit();show('Пробелы:',d.querySelector('#lab-log').textContent,'ошибка:',d.querySelector('#lab-title-error').textContent);
  input('  Портфолио  ');form.requestSubmit();show('Корректная форма:',d.querySelector('#lab-log').textContent);
  d.querySelector('#load-value').click();show('Чтение:',d.querySelector('#lab-log').textContent);
  d.querySelector('#write-broken').click();d.querySelector('#load-value').click();show('Повреждённый JSON:',d.querySelector('#lab-log').textContent);
 }
 dom.window.close();
}
await writeFile(resolve(base,'Протоколы/dom-experiments-jsdom.txt'),messages.join('\n'));
console.log(messages.join('\n'));
