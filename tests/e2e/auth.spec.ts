import { test, expect } from '@playwright/test';

test.describe('로그인 페이지', () => {
  test('로그인 폼이 표시된다', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
    await expect(page.getByLabel('이메일')).toBeVisible();
    await expect(page.getByLabel('비밀번호')).toBeVisible();
    // 폼 내의 제출 버튼 (type=submit)
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('회원가입 링크가 있다', async ({ page }) => {
    await page.goto('/login');
    // 폼 내의 회원가입 링크 (하단의 텍스트 링크)
    await expect(page.getByRole('main').getByRole('link', { name: '회원가입' })).toBeVisible();
  });

  test('빈 폼 제출 시 페이지가 유지된다', async ({ page }) => {
    await page.goto('/login');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('잘못된 이메일/비밀번호로 로그인 시 오류 메시지가 표시된다', async ({ page }) => {
    // Supabase signIn 요청을 인터셉트해서 빠르게 실패 응답 반환
    await page.route('**/auth/v1/token**', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials' }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('이메일').fill('wrong@example.com');
    await page.getByLabel('비밀번호').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeVisible({
      timeout: 10000,
    });
  });

  test('회원가입 링크 클릭 시 회원가입 페이지로 이동한다', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('main').getByRole('link', { name: '회원가입' }).click();
    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe('회원가입 페이지', () => {
  test('회원가입 폼이 표시된다', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
    await expect(page.getByLabel('이름')).toBeVisible();
    await expect(page.getByLabel('이메일')).toBeVisible();
    await expect(page.getByLabel('비밀번호')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('학생/선생님 역할 선택이 표시된다', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('radio', { name: '학생' })).toBeVisible();
    await expect(page.getByRole('radio', { name: '선생님' })).toBeVisible();
  });

  test('기본 역할은 학생이다', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('radio', { name: '학생' })).toBeChecked();
  });

  test('선생님 선택 시 교사 인증 코드 입력란이 나타난다', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('radio', { name: '선생님' }).click();
    await expect(page.getByLabel('교사 인증 코드')).toBeVisible({ timeout: 3000 });
  });

  test('짧은 비밀번호 입력 시 오류 메시지가 표시된다', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('이름').fill('테스트');
    await page.getByLabel('이메일').fill('test@example.com');
    await page.getByLabel('비밀번호').fill('123');
    // HTML minLength 속성 제거 후 폼 제출
    await page.getByLabel('비밀번호').evaluate((el: HTMLInputElement) => {
      el.removeAttribute('minlength');
    });
    await page.locator('button[type="submit"]').click();
    await expect(page.getByText('비밀번호는 6자 이상이어야 합니다.')).toBeVisible();
  });

  test('잘못된 교사 인증 코드 입력 시 오류 메시지가 표시된다', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('이름').fill('선생님');
    await page.getByLabel('이메일').fill('teacher@example.com');
    await page.getByLabel('비밀번호').fill('password123');
    await page.getByRole('radio', { name: '선생님' }).click();
    await expect(page.getByLabel('교사 인증 코드')).toBeVisible({ timeout: 3000 });
    await page.getByLabel('교사 인증 코드').fill('WRONGCODE');
    await page.locator('button[type="submit"]').click();
    await expect(page.getByText('교사 인증 코드가 올바르지 않습니다.')).toBeVisible();
  });

  test('로그인 링크 클릭 시 로그인 페이지로 이동한다', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('main').getByRole('link', { name: '로그인' }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
