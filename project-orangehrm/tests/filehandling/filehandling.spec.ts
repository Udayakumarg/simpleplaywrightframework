import { test } from "@framework/fixtures";

test("upload and download demo", async ({ page, fileUtils }) => {
  await page.goto("https://the-internet.herokuapp.com/upload");
  await fileUtils.uploadFile("#file-upload", "project-orangehrm/data/ui/sample.txt");
  await page.click("#file-submit");

  await page.goto("https://the-internet.herokuapp.com/download");
  const downloadedPath = await fileUtils.downloadFile("a[href*='some-file.txt']");
  console.log("Downloaded file path:", downloadedPath);
});
