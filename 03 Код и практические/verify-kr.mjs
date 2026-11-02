import assert from 'node:assert/strict';
import { progress } from './practice-01/progress.js';
import { demoTasks } from './practice-02/src/data.js';
import { getPendingTasks, setTaskCompleted } from './practice-02/src/task-service.js';
import { validateTaskDraft } from './practice-04/src/form-validation.js';
import { saveTasks, loadTasks } from './practice-04/src/task-storage.js';
import { createApiClient } from './practice-06/src/api-client.js';
import { createTaskApi } from './practice-06/src/task-api.js';

assert.match(progress(12,5), /7.*41\.7%.*В работе/);
assert.equal(progress(0,0),'Задач пока нет');
for (const args of [[5,6],['12',5],[12,'5'],[-1,0],[1001,0],[2.5,1]]) assert.match(progress(...args),/^Ошибка:/);
assert.deepEqual(getPendingTasks(demoTasks).map(t=>t.id),[4,7]);
assert.deepEqual(getPendingTasks([]),[]);
const before=JSON.stringify(demoTasks);
const changed=setTaskCompleted(demoTasks,4,true);
assert.equal(changed.ok,true);
assert.equal(changed.tasks.find(t=>t.id===4).completed,true);
assert.equal(demoTasks.find(t=>t.id===4).completed,false);
assert.notEqual(changed.tasks,demoTasks);
assert.notEqual(changed.tasks[1],demoTasks[1]);
assert.equal(setTaskCompleted(demoTasks,777,true).ok,false);
assert.equal(JSON.stringify(demoTasks),before);
assert.equal(validateTaskDraft({id:'20',title:'  Изучить localStorage  ',priority:'high'},[]).value.title,'Изучить localStorage');
assert.ok(validateTaskDraft({id:'20',title:'   ',priority:'high'},[]).errors.title);

// Unit check of serialization. This in-memory adapter is not a browser-reload check.
const memory=new Map();
const storage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)};
const tasks=[...demoTasks,{id:20,title:'Изучить localStorage',priority:'high',completed:false}];
assert.equal(saveTasks(storage,'tip-js-practice-04:demo',tasks).ok,true);
assert.equal(JSON.parse(memory.get('tip-js-practice-04:demo')).version,1);
assert.deepEqual(loadTasks(storage,'tip-js-practice-04:demo',[]).tasks,tasks);
console.log('OK: прогресс, отбор, неизменность, валидация, сериализация хранения');

// Start the practice-06 API before running this part.
const api=createTaskApi(createApiClient({baseUrl:'http://127.0.0.1:5505/api'}));
await api.resetDemoData();
const filtered=await api.getTasks({completed:false,priority:'high'});
assert.deepEqual(filtered.tasks.map(t=>t.id),[4,13,34]);
assert.equal(filtered.meta.total,3);
try { await api.getTaskById(999); assert.fail('Ожидалась 404'); }
catch(error) { assert.equal(error.kind,'http'); assert.equal(error.status,404); }
const updated=await api.setTaskCompleted(4,true);
assert.equal(updated.completed,true);
const pending=await api.getTasks({completed:false});
assert.deepEqual(pending.tasks.map(t=>t.id),[7,13,19,22,28,34]);
console.log('OK: GET с фильтрами, обработка 404, PATCH /tasks/4 -> GET completed=false');
console.log('Незавершённые id после PATCH:',pending.tasks.map(t=>t.id));
await api.resetDemoData();
