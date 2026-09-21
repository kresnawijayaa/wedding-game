import { expect, test } from "@playwright/test";

test("foundation invitation remains accessible before the game loads", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Wedding Quest/);
  await expect(page.getByRole("main")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: /Sebuah awal untuk kisah yang bisa dijelajahi/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Lewati ke isi utama" })).toHaveAttribute(
    "href",
    "#main-content",
  );
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("liveness endpoint remains available without infrastructure", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(await response.json()).toEqual({ status: "ok" });
});
