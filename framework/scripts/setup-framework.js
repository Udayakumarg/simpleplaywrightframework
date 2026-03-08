#!/usr/bin/env node
import fs from "fs";
import path from "path";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question, defaultValue) {
  return new Promise(resolve => {
    rl.question(`${question} (${defaultValue}): `, answer => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function main() {
  console.log("🚀 Init Sample Playwright Project");

  const projectName = await ask("Project name", "sample-project");
  const includeAuth = await ask("Include auth example? yes/no", "yes");
  const includeData = await ask("Include data example? yes/no", "yes");

  rl.close();

  const projectDir = path.join(process.cwd(), projectName);
  fs.mkdirSync(projectDir, { recursive: true });

  // Config
  fs.mkdirSync(path.join(projectDir, "config"), { recursive: true });
  fs.writeFileSync(
    path.join(projectDir, "config", "environments.json"),
    JSON.stringify({ qa: { baseUrl: "http://localhost:3000" } }, null, 2)
  );

  // Tests
  fs.mkdirSync(path.join(projectDir, "tests", "ui"), { recursive: true });
  fs.writeFileSync(
    path.join(projectDir, "tests", "ui", "login.spec.ts"),
    `import { test, expect } from '@playwright/test';

test('login example', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page).toHaveTitle(/Login/);
});`
  );

  if (includeAuth.toLowerCase() === "yes") {
    fs.mkdirSync(path.join(projectDir, "auth"), { recursive: true });
    fs.writeFileSync(
      path.join(projectDir, "auth", "index.ts"),
      `export const creds = { username: "testuser", password: "testpass" };`
    );
  }

  if (includeData.toLowerCase() === "yes") {
    fs.mkdirSync(path.join(projectDir, "data", "ui"), { recursive: true });
    fs.writeFileSync(
      path.join(projectDir, "data", "ui", "sample.txt"),
      "Sample test data"
    );
  }

  console.log(`✅ Sample project created in ${projectDir}`);
  console.log(`👉 Next steps:\n   cd ${projectName}\n   npx playwright test`);
}

main();
