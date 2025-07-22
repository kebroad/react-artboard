import { ToolHandlers } from "../../components/Artboard";
export interface UseOilPaintProps {
    color?: string;
    strokeWidth?: number;
    blending?: number;
}
export declare function useOilPaint({ color, strokeWidth, blending, }: UseOilPaintProps): ToolHandlers;
