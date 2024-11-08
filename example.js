import { generateMood } from "./controllers/openaicontroller";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Mood: \n", (mood) => generateMood(mood));
