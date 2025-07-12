import { ToolHandlers } from "../../components/Artboard";
export interface UseEraserProps {
    color?: string;
    strokeWidth?: number;
}
export declare function useEraser({ strokeWidth }: UseEraserProps): ToolHandlers;
