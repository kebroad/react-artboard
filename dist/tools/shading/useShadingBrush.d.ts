import { ToolHandlers } from "../../components/Artboard";
export interface UseShadingProps {
    color?: string;
    neighbourColor?: string;
    neighbourStrokeWidth?: number;
    distanceThreshold?: number;
    spreadFactor?: number;
}
export declare function useShadingBrush({ color, neighbourColor, distanceThreshold, neighbourStrokeWidth, spreadFactor, }: UseShadingProps): ToolHandlers;
