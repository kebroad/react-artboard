import { ToolHandlers } from "../../components/Artboard";
export interface UseCalligraphyProps {
    color?: string;
    strokeWidth?: number;
    angle?: number;
}
export declare function useCalligraphy({ color, strokeWidth, angle, }: UseCalligraphyProps): ToolHandlers;
