import { useCallback, useRef } from "react";
import { Point } from "../../utils/pointUtils";
import { ToolHandlers } from "../../components/Artboard";
import { circleCursor } from "../../utils/cursors";

export interface UseAcrylicProps {
  color?: string;
  strokeWidth?: number;
  opacity?: number;
}

export function useAcrylic({
  color = "#FF6B35",
  strokeWidth = 20,
  opacity = 0.9,
}: UseAcrylicProps): ToolHandlers {
  const lastPoint = useRef<Point>();

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      context.globalAlpha = opacity;
      context.strokeStyle = color;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.globalCompositeOperation = "source-over";
      lastPoint.current = point;
    },
    [color, opacity]
  );

  const continueStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      if (!lastPoint.current) {
        lastPoint.current = point;
        return;
      }

      // Create a solid, vibrant stroke with slight texture
      context.beginPath();
      context.lineWidth = strokeWidth;
      
      // Add slight texture variation
      const textureVariation = (Math.random() - 0.5) * 2;
      context.lineWidth = Math.max(1, strokeWidth + textureVariation);
      
      // Use bezier curves for smoother application
      const controlPoint1X = lastPoint.current[0] + (point[0] - lastPoint.current[0]) * 0.3;
      const controlPoint1Y = lastPoint.current[1] + (point[1] - lastPoint.current[1]) * 0.3;
      const controlPoint2X = lastPoint.current[0] + (point[0] - lastPoint.current[0]) * 0.7;
      const controlPoint2Y = lastPoint.current[1] + (point[1] - lastPoint.current[1]) * 0.7;
      
      context.moveTo(lastPoint.current[0], lastPoint.current[1]);
      context.bezierCurveTo(
        controlPoint1X, controlPoint1Y,
        controlPoint2X, controlPoint2Y,
        point[0], point[1]
      );
      context.stroke();

      // Add some paint buildup effect
      if (Math.random() > 0.8) {
        context.beginPath();
        context.globalAlpha = opacity * 0.3;
        context.lineWidth = strokeWidth * 0.6;
        context.moveTo(lastPoint.current[0], lastPoint.current[1]);
        context.lineTo(point[0], point[1]);
        context.stroke();
        context.globalAlpha = opacity;
      }

      lastPoint.current = point;
    },
    [strokeWidth, opacity]
  );

  const endStroke = useCallback((context: CanvasRenderingContext2D) => {
    context.globalAlpha = 1;
  }, []);

  const cursor = circleCursor(strokeWidth);

  return { name: "Acrylic", startStroke, continueStroke, endStroke, cursor };
} 