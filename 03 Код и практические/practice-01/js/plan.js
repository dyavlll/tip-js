"use strict";
const totalTasks = 9;
const completedTasks = 9;
const dailyLimit = 3;
if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)
    || totalTasks < 0 || totalTasks > 1000
    || completedTasks < 0 || completedTasks > totalTasks
    || !Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1000) {
  console.log("Ошибка: некорректное количество задач или дневная норма");
} else {
  let remaining = totalTasks - completedTasks;
  let days = 0;
  console.log(`Осталось задач: ${remaining}`);
  if (remaining === 0) console.log("Все задачи уже выполнены");
  while (remaining > 0) {
    days += 1;
    const doneToday = Math.min(dailyLimit, remaining);
    remaining -= doneToday;
    console.log(`День ${days}: выполнено ${doneToday}, осталось ${remaining}`);
  }
  console.log(`Потребуется дней: ${days}`);
}
