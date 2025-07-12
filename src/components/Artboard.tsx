import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";

import { History } from "../history";

import {
  getMousePoint,
  getTouchPoint,
  mouseButtonIsDown,
  Point,
} from "../utils/pointUtils";

export interface ArtboardProps
  extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  tool: ToolHandlers;
  history?: History;
  onStartStroke?: (point: Point) => void;
  onContinueStroke?: (point: Point) => void;
  onEndStroke?: () => void;
}

export interface ArtboardRef {
  download: (filename?: string, type?: string) => void;
  getImageAsDataUri: (type?: string) => string | undefined;
  clear: () => void;
  context?: CanvasRenderingContext2D | null;
}

export interface ToolHandlers {
  name: string;
  startStroke?: (point: Point, context: CanvasRenderingContext2D) => void;
  continueStroke?: (point: Point, context: CanvasRenderingContext2D) => void;
  endStroke?: (context: CanvasRenderingContext2D) => void;
  cursor?: string;
}

export const Artboard = forwardRef(function Artboard(
  {
    tool,
    style,
    history,
    onStartStroke,
    onContinueStroke,
    onEndStroke,
    ...props
  }: ArtboardProps,
  ref: ForwardedRef<ArtboardRef>
) {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>();
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [drawing, setDrawing] = useState(false);

  const startStroke = useCallback(
    (point: Point) => {
      if (!context) {
        return;
      }
      context.save();
      setDrawing(true);
      tool.startStroke?.(point, context);
      onStartStroke?.(point);
    },
    [tool, context, onStartStroke]
  );

  const continueStroke = useCallback(
    (newPoint: Point) => {
      if (!context) {
        return;
      }
      tool.continueStroke?.(newPoint, context);
      onContinueStroke?.(newPoint);
    },
    [tool, context, onContinueStroke]
  );

  const endStroke = useCallback(() => {
    setDrawing(false);
    if (context) {
      tool.endStroke?.(context);
      onEndStroke?.();
      context.restore();
      if (canvas && history) {
        history.pushState(canvas);
      }
    }
  }, [tool, context, canvas, history, onEndStroke]);

  const mouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (!drawing) {
        return;
      }
      continueStroke(getMousePoint(event));
    },
    [continueStroke, drawing]
  );

  const touchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!drawing) {
        return;
      }
      continueStroke(getTouchPoint(event));
    },
    [continueStroke, drawing]
  );

  const mouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (drawing) {
        return;
      }
      event.preventDefault();
      startStroke(getMousePoint(event));
    },
    [drawing, startStroke]
  );

  const touchStart = useCallback(
    (event: React.TouchEvent) => {
      if (drawing) {
        return;
      }
      startStroke(getTouchPoint(event));
    },
    [drawing, startStroke]
  );

  const clear = useCallback(() => {
    if (!context || !canvas) {
      return;
    }
    context.save();
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
    if (canvas && history) {
      history.pushState(canvas);
    }
  }, [context, canvas, history]);

  const gotRef = useCallback(
    (canvasRef: HTMLCanvasElement) => {
      if (!canvasRef) {
        return;
      }
      canvasRef.width = canvasRef.offsetWidth;
      canvasRef.height = canvasRef.offsetHeight;
      const ctx = canvasRef.getContext("2d");
      setCanvas(canvasRef);
      setContext(ctx);
      if (!ctx) {
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
      ctx.fillStyle = "transparent";
      if (history) {
        history.setContext(ctx);
        history.pushState(canvasRef);
      }
    },
    [history]
  );

  const mouseEnter = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      // If mouse button is down but we're not drawing, start a new stroke
      if (mouseButtonIsDown(event.buttons) && !drawing) {
        mouseDown(event);
      }
    },
    [drawing, mouseDown]
  );

  const mouseLeave = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      // Don't end the stroke when leaving the canvas - let the global mouse handlers manage this
      // This allows continuous drawing when moving outside and back into the canvas
    },
    []
  );

  // Add global mouse event listeners for better drawing experience
  useEffect(() => {
    if (!drawing || !canvas) {
      return;
    }

    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (!drawing) {
        return;
      }
      
      const rect = canvas.getBoundingClientRect();
      const point: Point = [
        event.clientX - rect.left,
        event.clientY - rect.top
      ];
      
      // Only process global mouse events when outside the canvas bounds
      // This prevents double processing when drawing inside the canvas
      const isOutsideCanvas = point[0] < 0 || point[0] > canvas.width || 
                              point[1] < 0 || point[1] > canvas.height;
      
      if (isOutsideCanvas && 
          point[0] >= -50 && point[0] <= canvas.width + 50 && 
          point[1] >= -50 && point[1] <= canvas.height + 50) {
        continueStroke(point);
      }
    };

    const handleGlobalMouseUp = () => {
      if (drawing) {
        endStroke();
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [drawing, canvas, continueStroke, endStroke]);

  useImperativeHandle(
    ref,
    () => ({
      download: (filename = "image.png", type?: string) => {
        if (!canvas) {
          return;
        }
        const a = document.createElement("a");
        a.href = canvas.toDataURL(type);
        a.download = filename;
        a.click();
      },
      clear,
      getImageAsDataUri: (type?: string) => canvas?.toDataURL(type),
      context,
    }),
    [canvas, context, clear]
  );

  return (
    <canvas
      style={{ cursor: tool?.cursor, touchAction: "none", ...style }}
      onTouchStart={touchStart}
      onMouseDown={mouseDown}
      onMouseEnter={mouseEnter}
      onMouseMove={drawing ? mouseMove : undefined}
      onTouchMove={drawing ? touchMove : undefined}
      onMouseUp={endStroke}
      onMouseOut={mouseLeave}
      onTouchEnd={endStroke}
      ref={gotRef}
      {...props}
    />
  );
});
