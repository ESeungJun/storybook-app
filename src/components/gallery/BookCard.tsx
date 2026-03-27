import Link from 'next/link';
import type { BookWithAuthor } from '@/types';

export default function BookCard({ book }: { book: BookWithAuthor }) {
  return (
    <Link href={`/book/${book.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
        <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <span className="text-6xl">📖</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 truncate text-sm">{book.title}</h3>
          <p className="text-xs text-gray-500 mt-1">{book.profiles?.name || '알 수 없음'}</p>
        </div>
      </div>
    </Link>
  );
}
