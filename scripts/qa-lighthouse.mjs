import { spawn } from "node:child_process";
import lighthouse from "lighthouse";
import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", "5178"],
  {
    env: {
      ...process.env,
      SUPABASE_URL: "",
      SUPABASE_ANON_KEY: "",
      NEXT_PUBLIC_SITE_URL: "http://localhost:5178",
    },
    stdio: "ignore",
  },
);
let chrome;
try {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch("http://localhost:5178")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  chrome = await chromium.launch({ args: ["--remote-debugging-port=9222"] });
  const result = await lighthouse("http://localhost:5178", {
    port: 9222,
    output: ["json", "html"],
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  });
  await fs.writeFile("artifacts/model2/lighthouse.json", result.report[0]);
  await fs.writeFile("artifacts/model2/lighthouse.html", result.report[1]);
  console.log(
    JSON.stringify(
      Object.fromEntries(
        Object.entries(result.lhr.categories).map(([name, c]) => [
          name,
          Math.round(c.score * 100),
        ]),
      ),
    ),
  );
  console.log(
    JSON.stringify(
      Object.values(result.lhr.audits)
        .filter((a) => a.score !== null && a.score < 1)
        .map((a) => ({ id: a.id, title: a.title, score: a.score })),
      null,
      2,
    ),
  );
} finally {
  await chrome?.close();
  server.kill();
}
