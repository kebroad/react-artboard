import { ToolHandlers } from "../../components/Artboard";
export interface UseAcrylicProps {
    color?: string;
    strokeWidth?: number;
    opacity?: number;
}
export declare function useAcrylic({ color, strokeWidth, opacity, }: UseAcrylicProps): ToolHandlers;
