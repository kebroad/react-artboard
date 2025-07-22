import { ToolHandlers } from "../../components/Artboard";
export interface UseCharcoalProps {
    color?: string;
    strokeWidth?: number;
    roughness?: number;
}
export declare function useCharcoal({ color, strokeWidth, roughness, }: UseCharcoalProps): ToolHandlers;
