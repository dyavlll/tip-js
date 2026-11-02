import { progress } from "../practice-01/progress.js";
for (const [total, completed] of [[12, 5], [0, 0], [5, 6]]) print(`Вход: (${total}, ${completed})\n${progress(total, completed)}\n`);