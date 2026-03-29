'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

export default function Header() {
  const { user, profile, isLoading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-primary-600">
          우리들의 그림책
        </Link>

        <nav className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
          ) : user ? (
            <>
              {profile?.role === 'teacher' ? (
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5"
                >
                  대시보드
                </Link>
              ) : (
                <Link
                  href="/my-books"
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5"
                >
                  내 작품함
                </Link>
              )}
              {profile?.name && (
                <span className="text-sm text-gray-500 hidden sm:inline">
                  {profile.name}
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={signOut}>
                로그아웃
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">로그인</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
