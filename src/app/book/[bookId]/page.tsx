'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Canvas } from 'fabric';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/fabric/setup';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

interface PageData {
  id: string;
  page_order: number;
  canvas_data: Record<string, unknown>;
  template_type: string;
}

interface BookData {
  id: string;
  title: string;
  profiles: { name: string };
  pages: PageData[];
}

export default function BookViewerPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<BookData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    const loadBook = async () => {
      const res = await fetch(`/api/books/${bookId}`);
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setBook(data);
    };
    loadBook();
  }, [bookId, router]);

  // 페이지 이미지 렌더링
  useEffect(() => {
    if (!book || !book.pages.length) {
      setLoading(false);
      return;
    }

    const renderPages = async () => {
      const images: string[] = [];

      for (const page of book.pages) {
        const canvasEl = document.createElement('canvas');
        canvasEl.width = CANVAS_WIDTH;
        canvasEl.height = CANVAS_HEIGHT;

        const fabricCanvas = new Canvas(canvasEl, {
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          backgroundColor: '#ffffff',
          renderOnAddRemove: false,
        });

        if (page.canvas_data && Object.keys(page.canvas_data).length > 0) {
          await fabricCanvas.loadFromJSON(page.canvas_data);
          fabricCanvas.renderAll();
        }

        images.push(canvasEl.toDataURL('image/png'));
        fabricCanvas.dispose();
      }

      setPageImages(images);
      setLoading(false);
    };

    renderPages();
  }, [book]);

  const goToPage = (index: number) => {
    if (index < 0 || index >= pageImages.length) return;
    setDirection(index > currentPage ? 'right' : 'left');
    setCurrentPage(index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Spinner className="h-8 w-8 text-primary-600" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">그림책을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 책 정보 */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
        <p className="text-gray-500 mt-1">{book.profiles?.name || '알 수 없음'}</p>
      </div>

      {/* 뷰어 */}
      <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto">
        {pageImages.length > 0 ? (
          <>
            <div className="aspect-[3/4] overflow-hidden">
              <img
                key={currentPage}
                src={pageImages[currentPage]}
                alt={`${currentPage + 1}페이지`}
                className={`w-full h-full object-contain ${
                  direction === 'right' ? 'slide-in-right' : direction === 'left' ? 'slide-in-left' : ''
                }`}
              />
            </div>

            {/* 네비게이션 */}
            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center disabled:opacity-0 transition-opacity"
              >
                ‹
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === pageImages.length - 1}
                className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center disabled:opacity-0 transition-opacity"
              >
                ›
              </button>
            </div>

            {/* 페이지 인디케이터 */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
              {pageImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentPage ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="aspect-[3/4] flex items-center justify-center text-gray-400">
            페이지가 없습니다.
          </div>
        )}
      </div>

      {/* 페이지 번호 */}
      <p className="text-center text-sm text-gray-400 mt-4">
        {currentPage + 1} / {pageImages.length}
      </p>

      {/* 뒤로가기 */}
      <div className="text-center mt-6">
        <Button variant="secondary" onClick={() => router.push('/')}>
          갤러리로 돌아가기
        </Button>
      </div>
    </div>
  );
}
