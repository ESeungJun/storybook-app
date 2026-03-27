'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import ReviewModal from '@/components/dashboard/ReviewModal';
import { formatDate, statusLabel, statusColor } from '@/lib/utils';
import type { BookWithAuthor } from '@/types';

export default function DashboardPage() {
  return (
    <AuthGuard allowedRoles={['teacher']}>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const [books, setBooks] = useState<BookWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<BookWithAuthor | null>(null);
  const [filter, setFilter] = useState<string>('submitted');

  const fetchBooks = async () => {
    const res = await fetch('/api/books');
    const data = await res.json();
    setBooks(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleReview = async (bookId: string, action: 'approve' | 'reject', comment?: string) => {
    await fetch(`/api/books/${bookId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, comment }),
    });
    fetchBooks();
  };

  const filteredBooks = books.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="h-8 w-8 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">선생님 대시보드</h1>

      {/* 필터 */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'submitted', label: '제출됨' },
          { value: 'approved', label: '승인됨' },
          { value: 'rejected', label: '반려됨' },
          { value: 'all', label: '전체' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
            <span className="ml-1 text-xs">
              ({books.filter((b) => f.value === 'all' ? true : b.status === f.value).length})
            </span>
          </button>
        ))}
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          해당하는 작품이 없습니다.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedBook(book)}
            >
              <div className="w-14 h-18 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-18 flex items-center justify-center text-gray-300 text-xl">
                    📖
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                <p className="text-sm text-gray-500">
                  {book.profiles?.name || '알 수 없음'} · {formatDate(book.updated_at)}
                </p>
              </div>

              <Badge className={statusColor(book.status)}>
                {statusLabel(book.status)}
              </Badge>
            </div>
          ))}
        </div>
      )}

      <ReviewModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onReview={handleReview}
      />
    </div>
  );
}
