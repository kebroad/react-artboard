import { useCallback, useRef, useState, useEffect } from "react";
import { ToolHandlers } from "../../components/Artboard";
import { Point } from "../../utils/pointUtils";

export interface ImageData {
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  scale: number;
  rotation: number; // in radians
}

export interface UseImageProps {
  onImageImported?: (imageData: ImageData) => void;
}

export function useImage({ onImageImported }: UseImageProps = {}): ToolHandlers {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [dragMode, setDragMode] = useState<'move' | 'resize' | 'rotate' | 'scale' | null>(null);
  const dragStart = useRef<Point>();
  const initialImageState = useRef<ImageData>();
  const onImageImportedRef = useRef(onImageImported);

  // Keep the ref updated
  useEffect(() => {
    onImageImportedRef.current = onImageImported;
  }, [onImageImported]);

  const importImage = useCallback((file: File) => {
    return new Promise<ImageData>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const imageData: ImageData = {
          image: img,
          x: 100,
          y: 100,
          width: Math.min(img.width, 300),
          height: Math.min(img.height, 300),
          originalWidth: img.width,
          originalHeight: img.height,
          scale: 1,
          rotation: 0,
        };
        
        // Maintain aspect ratio
        const aspectRatio = img.width / img.height;
        if (imageData.width / imageData.height > aspectRatio) {
          imageData.width = imageData.height * aspectRatio;
        } else {
          imageData.height = imageData.width / aspectRatio;
        }
        
        setImages(prev => [...prev, imageData]);
        onImageImportedRef.current?.(imageData);
        resolve(imageData);
      };
      img.onerror = reject;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Helper function to get image center
  const getImageCenter = useCallback((imageData: ImageData): Point => {
    return [
      imageData.x + imageData.width / 2,
      imageData.y + imageData.height / 2
    ];
  }, []);

  // Helper function to rotate a point around another point
  const rotatePoint = useCallback((point: Point, center: Point, angle: number): Point => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = point[0] - center[0];
    const dy = point[1] - center[1];
    return [
      center[0] + dx * cos - dy * sin,
      center[1] + dx * sin + dy * cos
    ];
  }, []);

  const drawImages = useCallback((context: CanvasRenderingContext2D) => {
    images.forEach((imageData, index) => {
      context.save();
      
      // Get image center for rotation
      const center = getImageCenter(imageData);
      
      // Apply transformations
      context.translate(center[0], center[1]);
      context.rotate(imageData.rotation);
      context.scale(imageData.scale, imageData.scale);
      
      // Draw image centered at origin
      context.drawImage(
        imageData.image,
        -imageData.width / 2,
        -imageData.height / 2,
        imageData.width,
        imageData.height
      );
      
      context.restore();
      
      // Draw selection handles if this image is selected
      if (selectedImageIndex === index) {
        context.save();
        context.strokeStyle = '#0066ff';
        context.lineWidth = 2;
        context.setLineDash([5, 5]);
        
        // Draw selection rectangle (transformed)
        const corners = [
          [imageData.x, imageData.y],
          [imageData.x + imageData.width, imageData.y],
          [imageData.x + imageData.width, imageData.y + imageData.height],
          [imageData.x, imageData.y + imageData.height]
        ].map(corner => rotatePoint(corner as Point, center, imageData.rotation));
        
        context.beginPath();
        context.moveTo(corners[0][0], corners[0][1]);
        corners.forEach(corner => context.lineTo(corner[0], corner[1]));
        context.closePath();
        context.stroke();
        
        const handleSize = 12;
        context.fillStyle = '#0066ff';
        
        // Resize handle (bottom-right corner)
        const resizeHandle = rotatePoint(
          [imageData.x + imageData.width, imageData.y + imageData.height] as Point,
          center,
          imageData.rotation
        );
        
        // Draw resize handle with border
        context.fillStyle = '#0066ff';
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.fillRect(
          resizeHandle[0] - handleSize / 2,
          resizeHandle[1] - handleSize / 2,
          handleSize,
          handleSize
        );
        context.strokeRect(
          resizeHandle[0] - handleSize / 2,
          resizeHandle[1] - handleSize / 2,
          handleSize,
          handleSize
        );
        
        // Rotation handle (top-center, extended)
        const rotationHandle = rotatePoint(
          [imageData.x + imageData.width / 2, imageData.y - 30] as Point,
          center,
          imageData.rotation
        );
        
        // Draw rotation handle with border for better visibility
        context.fillStyle = '#ff6600';
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.beginPath();
        context.arc(rotationHandle[0], rotationHandle[1], handleSize / 2, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        
        // Add rotation icon/indicator
        context.fillStyle = '#ffffff';
        context.font = '10px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('↻', rotationHandle[0], rotationHandle[1]);
        
        // Draw line from top edge to rotation handle
        const topCenter = rotatePoint(
          [imageData.x + imageData.width / 2, imageData.y] as Point,
          center,
          imageData.rotation
        );
        context.strokeStyle = '#ff6600';
        context.lineWidth = 3;
        context.setLineDash([]);
        context.beginPath();
        context.moveTo(topCenter[0], topCenter[1]);
        context.lineTo(rotationHandle[0], rotationHandle[1]);
        context.stroke();
        
        // Scale handle (bottom-right corner only, same as resize but green)
        context.fillStyle = '#00cc66';
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        const scaleHandleSize = (handleSize * 2) / 3;
        const bottomRightCorner = rotatePoint(
          [imageData.x + imageData.width, imageData.y + imageData.height] as Point,
          center,
          imageData.rotation
        );
        
        // Draw scale handle slightly offset from resize handle
        const scaleHandleOffset = 4;
        context.fillRect(
          bottomRightCorner[0] - scaleHandleSize / 2 - scaleHandleOffset,
          bottomRightCorner[1] - scaleHandleSize / 2 - scaleHandleOffset,
          scaleHandleSize,
          scaleHandleSize
        );
        context.strokeRect(
          bottomRightCorner[0] - scaleHandleSize / 2 - scaleHandleOffset,
          bottomRightCorner[1] - scaleHandleSize / 2 - scaleHandleOffset,
          scaleHandleSize,
          scaleHandleSize
        );
        
        context.restore();
      }
    });
  }, [images, selectedImageIndex, getImageCenter, rotatePoint]);

  const getImageAtPoint = useCallback((point: Point): number | null => {
    for (let i = images.length - 1; i >= 0; i--) {
      const img = images[i];
      const center = getImageCenter(img);
      
      // Transform point to image's local coordinate system
      const localPoint = rotatePoint(point, center, -img.rotation);
      
      // Scale the bounds check
      const scaledWidth = img.width * img.scale;
      const scaledHeight = img.height * img.scale;
      const scaledX = img.x + (img.width - scaledWidth) / 2;
      const scaledY = img.y + (img.height - scaledHeight) / 2;
      
      if (
        localPoint[0] >= scaledX &&
        localPoint[0] <= scaledX + scaledWidth &&
        localPoint[1] >= scaledY &&
        localPoint[1] <= scaledY + scaledHeight
      ) {
        return i;
      }
    }
    return null;
  }, [images, getImageCenter, rotatePoint]);

  const isOnResizeHandle = useCallback((point: Point, imageIndex: number): boolean => {
    if (imageIndex === null || imageIndex >= images.length) return false;
    const img = images[imageIndex];
    const center = getImageCenter(img);
    const handleSize = 12;
    
    const resizeHandle = rotatePoint(
      [img.x + img.width, img.y + img.height] as Point,
      center,
      img.rotation
    );
    
    return (
      point[0] >= resizeHandle[0] - handleSize / 2 &&
      point[0] <= resizeHandle[0] + handleSize / 2 &&
      point[1] >= resizeHandle[1] - handleSize / 2 &&
      point[1] <= resizeHandle[1] + handleSize / 2
    );
  }, [images, getImageCenter, rotatePoint]);

  const isOnRotationHandle = useCallback((point: Point, imageIndex: number): boolean => {
    if (imageIndex === null || imageIndex >= images.length) return false;
    const img = images[imageIndex];
    const center = getImageCenter(img);
    const handleSize = 12;
    
    const rotationHandle = rotatePoint(
      [img.x + img.width / 2, img.y - 30] as Point,
      center,
      img.rotation
    );
    
    const distance = Math.sqrt(
      Math.pow(point[0] - rotationHandle[0], 2) + 
      Math.pow(point[1] - rotationHandle[1], 2)
    );
    
    return distance <= handleSize / 2;
  }, [images, getImageCenter, rotatePoint]);

  const isOnScaleHandle = useCallback((point: Point, imageIndex: number): boolean => {
    if (imageIndex === null || imageIndex >= images.length) return false;
    const img = images[imageIndex];
    const center = getImageCenter(img);
    const handleSize = 12;
    const scaleHandleSize = (handleSize * 2) / 3;
    const scaleHandleOffset = 4;
    
    // Only check bottom-right corner with offset
    const bottomRightCorner = rotatePoint(
      [img.x + img.width, img.y + img.height] as Point,
      center,
      img.rotation
    );
    
    const scaleHandleX = bottomRightCorner[0] - scaleHandleOffset;
    const scaleHandleY = bottomRightCorner[1] - scaleHandleOffset;
    
    return (
      point[0] >= scaleHandleX - scaleHandleSize / 2 &&
      point[0] <= scaleHandleX + scaleHandleSize / 2 &&
      point[1] >= scaleHandleY - scaleHandleSize / 2 &&
      point[1] <= scaleHandleY + scaleHandleSize / 2
    );
  }, [images, getImageCenter, rotatePoint]);

  const startStroke = useCallback(
    (point: Point, context: CanvasRenderingContext2D) => {
      // Check if we clicked on any image (including handles)
      let foundImageIndex: number | null = null;
      let foundDragMode: 'move' | 'resize' | 'rotate' | 'scale' | null = null;
      
      // Check all images from top to bottom
      for (let i = images.length - 1; i >= 0; i--) {
        // Check handles first (most specific)
        if (isOnRotationHandle(point, i)) {
          foundImageIndex = i;
          foundDragMode = 'rotate';
          break;
        } else if (isOnResizeHandle(point, i)) {
          foundImageIndex = i;
          foundDragMode = 'resize';
          break;
        } else if (isOnScaleHandle(point, i)) {
          foundImageIndex = i;
          foundDragMode = 'scale';
          break;
        }
        
        // Then check if we clicked on the image body
        const img = images[i];
        const center = getImageCenter(img);
        const localPoint = rotatePoint(point, center, -img.rotation);
        const scaledWidth = img.width * img.scale;
        const scaledHeight = img.height * img.scale;
        const scaledX = img.x + (img.width - scaledWidth) / 2;
        const scaledY = img.y + (img.height - scaledHeight) / 2;
        
        if (
          localPoint[0] >= scaledX &&
          localPoint[0] <= scaledX + scaledWidth &&
          localPoint[1] >= scaledY &&
          localPoint[1] <= scaledY + scaledHeight
        ) {
          foundImageIndex = i;
          foundDragMode = 'move';
          break;
        }
      }
      
      if (foundImageIndex !== null) {
        setSelectedImageIndex(foundImageIndex);
        setDragMode(foundDragMode);
        dragStart.current = point;
        initialImageState.current = { ...images[foundImageIndex] };
      } else {
        setSelectedImageIndex(null);
        setDragMode(null);
      }
      
      // Redraw to show selection
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      drawImages(context);
    },
    [isOnResizeHandle, isOnRotationHandle, isOnScaleHandle, images, drawImages, getImageCenter, rotatePoint]
  );

  const continueStroke = useCallback(
    (newPoint: Point, context: CanvasRenderingContext2D) => {
      if (!dragStart.current || selectedImageIndex === null || !initialImageState.current) {
        return;
      }

      const deltaX = newPoint[0] - dragStart.current[0];
      const deltaY = newPoint[1] - dragStart.current[1];

      setImages(prevImages => {
        if (!initialImageState.current) return prevImages;
        
        const newImages = [...prevImages];
        const imageToUpdate = { ...initialImageState.current };

        if (dragMode === 'move') {
          imageToUpdate.x = initialImageState.current.x + deltaX;
          imageToUpdate.y = initialImageState.current.y + deltaY;
        } else if (dragMode === 'resize') {
          const newWidth = Math.max(20, initialImageState.current.width + deltaX);
          const newHeight = Math.max(20, initialImageState.current.height + deltaY);
          
          // Maintain aspect ratio during resize
          const aspectRatio = initialImageState.current.originalWidth / initialImageState.current.originalHeight;
          if (newWidth / newHeight > aspectRatio) {
            imageToUpdate.width = newHeight * aspectRatio;
            imageToUpdate.height = newHeight;
          } else {
            imageToUpdate.width = newWidth;
            imageToUpdate.height = newWidth / aspectRatio;
          }
        } else if (dragMode === 'rotate' && dragStart.current) {
          const center = getImageCenter(initialImageState.current);
          const startAngle = Math.atan2(
            dragStart.current[1] - center[1],
            dragStart.current[0] - center[0]
          );
          const currentAngle = Math.atan2(
            newPoint[1] - center[1],
            newPoint[0] - center[0]
          );
          const deltaAngle = currentAngle - startAngle;
          imageToUpdate.rotation = initialImageState.current.rotation + deltaAngle;
        } else if (dragMode === 'scale' && dragStart.current) {
          const center = getImageCenter(initialImageState.current);
          const startDistance = Math.sqrt(
            Math.pow(dragStart.current[0] - center[0], 2) + 
            Math.pow(dragStart.current[1] - center[1], 2)
          );
          const currentDistance = Math.sqrt(
            Math.pow(newPoint[0] - center[0], 2) + 
            Math.pow(newPoint[1] - center[1], 2)
          );
          
          if (startDistance > 0) {
            const scaleFactor = currentDistance / startDistance;
            imageToUpdate.scale = Math.max(0.1, Math.min(5, initialImageState.current.scale * scaleFactor));
          }
        }

        newImages[selectedImageIndex] = imageToUpdate;
        return newImages;
      });

      // Redraw canvas
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      drawImages(context);
    },
    [selectedImageIndex, dragMode, drawImages, getImageCenter]
  );

  const endStroke = useCallback(() => {
    setDragMode(null);
    dragStart.current = undefined;
    initialImageState.current = undefined;
  }, []);

  // Custom method to trigger image import
  const triggerImageImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        importImage(file);
      }
    };
    input.click();
  }, [importImage]);

  const getCursor = useCallback(() => {
    if (selectedImageIndex === null) return 'default';
    
    switch (dragMode) {
      case 'resize': return 'nw-resize';
      case 'rotate': return 'grab';
      case 'scale': return 'nesw-resize';
      case 'move': return 'move';
      default: return 'default';
    }
  }, [selectedImageIndex, dragMode]);

  return {
    name: "Image",
    startStroke,
    continueStroke,
    endStroke,
    cursor: getCursor(),
    drawImages,
    // Expose additional methods for external use
    importImage,
    triggerImageImport,
    images,
    selectedImageIndex,
  } as ToolHandlers & {
    importImage: (file: File) => Promise<ImageData>;
    triggerImageImport: () => void;
    images: ImageData[];
    selectedImageIndex: number | null;
    drawImages: (context: CanvasRenderingContext2D) => void;
  };
}
