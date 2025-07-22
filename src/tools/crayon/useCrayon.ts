import { useCallback, useRef } from "react";
import { Point } from "../../utils/pointUtils";
import { ToolHandlers } from "../../components/Artboard";
import { circleCursor } from "../../utils/cursors";

export interface UseCrayonProps {
  color?: string;
  strokeWidth?: number;
  pressure?: number;
}

export function useCrayon({
  color = "#DC143C",
  strokeWidth = 12,
  pressure = 0.6,
}: UseCrayonProps): ToolHandlers {
  const lastPoint = useRef<Point>();

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.globalAlpha = pressure;
      context.strokeStyle = color;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.globalCompositeOperation = "multiply";
      lastPoint.current = point;
    },
    [color, pressure]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      if (!lastPoint.current) {
        lastPoint.current = point;
        return;
      }

      // Create waxy texture with multiple overlapping strokes
      const textureStrokes = 8;
      for (let i = 0; i < textureStrokes; i++) {
        context.beginPath();
        
        // Random positioning for texture
        const offsetRadius = strokeWidth * 0.4;
        const angle = (i / textureStrokes) * Math.PI * 2;
        const offsetX = Math.cos(angle) * offsetRadius * Math.random();
        const offsetY = Math.sin(angle) * offsetRadius * Math.random();
        
        // Vary the stroke width for texture
        context.lineWidth = Math.max(1, strokeWidth * (0.3 + Math.random() * 0.7));
        
        // Vary opacity for buildup effect
        context.globalAlpha = pressure * (0.2 + Math.random() * 0.6);
        
        context.moveTo(
          lastPoint.current[0] + offsetX,
          lastPoint.current[1] + offsetY
        );
        context.lineTo(point[0] + offsetX, point[1] + offsetY);
        context.stroke();
      }

      lastPoint.current = point;
    },
    [strokeWidth, pressure]
  );

  const endStroke = useCallback((context: CanvasRenderingContext2D) => {
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
  }, []);

  const cursor = circleCursor(strokeWidth);

  return { name: "Crayon", startStroke, continueStroke, endStroke, cursor };
} 