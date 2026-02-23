import {test, expect } from 'playwright/test'; 

test('Interview Test', async ({ page, browser }) => {
    await page.goto('https://www.orangehrm.com/');
    await page.click('text=Login');
    await page.fill('input[name="username"]', 'Admin');
    expect(page.locator('input[name="username"]')).toHaveValue('Admin');

});


test('fdsfsd', async ({ page, browser }) => {
    await page.goto('https://www.orangehrm.com/');
    await page.getByPlaceholder('Username').fill('Admin');
    
});
