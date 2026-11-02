"use strict";
// Вариант 3: номер в журнале 11.
const totalTasks = 9;
const completedTasks = 9;
if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)
    || totalTasks < 0 || totalTasks > 1000
    || completedTasks < 0 || completedTasks > totalTasks) {
  console.log("Ошибка: нужны целые числа 0 <= completedTasks <= totalTasks <= 1000");
} else if (totalTasks === 0) {
  console.log("Задач пока нет");
} else {
  const remaining = totalTasks - completedTasks;
  const percent = completedTasks / totalTasks * 100;
  const status = completedTasks === 0 ? "Не начато"
    : completedTasks === totalTasks ? "Завершено" : "В работе";
  console.log(`Всего задач: ${totalTasks}`);
  console.log(`Выполнено: ${completedTasks}`);
  console.log(`Осталось: ${remaining}`);
  console.log(`Прогресс: ${percent.toFixed(1)}%`);
  console.log(`Статус: ${status}`);
}
