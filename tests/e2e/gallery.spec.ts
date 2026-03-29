import { test, expect } from '@playwright/test';

test.describe('갤러리 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 갤러리 API를 모킹하여 빈 배열 반환
    await page.route('**/api/books*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
  });

  test('메인 페이지에 제목이 표시된다', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '우리들의 그림책' })).toBeVisible();
  });

  test('갤러리 페이지가 로드되면 빈 상태 메시지가 표시된다', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('아직 전시된 그림책이 없습니다')).toBeVisible({ timeout: 10000 });
  });

  test('헤더 내비게이션이 표시된다', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
  });

  test('로그인 링크로 이동할 수 있다', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: '로그인' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('link', { name: '로그인' }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
