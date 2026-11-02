import assert from 'node:assert/strict';
import { createApiClient } from './src/api-client.js';
import { createTaskApi } from './src/task-api.js';
const api=createTaskApi(createApiClient({baseUrl:'http://127.0.0.1:5505/api'}));
await api.resetDemoData();
try {
 const initial=await api.getTasks({priority:'high'});
 assert.deepEqual(initial.tasks.map(t=>t.id),[4,13,16,25,34]);
 console.log('Вариант 3 до изменения:',initial.tasks.map(t=>t.id));
 const original=await api.getTaskById(4);
 const updated=await api.updateTask(4,{priority:'medium'});
 assert.equal(updated.completed,original.completed);
 const filtered=await api.getTasks({priority:'high'});
 assert.deepEqual(filtered.tasks.map(t=>t.id),[13,16,25,34]);
 console.log('PATCH priority=medium -> GET priority=high:',filtered.tasks.map(t=>t.id));
 const empty=await api.getTasks({q:'__несуществующая_задача__'});assert.equal(empty.meta.total,0);
 console.log('Поиск без совпадений: total=0');
 const fresh=await api.createTask({title:'Проверить портфолио',priority:'high',categoryId:2});
 await api.deleteTask(fresh.id);
 try{await api.getTaskById(fresh.id);assert.fail('Нет 404');}catch(e){assert.equal(e.status,404);}
 console.log('Создание -> удаление -> повторное чтение: http 404');
} finally { await api.resetDemoData(); }
