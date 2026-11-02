import { demoTasks } from "../practice-02/src/data.js";
import { getPendingTasks } from "../practice-02/src/task-service.js";
print("getPendingTasks(demoTasks), id:", getPendingTasks(demoTasks).map(t => t.id));
print("getPendingTasks([]):", getPendingTasks([]));
print("Исходный demoTasks:", demoTasks);