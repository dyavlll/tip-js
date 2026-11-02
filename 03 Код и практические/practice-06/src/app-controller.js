import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}


export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (typeof api?.loadInitialData !== "function" || typeof api?.getTasks !== "function"
      || typeof view?.setListState !== "function") throw new TypeError("Неверные зависимости контроллера");
  let tasks = [], categories = [], filters = {}, editingId = null;
  let active = null, generation = 0, destroyed = false, pending = false, hasCategories = false;
  function cancelEdit() { editingId = null; view.setFormTask(null); view.showFormErrors({}); }
  async function refresh() {
    const ticket = ++generation;
    active?.abort();
    active = new AbortController();
    view.setListState("loading");
    try {
      const options = { signal: active.signal };
      const result = hasCategories ? await api.getTasks(filters, options) : await api.loadInitialData(filters, options);
      if (destroyed || ticket !== generation) return;
      if (result.categories) { categories = result.categories; hasCategories = true; view.setCategories(categories); }
      tasks = result.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(result.meta.total);
      view.setListState(tasks.length ? "ready" : "empty");
    } catch (error) {
      if (destroyed || ticket !== generation || error.kind === "aborted") return;
      view.setListState("error", messageForError(error));
    }
  }
  async function mutate(action) {
    if (pending || destroyed) return;
    pending = true;
    view.setMutationPending(true);
    view.notify("");
    try {
      await action();
      if (destroyed) return;
      view.notify("Изменения сохранены на сервере.", "success");
      await refresh();
    } catch (error) {
      if (!destroyed && error.kind !== "aborted") view.notify(messageForError(error), "error");
    } finally { pending = false; if (!destroyed) view.setMutationPending(false); }
  }
  return {
    async start(initialFilters = {}) { filters = { ...initialFilters }; view.setFilters?.(filters); cancelEdit(); await refresh(); },
    async applyFilters(value) { filters = { ...value }; view.setFilters?.(filters); await refresh(); },
    refresh,
    async toggleTask(id) {
      const task = tasks.find(t => t.id === id);
      if (!task) { view.notify("Задача не найдена.", "error"); return; }
      await mutate(() => api.setTaskCompleted(id, !task.completed));
    },
    async deleteTask(id) { await mutate(async () => { await api.deleteTask(id); if (editingId === id) cancelEdit(); }); },
    beginEdit(id) {
      const task = tasks.find(t => t.id === id);
      if (!task || pending) return;
      editingId = id; view.showFormErrors({}); view.setFormTask(task);
    },
    cancelEdit,
    async submit(draft) {
      const checked = validateDraft(draft, categories);
      view.showFormErrors(checked.errors);
      if (!checked.valid) return;
      await mutate(async () => {
        if (editingId === null) await api.createTask(checked.value);
        else await api.updateTask(editingId, checked.value);
        cancelEdit();
      });
    },
    async resetData() { await mutate(async () => { await api.resetDemoData(); cancelEdit(); }); },
    destroy() { destroyed = true; ++generation; active?.abort(); },
  };
}
