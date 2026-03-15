import { Page } from "@playwright/test";
import fs from "fs";
import path from "path";

export class FileUtils {
  constructor(private page: Page) {}

  // Upload a file by setting input[type=file]
  async uploadFile(selector: string, filePath: string) {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`❌ File not found: ${absolutePath}`);
    }
    await this.page.setInputFiles(selector, absolutePath);
    console.log(`✅ Uploaded file: ${absolutePath}`);
  }

  // Download a file triggered by clicking a link/button
  async downloadFile(selector: string, downloadDir: string = "downloads") {
    const downloadPromise = this.page.waitForEvent("download");
    await this.page.click(selector);
    const download = await downloadPromise;

    const filePath = path.join(downloadDir, await download.suggestedFilename());
    await download.saveAs(filePath);
    console.log(`✅ File downloaded to: ${filePath}`);
    return filePath;
  }
}