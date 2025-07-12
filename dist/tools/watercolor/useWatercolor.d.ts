import { ToolHandlers } from "../../components/Artboard";
export interface UseWatercolorProps {
    color?: string;
    strokeWidth?: number;
}
export declare function useWatercolor({ color, strokeWidth, }: UseWatercolorProps): ToolHandlers;
