import { ToolHandlers } from "../../components/Artboard";
export interface UseAirbrushProps {
    color?: string;
    strokeWidth?: number;
}
export declare function useAirbrush({ color, strokeWidth, }: UseAirbrushProps): ToolHandlers;
