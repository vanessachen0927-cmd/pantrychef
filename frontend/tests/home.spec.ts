import {test,expect} from "@playwright/test";
test("homepage has recipe search",async({page})=>{await page.goto("/");await expect(page.getByText("Turn your pantry into")).toBeVisible();await expect(page.getByPlaceholder("pasta, salad...")).toBeVisible()});
