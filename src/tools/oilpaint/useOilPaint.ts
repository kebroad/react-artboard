import { useCallback, useRef } from "react";
import { Point } from "../../utils/pointUtils";
import { ToolHandlers } from "../../components/Artboard";
import { circleCursor } from "../../utils/cursors";
import tinycolor from "tinycolor2";

export interface UseOilPaintProps {
  color?: string;
  strokeWidth?: number;
  blending?: number;
}

export function useOilPaint({
  color = "#8B4513",
  strokeWidth = 25,
  blending = 0.6,
}: UseOilPaintProps): ToolHandlers {
  const lastPoint = useRef<Point>();

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.globalAlpha = 0.8;
      context.strokeStyle = color;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.globalCompositeOperation = "source-over";
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

      // Create multiple brush strokes with slight variations
      const brushStrokes = 5;
      for (let i = 0; i < brushStrokes; i++) {
        context.beginPath();
        
        // Vary the color slightly for each stroke
        const baseColor = tinycolor(color);
        const variation = (Math.random() - 0.5) * 20;
        const variedColor = baseColor.lighten(variation).toString();
        
        context.strokeStyle = variedColor;
        context.lineWidth = strokeWidth + (Math.random() - 0.5) * 4;
        
        // Add random offset for texture
        const offsetX = (Math.random() - 0.5) * strokeWidth * 0.3;
        const offsetY = (Math.random() - 0.5) * strokeWidth * 0.3;
        
        context.moveTo(
          lastPoint.current[0] + offsetX,
          lastPoint.current[1] + offsetY
        );
        context.lineTo(point[0] + offsetX, point[1] + offsetY);
        
        // Use different blend modes for some strokes
        if (i > 2) {
          context.globalCompositeOperation = "multiply";
          context.globalAlpha = blending * 0.5;
        } else {
          context.globalCompositeOperation = "source-over";
          context.globalAlpha = 0.8;
        }
        
        context.stroke();
      }

      lastPoint.current = point;
    },
    [color, strokeWidth, blending]
  );

  const endStroke = useCallback((context: CanvasRenderingContext2D) => {
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
  }, []);

  const cursor = circleCursor(strokeWidth);

  return { name: "Oil Paint", startStroke, continueStroke, endStroke, cursor };
} 