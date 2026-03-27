import { Canvas, PencilBrush } from 'fabric';
import type { BrushType } from '@/types';

interface BrushConfig {
  width: number;
  color: string;
  opacity: number;
}

const defaultConfigs: Record<BrushType, Partial<BrushConfig>> = {
  pen: { width: 3, opacity: 1 },
  pencil: { width: 2, opacity: 0.7 },
  marker: { width: 20, opacity: 0.4 },
  eraser: { width: 20, opacity: 1 },
};

export function configureBrush(
  canvas: Canvas,
  brushType: BrushType,
  color: string,
  size: number
) {
  const brush = new PencilBrush(canvas);
  const config = defaultConfigs[brushType];

  brush.width = size || config.width || 3;

  if (brushType === 'eraser') {
    brush.color = '#ffffff';
  } else {
    brush.color = color;
  }

  if (brushType === 'pencil') {
    brush.decimate = 2;
  } else if (brushType === 'marker') {
    brush.decimate = 4;
  }

  canvas.freeDrawingBrush = brush;
  canvas.isDrawingMode = true;
}
