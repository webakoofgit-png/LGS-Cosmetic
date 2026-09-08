import { spawn } from "child_process";

const commands = [
  {
    name: "frontend",
    command: "npm",
    args: ["run", "dev:frontend"],
  },
  {
    name: "backend",
    command: "npm",
    args: ["run", "dev:backend"],
  },
];

const children = commands.map(({ name, command, args }) => {
  const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], shell: true });
  child.stdout.on("data", (data) => process.stdout.write(`[${name}] ${data}`));
  child.stderr.on("data", (data) => process.stderr.write(`[${name}] ${data}`));
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      process.exitCode = code;
    }
  });
  return child;
});

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
