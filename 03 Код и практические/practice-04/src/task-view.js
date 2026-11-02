import { getTaskStats } from "./task-service.js";
export function createTaskElement(task, category) {
  const li = document.createElement("li");
  li.className = "task-card" + (task.completed ? " is-completed" : "");
  li.dataset.taskId = String(task.id);
  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;
  const meta = document.createElement("p");
  meta.className = "task-meta";
  const idLabel = document.createElement("span");
  idLabel.textContent = `ID: ${task.id} · `;
  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Выполнена" : "В работе";
  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = { low: "Низкий", medium: "Средний", high: "Высокий" }[task.priority];
  meta.append(idLabel, status, " · ", priority);
  if (category) {
    const label = document.createElement("span");
    label.className = "task-category";
    label.textContent = category.name;
    meta.append(" · ", label);
  }
  li.append(title, meta);
  const actions = document.createElement("div");
  actions.className = "task-actions";
  for (const [action, label] of [["toggle", "Выполнена"], ["edit", "Изменить"], ["delete", "Удалить"]]) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action;
    if (action === "toggle") button.setAttribute("aria-pressed", String(task.completed));
    const span = document.createElement("span");
    span.className = "action-label";
    span.textContent = label;
    button.append(span);
    actions.append(button);
  }
  li.append(actions);
  return li;
}
export function renderTaskList(list, tasks, categories = []) {
  list.replaceChildren(...tasks.map(t => createTaskElement(t, categories.find(c => c.id === t.categoryId))));
}
export function renderSummary(element, tasks, visibleCount) {
  const stats = { ...getTaskStats(tasks), visible: visibleCount };
  for (const [key, value] of Object.entries(stats)) {
    const node = element.querySelector(`[data-stat="${key}"]`);
    if (node) node.textContent = key === "progress" ? value.toFixed(1) + "%" : String(value);
  }
}
export function renderEmptyState(element, total, visibleCount) {
  element.hidden = visibleCount !== 0;
  element.textContent = visibleCount > 0 ? "" : total === 0 ? "Список задач пуст." : "Нет задач по выбранному фильтру.";
}
