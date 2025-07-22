import { useCallback } from "react";
import { Point } from "../../utils/pointUtils";
import { ToolHandlers } from "../../components/Artboard";
import { circleCursor } from "../../utils/cursors";

export interface UsePencilProps {
  color?: string;
  strokeWidth?: number;
  opacity?: number;
}

export function usePencil({
  color = "#2c2c2c",
  strokeWidth = 3,
  opacity = 0.8,
}: UsePencilProps): ToolHandlers {
  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.globalAlpha = opacity;
      context.lineWidth = strokeWidth;
      context.strokeStyle = color;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.globalCompositeOperation = "multiply";
      context.moveTo(point[0], point[1]);
      context.beginPath();
    },
    [color, strokeWidth, opacity]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      // Add some texture by varying the line width slightly
      const variation = (Math.random() - 0.5) * 0.5;
      context.lineWidth = strokeWidth + variation;
      context.lineTo(point[0], point[1]);
      context.stroke();
    },
    [strokeWidth]
  );

  const endStroke = useCallback((context: CanvasRenderingContext2D) => {
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
  }, []);

  const cursor = circleCursor(strokeWidth);

  return { name: "Pencil", startStroke, continueStroke, endStroke, cursor };
} 