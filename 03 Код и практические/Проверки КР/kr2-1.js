import { validateTaskDraft } from "../practice-04/src/form-validation.js";
const tasks = [];
for (const title of ["  Изучить localStorage  ", "   "]) {
  const draft = { id: "20", title, priority: "high" };
  print("Вход:", draft);
  print("Результат:", validateTaskDraft(draft, tasks));
}