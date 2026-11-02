import { createApiClient } from "../practice-05/src/api-client.js";
import { createTaskApi } from "../practice-05/src/task-api.js";
const api = createTaskApi(createApiClient({ baseUrl: "http://127.0.0.1:5505/api" }));
print("await api.getTaskById(999)");
try { await api.getTaskById(999); }
catch (error) { print("Ошибка обработана в catch:"); print("kind:", error.kind); print("status:", error.status); print("message:", error.message); }