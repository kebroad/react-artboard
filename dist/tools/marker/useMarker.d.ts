import { ToolHandlers } from "../../components/Artboard";
export interface UseMarkerProps {
    color?: string;
    strokeWidth?: number;
}
export declare function useMarker({ color, strokeWidth, }: UseMarkerProps): ToolHandlers;
