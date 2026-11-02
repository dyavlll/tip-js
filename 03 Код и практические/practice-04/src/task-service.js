const validId = id => Number.isSafeInteger(id) && id > 0;
const validTitle = title => typeof title === "string" && title.trim().length >= 1 && title.trim().length <= 100;
const priorities = new Set(["low", "medium", "high"]);
const fail = error => ({ ok: false, error });
export function createTask(id, title, priority = "medium") {
  if (!validId(id)) return fail("Некорректный id");
  if (!validTitle(title)) return fail("Название должно содержать от 1 до 100 символов");
  if (!priorities.has(priority)) return fail("Некорректный приоритет");
  return { ok: true, task: { id, title: title.trim(), completed: false, priority } };
}
export const findTaskById = (tasks, id) => tasks.find(task => task.id === id);
export const getPendingTasks = tasks => tasks.filter(task => task.completed === false);
export const getTaskTitles = tasks => tasks.map(task => task.title);
export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed === true).length;
  return { total, completed, pending: total - completed, progress: total === 0 ? 0 : completed / total * 100 };
}
export function addTask(tasks, id, title, priority = "medium") {
  if (!Array.isArray(tasks)) return fail("Ожидается массив задач");
  const result = createTask(id, title, priority);
  if (!result.ok) return result;
  if (findTaskById(tasks, id)) return fail("Этот id уже существует");
  return { ok: true, tasks: [...tasks, result.task] };
}
export function setTaskCompleted(tasks, id, completed) {
  if (!Array.isArray(tasks)) return fail("Ожидается массив задач");
  if (!validId(id)) return fail("id должен быть положительным безопасным целым числом");
  if (typeof completed !== "boolean") return fail("completed должен быть true или false");
  if (!findTaskById(tasks, id)) return fail("Задача не найдена");
  return { ok: true, tasks: tasks.map(task => task.id === id ? { ...task, completed } : task) };
}
export function updateTask(tasks, id, title, priority) {
  const changes = { title, priority };
  if (!Array.isArray(tasks) || !validId(id)) return fail("Некорректные аргументы");
  if (!findTaskById(tasks, id)) return fail("Задача не найдена");
  if (!changes || !validTitle(changes.title) || !priorities.has(changes.priority)) return fail("Некорректные поля");
  return { ok: true, tasks: tasks.map(task => task.id === id ? { ...task, title: changes.title.trim(), priority: changes.priority } : task) };
}
export function renameTask(tasks, id, title) {
  if (!Array.isArray(tasks) || !validId(id) || !validTitle(title)) return fail("Некорректные аргументы");
  if (!findTaskById(tasks, id)) return fail("Задача не найдена");
  return { ok: true, tasks: tasks.map(task => task.id === id ? { ...task, title: title.trim() } : task) };
}
export function removeTask(tasks, id) {
  if (!Array.isArray(tasks) || !validId(id)) return fail("Некорректные аргументы");
  if (!findTaskById(tasks, id)) return fail("Задача не найдена");
  return { ok: true, tasks: tasks.filter(task => task.id !== id) };
}
