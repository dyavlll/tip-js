import assert from 'node:assert/strict';
import { createApiClient } from './src/api-client.js';
import { createTaskApi } from './src/task-api.js';
const baseUrl='http://127.0.0.1:5505/api';
const client=createApiClient({baseUrl});
const api=createTaskApi(client);
console.log('Исследование Response');
for(const path of ['/health','/tasks','/tasks?completed=false&priority=high','/tasks/25','/tasks/999','/categories']) {
 const response=await fetch(baseUrl+path);
 const body=await response.json();
 console.log(JSON.stringify({path,status:response.status,ok:response.ok,contentType:response.headers.get('content-type'),shape:Array.isArray(body.data)?'data[]':body.error?'error{}':'data{}'}));
}
for(let i=0;i<3;i++) {
 let time=performance.now();
 await client.requestJson('/debug/delay',{query:{ms:80}});
 await client.requestJson('/debug/delay',{query:{ms:80}});
 const sequential=performance.now()-time;
 time=performance.now();
 await Promise.all([client.requestJson('/debug/delay',{query:{ms:80}}),client.requestJson('/debug/delay',{query:{ms:80}})]);
 console.log(`Замер ${i+1}: последовательно ${sequential.toFixed(1)} мс; Promise.all ${(performance.now()-time).toFixed(1)} мс`);
}
try { await client.requestJson('/debug/delay',{query:{ms:150},timeoutMs:20});assert.fail('Нет тайм-аута'); }
catch(error){assert.equal(error.kind,'timeout');console.log('Тайм-аут:',error.kind);}
const abort=new AbortController();
const pending=client.requestJson('/debug/delay',{query:{ms:150},timeoutMs:1000,signal:abort.signal});
abort.abort();
try{await pending;assert.fail('Нет отмены');}catch(error){assert.equal(error.kind,'aborted');console.log('Внешняя отмена:',error.kind);}
const own=await api.getTasks({priority:'high',completed:true,categoryId:2});
assert.deepEqual(own.tasks.map(t=>t.id),[16,25]);
console.log('Собственные фильтры high + completed=true + categoryId=2:',own.tasks.map(t=>t.id));
try{await client.requestJson('/tasks',{query:{categoryId:-1}});assert.fail('Нет 400');}
catch(error){assert.equal(error.kind,'http');assert.equal(error.status,400);console.log('Неверная категория: http 400');}
const immediate=new AbortController();immediate.abort();
try{await client.requestJson('/tasks',{signal:immediate.signal});assert.fail('Нет отмены');}
catch(error){assert.equal(error.kind,'aborted');console.log('Отмена до запроса: aborted');}
const variant=await api.getTasks({priority:'high'});
assert.deepEqual(variant.tasks.map(t=>t.id),[4,13,16,25,34]);
console.log('Вариант 3:',variant.tasks.map(t=>t.id),'meta.total:',variant.meta.total);
