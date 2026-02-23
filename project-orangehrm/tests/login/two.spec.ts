import {test as base} from 'playwright/test';

const test = base.extend<{baseUrl: string}>({
    
    // You can add fixtures here if needed
    baseUrl: async ({}, use) => {

        const url = process.env.TEST_ENV === "stage" ? "https://stage.example.com" : "https://qa.example.com";
        await use(url);
    }
});



