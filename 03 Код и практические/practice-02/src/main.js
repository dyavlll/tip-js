import { demoTasks, variantTasks, variantNumber } from "./data.js";
import { addTask, setTaskCompleted, renameTask, removeTask,
  getTaskTitles, getPendingTasks, getTaskStats } from "./task-service.js";
function show(label, tasks) {
  const stats = getTaskStats(tasks);
  console.log(label, JSON.stringify({
    ids: tasks.map(t => t.id), ...stats,
    progressText: stats.total ? stats.progress.toFixed(1) + "%" : "Задач пока нет"
  }));
}
function scenario(label, source, extraId, extraTitle, extraPriority,
  toggleId, renameId, renamedTitle, deleteId) {
  console.log(label);
  const snapshot = JSON.stringify(source);
  let current = source;
  console.log("Исходные задачи:", JSON.stringify(source));
  console.log("Названия:", getTaskTitles(source));
  console.log("Невыполненные:", getPendingTasks(source).map(t => t.id));
  show("Исходный набор", current);
  for (const [name, operation] of [
    ["Добавление", tasks => addTask(tasks, extraId, extraTitle, extraPriority)],
    ["Выполнение", tasks => setTaskCompleted(tasks, toggleId, true)],
    ["Переименование", tasks => renameTask(tasks, renameId, renamedTitle)],
    ["Удаление", tasks => removeTask(tasks, deleteId)],
    ["Повторный id", tasks => addTask(tasks, extraId, "Дубликат", extraPriority)],
  ]) {
    const result = operation(current);
    if (result.ok) current = result.tasks;
    else console.log("Обработанный отказ:", result.error);
    show(name, current);
  }
  console.log("Итоговые задачи:", JSON.stringify(current));
  console.log("Исходный массив сохранён:", snapshot === JSON.stringify(source));
}
scenario("Общий сценарий", demoTasks, 20, "Добавить проверку", "high",
  4, 10, "Подготовить инструкцию запуска", 7);
scenario(`Индивидуальный вариант ${variantNumber}`, variantTasks,
  80, "Проверить доступность портфолио", "low", 11, 23,
  "Уточнить макет главной страницы", 37);
