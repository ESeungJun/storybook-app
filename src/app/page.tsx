'use client';

import { useEffect, useState } from 'react';
import BookCard from '@/components/gallery/BookCard';
import Spinner from '@/components/ui/Spinner';
import type { BookWithAuthor } from '@/types';

export default function GalleryPage() {
  const [books, setBooks] = useState<BookWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await fetch('/api/books?status=approved');
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    fetchBooks();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">우리들의 그림책</h1>
        <p className="text-gray-500">학생들이 직접 만든 아름다운 그림책을 감상하세요</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner className="h-8 w-8 text-primary-600" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">📚</p>
          <p className="text-gray-500">아직 전시된 그림책이 없습니다</p>
          <p className="text-sm text-gray-400 mt-2">선생님의 승인을 기다리고 있어요</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
