import { createApiClient } from "../practice-05/src/api-client.js";
import { createTaskApi } from "../practice-05/src/task-api.js";
const client = createApiClient({ baseUrl: "http://127.0.0.1:5505/api" });
const api = createTaskApi(client);
print('GET http://127.0.0.1:5505/api/tasks?completed=false&priority=high');
const result = await api.getTasks({ completed: false, priority: "high" });
print("id:", result.tasks.map(t => t.id));
print("meta.total:", result.meta.total);
print("Задачи:", result.tasks);