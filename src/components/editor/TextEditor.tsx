'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

interface TextEditorProps {
  onAddText: (text: string, options: TextOptions) => void;
}

export interface TextOptions {
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: 'normal' | 'bold';
}

const FONTS = [
  { label: '기본', value: 'sans-serif' },
  { label: '명조', value: 'serif' },
  { label: '고딕', value: 'Pretendard, sans-serif' },
  { label: '손글씨', value: 'cursive' },
];

export default function TextEditor({ onAddText }: TextEditorProps) {
  const [text, setText] = useState('텍스트를 입력하세요');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [fill, setFill] = useState('#000000');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');

  const handleAdd = () => {
    onAddText(text, { fontSize, fontFamily, fill, fontWeight });
  };

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border rounded-lg p-2 text-sm resize-none"
        rows={2}
      />

      <div className="flex gap-2 items-center">
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="border rounded px-2 py-1 text-sm flex-1"
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <input
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          min={12}
          max={120}
          className="border rounded px-2 py-1 text-sm w-16"
        />
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={fill}
          onChange={(e) => setFill(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0"
        />
        <button
          onClick={() => setFontWeight(fontWeight === 'normal' ? 'bold' : 'normal')}
          className={`px-3 py-1 text-sm rounded border ${fontWeight === 'bold' ? 'bg-gray-200 font-bold' : ''}`}
        >
          B
        </button>
      </div>

      <Button size="sm" onClick={handleAdd} className="w-full">
        텍스트 추가
      </Button>
    </div>
  );
}
