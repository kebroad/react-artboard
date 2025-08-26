import { ToolHandlers } from "../../components/Artboard";
export interface ImageData {
    image: HTMLImageElement;
    x: number;
    y: number;
    width: number;
    height: number;
    originalWidth: number;
    originalHeight: number;
    scale: number;
    rotation: number;
}
export interface UseImageProps {
    onImageImported?: (imageData: ImageData) => void;
}
export declare function useImage({ onImageImported }?: UseImageProps): ToolHandlers;
