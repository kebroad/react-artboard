import { ToolHandlers } from "../../components/Artboard";
export interface UseInkPenProps {
    color?: string;
    strokeWidth?: number;
    flow?: number;
}
export declare function useInkPen({ color, strokeWidth, flow, }: UseInkPenProps): ToolHandlers;
