export const STORAGE_VERSION = 1;
const clone = tasks => tasks.map(task => ({ ...task }));
export function isValidTaskList(value) {
  return Array.isArray(value) && value.every(t => t && Number.isSafeInteger(t.id) && t.id > 0
    && typeof t.title === "string" && t.title.trim().length >= 1 && t.title.trim().length <= 100
    && typeof t.completed === "boolean" && ["low", "medium", "high"].includes(t.priority))
    && new Set(value.map(t => t.id)).size === value.length;
}
export function loadTasks(storage, key, fallbackTasks) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return { ok: true, source: "initial", tasks: clone(fallbackTasks) };
    const saved = JSON.parse(raw);
    if (saved?.version !== STORAGE_VERSION || !isValidTaskList(saved.tasks)) throw new Error("Неверный формат сохранённых данных");
    return { ok: true, source: "storage", tasks: clone(saved.tasks) };
  } catch (error) {
    return { ok: false, source: "fallback", tasks: clone(fallbackTasks), error: `Ошибка чтения: ${error.message}` };
  }
}
export function saveTasks(storage, key, tasks) {
  try {
    if (!isValidTaskList(tasks)) throw new Error("Некорректные задачи");
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) { return { ok: false, error: `Ошибка сохранения: ${error.message}` }; }
}
export function removeSavedTasks(storage, key) {
  try { storage.removeItem(key); return { ok: true }; }
  catch (error) { return { ok: false, error: `Ошибка удаления: ${error.message}` }; }
}
