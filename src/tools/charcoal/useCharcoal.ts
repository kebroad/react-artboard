import { useCallback, useRef } from "react";
import { Point } from "../../utils/pointUtils";
import { ToolHandlers } from "../../components/Artboard";
import { circleCursor } from "../../utils/cursors";

export interface UseCharcoalProps {
  color?: string;
  strokeWidth?: number;
  roughness?: number;
}

export function useCharcoal({
  color = "#1a1a1a",
  strokeWidth = 15,
  roughness = 0.7,
}: UseCharcoalProps): ToolHandlers {
  const lastPoint = useRef<Point>();

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.globalAlpha = 0.6;
      context.strokeStyle = color;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.globalCompositeOperation = "multiply";
      lastPoint.current = point;
    },
    [color]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      if (!lastPoint.current) {
        lastPoint.current = point;
        return;
      }

      // Create multiple strokes for texture
      const bristleCount = Math.floor(strokeWidth / 3);
      for (let i = 0; i < bristleCount; i++) {
        context.beginPath();
        
        // Random offset for each bristle
        const offsetX = (Math.random() - 0.5) * strokeWidth * roughness;
        const offsetY = (Math.random() - 0.5) * strokeWidth * roughness;
        
        // Vary line width for each bristle
        context.lineWidth = Math.random() * 3 + 1;
        
        context.moveTo(
          lastPoint.current[0] + offsetX,
          lastPoint.current[1] + offsetY
        );
        context.lineTo(point[0] + offsetX, point[1] + offsetY);
        context.stroke();
      }

      lastPoint.current = point;
    },
    [strokeWidth, roughness]
  );

  const endStroke = useCallback((context: CanvasRenderingContext2D) => {
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
  }, []);

  const cursor = circleCursor(strokeWidth);

  return { name: "Charcoal", startStroke, continueStroke, endStroke, cursor };
} 