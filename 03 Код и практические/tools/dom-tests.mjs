import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';
import { readFile,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const base=fileURLToPath(new URL('..',import.meta.url));
const logs=[];let number=0;
function record(message){logs.push('OK: '+message);console.log('OK:',message);}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(test){for(let i=0;i<600;i++){if(test())return;await pause(5);}throw Error('Timed out');}
async function boot(n,{search='',saved={}}={}) {
 const folder=`practice-${String(n).padStart(2,'0')}`;
 const dom=new JSDOM(await readFile(resolve(base,folder,'index.html'),'utf8'),{
  url:`http://127.0.0.1:5500/${folder}/index.html${search}`,runScripts:'outside-only',pretendToBeVisual:true
 });
 for(const key of ['window','document','Element','HTMLElement','HTMLInputElement','HTMLSelectElement','HTMLLIElement','Event','MouseEvent','FormData'])globalThis[key]=key==='window'?dom.window:dom.window[key];
 dom.window.confirm=()=>true;
 for(const [key,value]of Object.entries(saved))dom.window.localStorage.setItem(key,value);
 await import(pathToFileURL(resolve(base,folder,'src/main.js')).href+`?test=${number++}`);
 if(n===6)await dom.window.practice06.ready;
 return dom;
}
const $=s=>document.querySelector(s);
const ids=()=>[...document.querySelectorAll('#task-list > [data-task-id]')].map(e=>Number(e.dataset.taskId));
const stats=()=>[...document.querySelectorAll('[data-stat]')].map(e=>e.textContent);
const click=s=>{const el=$(s);assert.ok(el,s);el.click();};
function input(selector,value){const el=$(selector);el.value=String(value);el.dispatchEvent(new window.Event('input',{bubbles:true}));el.dispatchEvent(new window.Event('change',{bubbles:true}));}
function add4(id,title,priority){input('#task-id',id);input('#task-title',title);input('#task-priority',priority);$('#task-form').requestSubmit();}
const saved=()=>Object.fromEntries(Object.keys(window.localStorage).map(k=>[k,window.localStorage.getItem(k)]));
let dom=await boot(3);
assert.deepEqual(ids(),[1,4,7,10]);assert.deepEqual(stats(),['4','2','2','50.0%','4']);record('ПР3: исходные id и сводка');
assert.equal($('[data-task-id="4"] .task-priority').textContent,'Высокий');
assert.equal($('[data-task-id="4"] [data-action="toggle"]').getAttribute('aria-pressed'),'false');
assert.equal($('[data-task-id="4"] [data-action="toggle"] .action-label').textContent,'Выполнена');record('ПР3: контракт карточки, локализация и aria-pressed');
click('[data-filter="pending"] .filter-label');click('[data-task-id="4"] [data-action="toggle"] .action-label');
assert.deepEqual(ids(),[7]);assert.deepEqual(stats(),['4','3','1','75.0%','1']);record('ПР3: делегирование по span; задача 4 исчезает; 75.0%');
assert.equal(document.activeElement.dataset.filter,'pending');record('ПР3: возврат фокуса на активный фильтр');
click('[data-filter="all"]');
for(const id of [1,4,7,10])click(`[data-task-id="${id}"] [data-action="delete"]`);
assert.deepEqual(ids(),[]);assert.equal($('#empty-message').textContent,'Список задач пуст.');record('ПР3: удаление всех задач и пустая сводка');dom.window.close();
dom=await boot(3,{search:'?dataset=variant'});
assert.deepEqual(ids(),[11,23,37,41,58,64]);assert.deepEqual(stats(),['6','2','4','33.3%','6']);
for(const filter of ['pending','completed','all'])click(`[data-filter="${filter}"]`);
click('[data-task-id="23"] [data-action="toggle"]');click('[data-task-id="37"] [data-action="delete"]');
assert.deepEqual(ids(),[11,23,41,58,64]);assert.deepEqual(stats(),['5','1','4','20.0%','5']);record('ПР3: полный сценарий варианта 3, итог 5/1/4/20.0%');dom.window.close();
dom=await boot(3);
$('[data-task-id="4"]').dataset.taskId='4abc';click('[data-task-id="4abc"] [data-action="toggle"]');assert.ok($('#operation-message').textContent);
click('[data-filter="all"]');assert.deepEqual(ids(),[1,4,7,10]);record('ПР3: неверный id не меняет состояние');
const view=await import(pathToFileURL(resolve(base,'practice-03/src/task-view.js')).href);
const hostile=view.createTaskElement({id:9,title:'<strong>X</strong>',completed:false,priority:'low'});
assert.equal(hostile.querySelector('.task-title').children.length,0);assert.equal(hostile.querySelector('.task-title').textContent,'<strong>X</strong>');record('ПР3: пользовательское название выводится безопасным текстом');dom.window.close();

dom=await boot(4);add4(20,'  Изучить localStorage  ','high');assert.deepEqual(ids(),[1,4,7,10,20]);
assert.equal(JSON.parse(window.localStorage.getItem('tip-js-practice-04:demo')).tasks.at(-1).title,'Изучить localStorage');record('ПР4: добавление и сохранение нормализованной задачи');
const old=window.localStorage.getItem('tip-js-practice-04:demo');add4(4,'Дубликат','low');assert.equal(window.localStorage.getItem('tip-js-practice-04:demo'),old);assert.ok($('#task-id-error').textContent);record('ПР4: повторный id — ошибка без записи');
click('[data-task-id="4"] [data-action="edit"]');assert.ok($('#task-id').disabled);input('#task-title','Подготовить форму задач');input('#task-priority','low');$('#task-form').requestSubmit();
assert.equal($('[data-task-id="4"] .task-title').textContent,'Подготовить форму задач');assert.equal($('[data-task-id="4"] .task-status').textContent,'В работе');record('ПР4: редактирование сохраняет completed');
click('[data-task-id="7"] [data-action="toggle"]');click('[data-task-id="1"] [data-action="delete"]');let persistence=saved();dom.window.close();
dom=await boot(4,{saved:persistence});assert.deepEqual(ids(),[4,7,10,20]);assert.deepEqual(stats(),['4','2','2','50.0%','4']);assert.match($('#storage-status').textContent,/восстановлены/i);record('ПР4: восстановление в новом виртуальном DOM, итог 4/2/2/50.0%');
click('#reset-data');assert.equal(window.localStorage.getItem('tip-js-practice-04:demo'),null);assert.deepEqual(ids(),[1,4,7,10]);record('ПР4: сброс удаляет только свой ключ');dom.window.close();
dom=await boot(4,{saved:{'tip-js-practice-04:demo':'{broken-json'}});assert.deepEqual(ids(),[1,4,7,10]);assert.match($('#storage-status').textContent,/Ошибка/);record('ПР4: повреждённый JSON — исходный набор и предупреждение');dom.window.close();
dom=await boot(4,{search:'?dataset=variant'});add4(75,'Проверить раздел контактов','medium');click('[data-task-id="23"] [data-action="edit"]');input('#task-title','Уточнить макет портфолио');input('#task-priority','high');$('#task-form').requestSubmit();click('[data-task-id="37"] [data-action="delete"]');
assert.deepEqual(ids(),[11,23,41,58,64,75]);assert.deepEqual(stats(),['6','2','4','33.3%','6']);persistence=saved();dom.window.close();
dom=await boot(4,{search:'?dataset=variant',saved:persistence});assert.deepEqual(ids(),[11,23,41,58,64,75]);assert.equal($('[data-task-id="23"] .task-priority').textContent,'Высокий');record('ПР4: сценарий варианта и восстановление в новом виртуальном DOM');dom.window.close();
dom=await boot(4,{saved:persistence});assert.deepEqual(ids(),[1,4,7,10]);record('ПР4: ключи demo и variant независимы');dom.window.close();

const {createApiClient}=await import(pathToFileURL(resolve(base,'practice-06/src/api-client.js')).href);
const {createTaskApi}=await import(pathToFileURL(resolve(base,'practice-06/src/task-api.js')).href);
const api=createTaskApi(createApiClient({baseUrl:'http://127.0.0.1:5505/api'}));await api.resetDemoData();
dom=await boot(6);assert.equal(ids().length,12);assert.equal($('#task-category').options.length,4);record('ПР6: загрузка 12 задач и 3 категорий через настоящий HTTP API');
input('#filter-completed','false');$('#filters-form').requestSubmit();await until(()=>ids().length===7);click('[data-task-id="4"] [data-action="toggle"]');await until(()=>ids().length===6);
assert.deepEqual(ids(),[7,13,19,22,28,34]);record('ПР6: событие toggle -> PATCH -> GET completed=false');
input('#filter-query','такой задачи точно нет');$('#filters-form').requestSubmit();await until(()=>$('#list-state').dataset.kind==='empty');record('ПР6: запрос без результатов -> empty');
click('#clear-filters');await until(()=>ids().length===12);
input('#task-title','   ');input('#task-category','2');$('#task-form').requestSubmit();assert.ok($('#task-title-error').textContent);record('ПР6: форма из пробелов отклонена');
input('#task-title','Создать страницу портфолио');input('#task-priority','high');$('#task-form').requestSubmit();await until(()=>ids().length===13);assert.ok(ids().includes(35));record('ПР6: создание с серверным id 35');
dom.window.confirm=()=>false;click('[data-task-id="35"] [data-action="delete"]');assert.ok(ids().includes(35));record('ПР6: отмена подтверждения удаления сохраняет запись');
dom.window.confirm=()=>true;click('[data-task-id="35"] [data-action="delete"]');await until(()=>ids().length===12);record('ПР6: подтверждённое удаление');
await window.practice06.controller.resetData();dom.window.close();
dom=await boot(6,{search:'?dataset=variant'});assert.deepEqual(ids(),[4,13,16,25,34]);click('[data-task-id="4"] [data-action="edit"]');input('#task-priority','medium');$('#task-form').requestSubmit();await until(()=>ids().length===4);assert.deepEqual(ids(),[13,16,25,34]);record('ПР6: вариант 3, изменение high -> medium удаляет карточку из выборки');
await window.practice06.controller.resetData();dom.window.close();
dom=await boot(6,{search:'?api=http://127.0.0.1:1/api'});assert.equal($('#list-state').dataset.kind,'error');assert.equal($('#retry-load').hidden,false);record('ПР6: недоступный API -> error и кнопка повтора');dom.window.close();
logs.unshift('Проверки DOM выполнены в jsdom 30.1.3 под Node.js, без настоящего браузера и DevTools. Сеть ПР6 настоящая. Имитация перезагрузки создаёт новый DOM с прежними строками хранилища.');
logs.push(`Итог: ${logs.filter(l=>l.startsWith('OK:')).length} сценариев, 0 ошибок.`);
await writeFile(resolve(base,'Протоколы/dom-jsdom.txt'),logs.join('\n'));
