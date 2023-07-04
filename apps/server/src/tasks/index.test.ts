import { readdirSync } from 'fs';
import { resolve } from 'path';
import tasks from '.';

// Checks we've added the task to the index, to help us not forget to add it
test.each(
  readdirSync(__dirname).filter((f) => f !== 'index.ts' && !f.endsWith('.test.ts')).map((f) => [f]),
)('%s is exported', async (f) => {
  // eslint-disable-next-line
  const task = require(resolve(__dirname, f)).default
  if (!tasks.find((t) => t.id === task.id)) {
    throw new Error(`Task in file ${f} with id ${task.id} is not exported`);
  }
});

test('tasks have unique ids', () => {
  const s = new Set();
  tasks.forEach((t) => {
    if (s.has(t.id)) {
      throw new Error(`Duplicate task id: ${t.id}. You should generate a new ulid for your task.`);
    }
    s.add(t.id);
  });
});
