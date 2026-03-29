'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import AuthGuard from '@/components/layout/AuthGuard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatDate, statusLabel, statusColor } from '@/lib/utils';
import type { BookWithAuthor } from '@/types';

export default function MyBooksPage() {
  return (
    <AuthGuard allowedRoles={['student']}>
      <MyBooksContent />
    </AuthGuard>
  );
}

function MyBooksContent() {
  const [books, setBooks] = useState<BookWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const fetchBooks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/books?authorId=${user.id}`);
    const data = await res.json();
    setBooks(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const createBook = async () => {
    setCreating(true);
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '새 그림책' }),
    });
    const book = await res.json();
    if (book.id) {
      router.push(`/editor/${book.id}`);
    }
    setCreating(false);
  };

  const deleteBook = async (bookId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
    fetchBooks();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="h-8 w-8 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">내 작품함</h1>
        <Button onClick={createBook} disabled={creating}>
          {creating ? '생성 중...' : '+ 새 그림책'}
        </Button>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">아직 만든 그림책이 없어요</p>
          <Button onClick={createBook} disabled={creating}>
            첫 그림책 만들기
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              {/* 표지 썸네일 */}
              <div className="w-16 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                    📖
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{formatDate(book.updated_at)}</p>
                {book.status === 'rejected' && book.teacher_comment && (
                  <p className="text-sm text-red-600 mt-1 truncate">
                    선생님: {book.teacher_comment}
                  </p>
                )}
              </div>

              {/* 상태 + 액션 */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge className={statusColor(book.status)}>
                  {statusLabel(book.status)}
                </Badge>

                {(book.status === 'draft' || book.status === 'rejected') && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/editor/${book.id}`)}
                  >
                    편집
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/book/${book.id}`)}
                >
                  미리보기
                </Button>

                {book.status === 'draft' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBook(book.id)}
                  >
                    삭제
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
