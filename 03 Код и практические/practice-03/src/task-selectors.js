export function getVisibleTasks(tasks, filter = "all") {
  return filter === "pending" ? tasks.filter(t => t.completed === false)
    : filter === "completed" ? tasks.filter(t => t.completed === true) : [...tasks];
}
