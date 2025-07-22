import { useCallback, useRef } from "react";
import { Point } from "../../utils/pointUtils";
import { ToolHandlers } from "../../components/Artboard";
import { circleCursor } from "../../utils/cursors";

export interface UseSmudgeProps {
  strokeWidth?: number;
  strength?: number;
}

export function useSmudge({
  strokeWidth = 30,
  strength = 0.8,
}: UseSmudgeProps): ToolHandlers {
  const lastPoint = useRef<Point>();
  const canvas = useRef<HTMLCanvasElement>();
  const sourceImageData = useRef<ImageData>();

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      lastPoint.current = point;
      canvas.current = context.canvas;
      
      // Capture the area around the starting point
      const radius = strokeWidth;
      const x = Math.max(0, point[0] - radius);
      const y = Math.max(0, point[1] - radius);
      const width = Math.min(canvas.current.width - x, radius * 2);
      const height = Math.min(canvas.current.height - y, radius * 2);
      
      if (width > 0 && height > 0) {
        sourceImageData.current = context.getImageData(x, y, width, height);
      }
    },
    [strokeWidth]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      if (!lastPoint.current || !sourceImageData.current || !canvas.current) {
        lastPoint.current = point;
        return;
      }

      const dx = point[0] - lastPoint.current[0];
      const dy = point[1] - lastPoint.current[1];
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 2) return; // Avoid too many small movements

      // Create a temporary canvas for the smudge effect
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');
      if (!tempContext) return;

      tempCanvas.width = strokeWidth * 2;
      tempCanvas.height = strokeWidth * 2;

      // Draw the source image data
      tempContext.putImageData(sourceImageData.current, 0, 0);

      // Apply the smudge by stretching the image
      const stretchFactor = Math.min(distance * 0.1, strokeWidth * 0.5);
      
      context.globalAlpha = strength;
      context.globalCompositeOperation = "source-over";
      
      // Draw multiple stretched versions for smooth blending
      for (let i = 0; i < 5; i++) {
        const factor = (i + 1) / 5;
        const offsetX = dx * factor * 0.3;
        const offsetY = dy * factor * 0.3;
        
        context.drawImage(
          tempCanvas,
          point[0] - strokeWidth + offsetX,
          point[1] - strokeWidth + offsetY,
          strokeWidth * 2,
          strokeWidth * 2
        );
      }

      // Update source image data for next stroke
      const radius = strokeWidth;
      const x = Math.max(0, point[0] - radius);
      const y = Math.max(0, point[1] - radius);
      const width = Math.min(canvas.current.width - x, radius * 2);
      const height = Math.min(canvas.current.height - y, radius * 2);
      
      if (width > 0 && height > 0) {
        sourceImageData.current = context.getImageData(x, y, width, height);
      }

      lastPoint.current = point;
    },
    [strokeWidth, strength]
  );

  const endStroke = useCallback((context: CanvasRenderingContext2D) => {
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
  }, []);

  const cursor = circleCursor(strokeWidth);

  return { name: "Smudge", startStroke, continueStroke, endStroke, cursor };
} 