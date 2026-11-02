export function validateTaskDraft(draft, categories) {
  const errors = {};
  const title = typeof draft?.title === "string" ? draft.title.trim() : "";
  const categoryId = Number(draft?.categoryId);
  if (!title || title.length > 100) errors.title = "Введите название от 1 до 100 символов.";
  if (!["low", "medium", "high"].includes(draft?.priority)) errors.priority = "Выберите приоритет.";
  if (!Number.isSafeInteger(categoryId) || !categories.some(c => c.id === categoryId)) errors.categoryId = "Выберите категорию.";
  return { valid: Object.keys(errors).length === 0, value: { title, priority: draft?.priority, categoryId }, errors };
}
