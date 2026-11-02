export function progress(totalTasks, completedTasks) {
  if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)
      || totalTasks < 0 || totalTasks > 1000 || completedTasks < 0 || completedTasks > totalTasks) {
    return "Ошибка: нужны целые числа 0 ≤ completedTasks ≤ totalTasks ≤ 1000";
  }
  if (totalTasks === 0) return "Задач пока нет";
  const remaining = totalTasks - completedTasks;
  const percent = (completedTasks / totalTasks * 100).toFixed(1);
  const status = completedTasks === 0 ? "Не начато" : completedTasks === totalTasks ? "Завершено" : "В работе";
  return `Осталось: ${remaining}; прогресс: ${percent}%; статус: ${status}`;
}
for (const [total, completed] of [[12, 5], [0, 0], [5, 6]]) {
  console.log(`Вход: (${total}, ${completed}) → ${progress(total, completed)}`);
}
