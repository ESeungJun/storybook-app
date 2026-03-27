import { Canvas } from 'fabric';

export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 1200;

export function initCanvas(canvasElement: HTMLCanvasElement): Canvas {
  const canvas = new Canvas(canvasElement, {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: '#ffffff',
    isDrawingMode: false,
    selection: true,
    preserveObjectStacking: true,
  });

  return canvas;
}

export function getCanvasScale(containerWidth: number, containerHeight: number): number {
  const scaleX = containerWidth / CANVAS_WIDTH;
  const scaleY = containerHeight / CANVAS_HEIGHT;
  return Math.min(scaleX, scaleY, 1);
}
