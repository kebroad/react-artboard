import { ToolHandlers } from "../../components/Artboard";
export interface UseSmudgeProps {
    strokeWidth?: number;
    strength?: number;
}
export declare function useSmudge({ strokeWidth, strength, }: UseSmudgeProps): ToolHandlers;
