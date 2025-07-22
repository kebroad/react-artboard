import { ToolHandlers } from "../../components/Artboard";
export interface UsePencilProps {
    color?: string;
    strokeWidth?: number;
    opacity?: number;
}
export declare function usePencil({ color, strokeWidth, opacity, }: UsePencilProps): ToolHandlers;
