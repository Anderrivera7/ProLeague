/**
 * Libera puertos 3000–3002 antes de `npm run dev` (evita servidores Next duplicados).
 */
import { execSync } from "node:child_process";
import { platform } from "node:os";

const PORTS = [3000, 3001, 3002];

function killOnWindows(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (!/LISTENING/i.test(line)) continue;
      const pid = Number.parseInt(line.trim().split(/\s+/).at(-1), 10);
      if (pid > 0) pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`[dev] Puerto ${port}: proceso ${pid} terminado`);
      } catch {
        /* ya cerrado */
      }
    }
  } catch {
    /* puerto libre */
  }
}

function killOnUnix(port) {
  try {
    const out = execSync(`lsof -ti tcp:${port}`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    for (const pid of out.split(/\s+/).filter(Boolean)) {
      try {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
        console.log(`[dev] Puerto ${port}: proceso ${pid} terminado`);
      } catch {
        /* ya cerrado */
      }
    }
  } catch {
    /* puerto libre */
  }
}

const kill = platform() === "win32" ? killOnWindows : killOnUnix;
for (const port of PORTS) kill(port);
