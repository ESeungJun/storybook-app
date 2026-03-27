'use client';

import { useRef, useState } from 'react';
import Button from '@/components/ui/Button';

interface ImageUploaderProps {
  onImageAdd: (url: string) => void;
}

export default function ImageUploader({ onImageAdd }: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        onImageAdd(data.url);
      }
    } catch {
      alert('이미지 업로드에 실패했습니다.');
    }
    setUploading(false);

    // 파일 입력 초기화
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        {uploading ? '업로드 중...' : '이미지 추가'}
      </Button>
    </div>
  );
}
