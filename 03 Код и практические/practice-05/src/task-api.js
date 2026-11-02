import { ApiError } from "./api-client.js";
const priorities = new Set(["low", "medium", "high"]);
const validId = id => Number.isSafeInteger(id) && id > 0;
export const isTask = t => Boolean(t && validId(t.id) && typeof t.title === "string"
  && t.title.trim().length >= 1 && t.title.trim().length <= 100
  && typeof t.completed === "boolean" && priorities.has(t.priority) && validId(t.categoryId));
export const isCategory = c => Boolean(c && validId(c.id) && typeof c.name === "string" && c.name.trim().length >= 1 && c.name.trim().length <= 100);
function invalid(message = "Неверный формат ответа API") { return new ApiError(message, { kind: "invalid-response" }); }
function unique(items, test) { return Array.isArray(items) && items.every(test) && new Set(items.map(t => t.id)).size === items.length; }
function normalizeFilters(filters) {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) throw new TypeError("Нужен объект фильтров");
  const query = {};
  for (const [key, value] of Object.entries(filters)) {
    if (!["completed", "priority", "categoryId", "q"].includes(key)) throw new TypeError("Неизвестный фильтр");
    if (value === undefined || value === null || value === "") continue;
    if (key === "completed" && typeof value !== "boolean") throw new TypeError("completed должен быть boolean");
    if (key === "priority" && !priorities.has(value)) throw new TypeError("Неверный приоритет");
    if (key === "categoryId" && !validId(value)) throw new TypeError("Неверная категория");
    if (key === "q" && (typeof value !== "string" || value.trim().length > 100)) throw new TypeError("Неверная строка поиска");
    query[key] = key === "q" ? value.trim() : value;
  }
  return query;
}
export function createTaskApi(client) {
  if (typeof client?.requestJson !== "function") throw new TypeError("Нужен HTTP-клиент");
  const api = {
    async getTasks(filters = {}, { signal } = {}) {
      const query = normalizeFilters(filters);
      const payload = await client.requestJson("/tasks", { query, ...(signal ? { signal } : {}) });
      if (!unique(payload?.data, isTask) || !Number.isSafeInteger(payload?.meta?.total)
          || payload.meta.total < 0 || payload.meta.total !== payload.data.length) throw invalid();
      return { tasks: payload.data, meta: payload.meta };
    },
    async getTaskById(id, { signal } = {}) {
      if (!validId(id)) throw new TypeError("Неверный id");
      const payload = await client.requestJson(`/tasks/${id}`, signal ? { signal } : undefined);
      if (!isTask(payload?.data) || payload.data.id !== id) throw invalid();
      return payload.data;
    },
    async getCategories({ signal } = {}) {
      const payload = await client.requestJson("/categories", signal ? { signal } : undefined);
      if (!unique(payload?.data, isCategory)) throw invalid();
      return payload.data;
    },
    async loadInitialData(filters = {}, options = {}) {
      const [result, categories] = await Promise.all([api.getTasks(filters, options), api.getCategories(options)]);
      return { ...result, categories };
    },
    async createTask(draft, { signal } = {}) {
      const payload = await client.requestJson("/tasks", { method: "POST", body: draft, signal });
      if (!isTask(payload?.data)) throw invalid();
      return payload.data;
    },
    async updateTask(id, changes, { signal } = {}) {
      if (!validId(id)) throw new TypeError("Неверный id");
      const payload = await client.requestJson(`/tasks/${id}`, { method: "PATCH", body: changes, signal });
      if (!isTask(payload?.data) || payload.data.id !== id) throw invalid();
      return payload.data;
    },
    async setTaskCompleted(id, value, options = {}) {
      if (typeof value !== "boolean") throw new TypeError("Неверный статус");
      return api.updateTask(id, { completed: value }, options);
    },
    async deleteTask(id, { signal } = {}) {
      if (!validId(id)) throw new TypeError("Неверный id");
      const result = await client.requestJson(`/tasks/${id}`, { method: "DELETE", signal });
      if (result !== null) throw invalid();
      return null;
    },
    async resetDemoData({ signal } = {}) {
      const result = await client.requestJson("/debug/reset", { method: "POST", signal });
      if (result?.data?.reset !== true) throw invalid();
      return result.data;
    },
  };
  return api;
}
