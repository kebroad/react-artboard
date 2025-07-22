import { ToolHandlers } from "../../components/Artboard";
export interface UseCrayonProps {
    color?: string;
    strokeWidth?: number;
    pressure?: number;
}
export declare function useCrayon({ color, strokeWidth, pressure, }: UseCrayonProps): ToolHandlers;
