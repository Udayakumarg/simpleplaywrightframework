import { test as base } from "@playwright/test";

export const test = base.extend<{ TestData: { userName: string, password: string }}>({

    TestData: async({}, use)=>{
        const creds = { userName: "Interview", password: "success" } 

        await use(creds);
    }

});

