import { test } from "@project/fixtures";

test("upload and download demo", async ({ page, fileUtils }) => {
  await page.goto("https://the-internet.herokuapp.com/upload");
  await fileUtils.uploadFile("#file-upload", "resources/fileuploads/abc.txt");
  await page.click("#file-submit");

  await page.goto("https://the-internet.herokuapp.com/download");
  const downloadedPath = await fileUtils.downloadFile("a[href*='some-file.txt']");
  console.log("Downloaded:", downloadedPath);
});
