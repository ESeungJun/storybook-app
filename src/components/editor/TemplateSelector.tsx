'use client';

import { templates } from '@/lib/fabric/templates';
import { useEditorStore } from '@/stores/editorStore';
import { cn } from '@/lib/utils';
import type { TemplateType } from '@/types';

export default function TemplateSelector() {
  const { pages, currentPageIndex, updatePageTemplate } = useEditorStore();
  const currentTemplate = pages[currentPageIndex]?.templateType || 'full_illustration';

  const handleSelect = (type: TemplateType) => {
    updatePageTemplate(currentPageIndex, type);
  };

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">레이아웃</p>
      <div className="grid grid-cols-5 gap-1">
        {templates.map((template) => (
          <button
            key={template.type}
            onClick={() => handleSelect(template.type)}
            className={cn(
              'aspect-[3/4] border-2 rounded p-0.5 transition-colors',
              currentTemplate === template.type
                ? 'border-primary-500'
                : 'border-gray-200 hover:border-gray-400'
            )}
            title={template.label}
          >
            <TemplatePreview zones={template.zones} />
          </button>
        ))}
      </div>
    </div>
  );
}

function TemplatePreview({ zones }: { zones: { type: string; x: number; y: number; width: number; height: number }[] }) {
  return (
    <svg viewBox="0 0 900 1200" className="w-full h-full">
      {zones.map((zone, i) => (
        <rect
          key={i}
          x={zone.x}
          y={zone.y}
          width={zone.width}
          height={zone.height}
          fill={zone.type === 'illustration' ? '#dbeafe' : '#fef3c7'}
          stroke="#e5e7eb"
          strokeWidth={4}
        />
      ))}
    </svg>
  );
}
