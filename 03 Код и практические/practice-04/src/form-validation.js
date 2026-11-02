export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const title = typeof draft?.title === "string" ? draft.title.trim() : "";
  if (typeof draft?.title !== "string" || title.length < 1 || title.length > 100) {
    errors.title = "Название должно содержать от 1 до 100 символов после удаления краевых пробелов.";
  }
  const id = editingId ?? (typeof draft?.id === "string" && /^\d+$/.test(draft.id.trim()) ? Number(draft.id) : draft?.id);
  if (!Number.isSafeInteger(id) || id <= 0) errors.id = "Введите положительный целый id.";
  else if (editingId === null && tasks.some(t => t.id === id)) errors.id = "Этот id уже существует.";
  else if (editingId !== null && !tasks.some(t => t.id === editingId)) errors.id = "Задача не найдена.";
  if (!["low", "medium", "high"].includes(draft?.priority)) errors.priority = "Выберите приоритет.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { id, title, priority: draft.priority } };
}
