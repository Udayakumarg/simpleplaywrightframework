# 🚀 Simple Playwright Framework

A modular, TypeScript‑based Playwright automation framework designed for  
**data‑driven testing**, **environment configuration management**, and **scenario‑based execution**.

## 🏗️ Architecture

- 📦 **Monorepo with npm workspaces**
  - `framework` → Core reusable modules (fixtures, loaders, utilities).
  - `project-orangehrm` → Example project consuming the framework.

- 🧩 **Fixtures (`test.extend`)**
  - `envConfigFixture` → Injects environment config (`environments.json`) into tests.
  - `dataFixture` → Loads test data dynamically based on environment and test file.

- ⚙️ **Loaders**
  - `data.loader.ts` → Resolves environment‑specific JSON test data.
  - `envConfig.loader.ts` → Strongly typed environment configuration loader.
  - `scenario.loader.ts` → Enables scenario‑driven test execution from JSON arrays/objects.

## 🔄 Scenario‑Driven Tests (Technical)

- JSON defines login scenarios (`login.scenarios.json`).  
- Tests iterate over scenarios using `test.describe.parallel`, enabling concurrent execution.  
- Supports multiple environments (`dev`, `qa`, `prod`) with environment‑specific data.

### 🗣️ In Simple Words
Instead of writing 10 login tests, you just list usernames/passwords in a JSON file.  
The framework loops through them and runs each automatically.  
Adding new cases = editing data, not writing new code.

---

## 🛠️ Commands (Technical)

```bash
# 📥 Install dependencies
npm install

# 🏗️ Build framework
npm run build:framework

# 🧪 Run tests in project-orangehrm
npm run test

# 📊 Show HTML report
npm run report
