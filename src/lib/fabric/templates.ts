import type { TemplateDefinition } from '@/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './setup';

const W = CANVAS_WIDTH;
const H = CANVAS_HEIGHT;

export const templates: TemplateDefinition[] = [
  {
    type: 'full_illustration',
    label: '전면 그림',
    zones: [
      { type: 'illustration', x: 0, y: 0, width: W, height: H },
    ],
  },
  {
    type: 'illustration_top',
    label: '그림 위 / 텍스트 아래',
    zones: [
      { type: 'illustration', x: 0, y: 0, width: W, height: H * 0.7 },
      { type: 'text', x: 0, y: H * 0.7, width: W, height: H * 0.3 },
    ],
  },
  {
    type: 'illustration_bottom',
    label: '텍스트 위 / 그림 아래',
    zones: [
      { type: 'text', x: 0, y: 0, width: W, height: H * 0.3 },
      { type: 'illustration', x: 0, y: H * 0.3, width: W, height: H * 0.7 },
    ],
  },
  {
    type: 'illustration_left',
    label: '좌 그림 / 우 텍스트',
    zones: [
      { type: 'illustration', x: 0, y: 0, width: W * 0.5, height: H },
      { type: 'text', x: W * 0.5, y: 0, width: W * 0.5, height: H },
    ],
  },
  {
    type: 'full_text',
    label: '전면 텍스트',
    zones: [
      { type: 'text', x: 0, y: 0, width: W, height: H },
    ],
  },
];

export function getTemplate(type: string): TemplateDefinition {
  return templates.find((t) => t.type === type) || templates[0];
}
