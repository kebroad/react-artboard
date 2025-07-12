import { Bristle } from "./brushHelpers";
import { ToolHandlers } from "../../components/Artboard";
export declare type Brush = Array<Bristle>;
export interface UseBrushProps {
    color?: string;
    strokeWidth?: number;
    varyBrightness?: number;
}
export declare function useBrush({ color, strokeWidth, varyBrightness, }: UseBrushProps): ToolHandlers;
