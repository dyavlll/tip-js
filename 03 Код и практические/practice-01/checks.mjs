import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';

const read = name => readFile(new URL(`./js/${name}.js`, import.meta.url),'utf8');
function run(source, values = {}) {
  for (const [key,value] of Object.entries(values)) {
    const literal=typeof value==='number' && Number.isNaN(value) ? 'NaN' : JSON.stringify(value);
    source=source.replace(new RegExp(`const ${key} = [^;]+;`),`const ${key} = ${literal};`);
  }
  const lines=[];
  vm.runInNewContext(source,{console:{log:(...args)=>lines.push(args.join(' '))}},{timeout:1000});
  return lines.join('\n');
}
const progressSource=await read('progress');
const planSource=await read('plan');
const lines=['# ПР1 — проверка варианта 3','', 'Среда: Node.js VM. Значения подставляются только в объявления входов; исходные файлы сохраняют вариант 3.', '', '| Вход | Ожидание до запуска | Фактический вывод | Итог |','|---|---|---|---|'];
const progressCases=[
 [12,5,'Осталось: 7\nПрогресс: 41.7%\nСтатус: В работе'],
 [0,0,'Задач пока нет'],[5,0,'Прогресс: 0.0%\nСтатус: Не начато'],
 [5,5,'Прогресс: 100.0%\nСтатус: Завершено'],
 [5,6,'Ошибка:'],[-1,0,'Ошибка:'],[5,2.5,'Ошибка:'],['5',2,'Ошибка:'],[1001,0,'Ошибка:'],[NaN,0,'Ошибка:'],
 [9,9,'Прогресс: 100.0%\nСтатус: Завершено'],
];
let count=0;
for (const [totalTasks,completedTasks,expected] of progressCases) {
  const actual=run(progressSource,{totalTasks,completedTasks});
  assert.ok(actual.includes(expected),actual);
  if(expected==='Ошибка:') assert.ok(!actual.includes('Прогресс:'));
  lines.push(`| progress(${String(totalTasks)}, ${String(completedTasks)}) | ${expected.replaceAll('\n','; ')} | ${actual.replaceAll('\n','; ')} | OK |`);count++;
}
for(const [totalTasks,completedTasks,dailyLimit,days,last] of [
 [12,5,3,3,'День 3: выполнено 1, осталось 0'],[10,4,3,2,'День 2: выполнено 3, осталось 0'],
 [5,3,10,1,'День 1: выполнено 2, осталось 0'],[5,5,2,0,'Все задачи уже выполнены'],[0,0,2,0,'Все задачи уже выполнены'],
 [5,2,0,null,'Ошибка:'],[5,2,1.5,null,'Ошибка:'],[5,6,2,null,'Ошибка:'],[5,2,'2',null,'Ошибка:'],[5,2,1001,null,'Ошибка:'],
 [9,9,3,0,'Все задачи уже выполнены'],[0,0,0,null,'Ошибка:'],
]) {
 const actual=run(planSource,{totalTasks,completedTasks,dailyLimit});
 assert.ok(actual.includes(last),actual);
 if(days!==null) assert.ok(actual.includes(`Потребуется дней: ${days}`));
 else assert.ok(!actual.includes('День '));
 lines.push(`| plan(${totalTasks}, ${completedTasks}, ${JSON.stringify(dailyLimit)}) | ${days===null?'Ошибка без цикла':`${days} дней; ${last}`} | ${actual.replaceAll('\n','; ')} | OK |`);count++;
}
assert.equal(run(await read('debug')),'Выполнено: 5\nОсталось: 3\nКонтрольная сумма: 10');count++;
const types=run(await read('types'));lines.push('', '## Типы — фактический вывод', '', '```text',types,'```');
assert.ok(types.includes('NaN number'));assert.ok(types.includes('object string'));count+=2;
lines.push('',`Итог: ${count} проверок, 0 ошибок.`);
await mkdir(new URL('../Протоколы/',import.meta.url),{recursive:true});
await writeFile(new URL('../Протоколы/pr01-checks.md',import.meta.url),lines.join('\n'));
console.log(lines.join('\n'));
