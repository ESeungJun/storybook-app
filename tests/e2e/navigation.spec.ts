import { test, expect } from '@playwright/test';

test.describe('페이지 내비게이션', () => {
  test('/login 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
  });

  test('/register 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
  });

  test('인증 없이 /my-books 접근 시 로그인 페이지로 리다이렉트된다', async ({ page }) => {
    await page.goto('/my-books');
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('인증 없이 /dashboard 접근 시 로그인 페이지로 리다이렉트된다', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
