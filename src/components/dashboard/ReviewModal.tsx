'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { BookWithAuthor } from '@/types';

interface ReviewModalProps {
  book: BookWithAuthor | null;
  isOpen: boolean;
  onClose: () => void;
  onReview: (bookId: string, action: 'approve' | 'reject', comment?: string) => Promise<void>;
}

export default function ReviewModal({ book, isOpen, onClose, onReview }: ReviewModalProps) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!book) return null;

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true);
    await onReview(book.id, action, action === 'reject' ? comment : undefined);
    setLoading(false);
    setComment('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="작품 검토">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">제목</p>
          <p className="font-semibold">{book.title}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">작성자</p>
          <p>{book.profiles?.name || '알 수 없음'}</p>
        </div>

        {book.cover_image_url && (
          <div className="border rounded-lg overflow-hidden">
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-full h-48 object-contain bg-gray-50"
            />
          </div>
        )}

        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(`/book/${book.id}`, '_blank')}
            className="w-full"
          >
            전체 내용 보기
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            코멘트 (반려 시 필수)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded-lg p-3 text-sm resize-none"
            rows={3}
            placeholder="학생에게 전달할 코멘트를 작성하세요"
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="flex-1"
          >
            승인
          </Button>
          <Button
            variant="danger"
            onClick={() => handleAction('reject')}
            disabled={loading || !comment.trim()}
            className="flex-1"
          >
            반려
          </Button>
        </div>
      </div>
    </Modal>
  );
}
