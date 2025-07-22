import { useCallback, useRef } from "react";
import { Point } from "../../utils/pointUtils";
import { ToolHandlers } from "../../components/Artboard";
import { circleCursor } from "../../utils/cursors";

export interface UseInkPenProps {
  color?: string;
  strokeWidth?: number;
  flow?: number;
}

export function useInkPen({
  color = "#000080",
  strokeWidth = 4,
  flow = 0.9,
}: UseInkPenProps): ToolHandlers {
  const lastPoint = useRef<Point>();
  const pressure = useRef<number>(1);

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.globalAlpha = flow;
      context.strokeStyle = color;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.shadowColor = color;
      context.shadowBlur = 1;
      lastPoint.current = point;
      pressure.current = 0.5;
    },
    [color, flow]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      if (!lastPoint.current) {
        lastPoint.current = point;
        return;
      }

      // Simulate pressure based on speed
      const dx = point[0] - lastPoint.current[0];
      const dy = point[1] - lastPoint.current[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Smooth pressure changes
      const targetPressure = Math.max(0.3, Math.min(1, 1 - distance * 0.01));
      pressure.current = pressure.current * 0.7 + targetPressure * 0.3;

      const currentWidth = strokeWidth * pressure.current;

      context.beginPath();
      context.lineWidth = currentWidth;
      
      // Use quadratic curves for smoother lines
      const midX = (lastPoint.current[0] + point[0]) / 2;
      const midY = (lastPoint.current[1] + point[1]) / 2;
      
      context.moveTo(lastPoint.current[0], lastPoint.current[1]);
      context.quadraticCurveTo(lastPoint.current[0], lastPoint.current[1], midX, midY);
      context.stroke();

      lastPoint.current = point;
    },
    [strokeWidth]
  );

  const endStroke = useCallback((context: CanvasRenderingContext2D) => {
    context.globalAlpha = 1;
    context.shadowBlur = 0;
  }, []);

  const cursor = circleCursor(strokeWidth);

  return { name: "Ink Pen", startStroke, continueStroke, endStroke, cursor };
} 