import { useCallback, useRef } from "react";
import { Point } from "../../utils/pointUtils";
import { ToolHandlers } from "../../components/Artboard";
import { circleCursor } from "../../utils/cursors";

export interface UseCalligraphyProps {
  color?: string;
  strokeWidth?: number;
  angle?: number;
}

export function useCalligraphy({
  color = "#000000",
  strokeWidth = 20,
  angle = 45,
}: UseCalligraphyProps): ToolHandlers {
  const lastPoint = useRef<Point>();
  const lastTime = useRef<number>();

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.strokeStyle = color;
      context.lineCap = "round";
      context.lineJoin = "round";
      lastPoint.current = point;
      lastTime.current = Date.now();
    },
    [color]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      if (!lastPoint.current || !lastTime.current) {
        lastPoint.current = point;
        lastTime.current = Date.now();
        return;
      }

      const currentTime = Date.now();
      const timeDelta = Math.max(currentTime - lastTime.current, 1);
      
      // Calculate speed and direction
      const dx = point[0] - lastPoint.current[0];
      const dy = point[1] - lastPoint.current[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      const speed = distance / timeDelta;
      
      // Calculate stroke angle relative to pen angle
      const strokeAngle = Math.atan2(dy, dx);
      const angleDiff = Math.abs(strokeAngle - (angle * Math.PI / 180));
      const normalizedAngle = Math.min(angleDiff, Math.PI - angleDiff);
      
      // Vary width based on angle and speed
      const angleMultiplier = Math.sin(normalizedAngle) * 0.8 + 0.2;
      const speedMultiplier = Math.max(0.3, 1 - speed * 0.02);
      const currentWidth = strokeWidth * angleMultiplier * speedMultiplier;

      context.beginPath();
      context.lineWidth = currentWidth;
      context.moveTo(lastPoint.current[0], lastPoint.current[1]);
      context.lineTo(point[0], point[1]);
      context.stroke();

      lastPoint.current = point;
      lastTime.current = currentTime;
    },
    [strokeWidth, angle]
  );

  const cursor = circleCursor(strokeWidth);

  return { name: "Calligraphy", startStroke, continueStroke, cursor };
} 