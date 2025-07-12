import React from "react";
import { History } from "../history";
import { Point } from "../utils/pointUtils";
export interface ArtboardProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
    tool: ToolHandlers;
    history?: History;
    onStartStroke?: (point: Point) => void;
    onContinueStroke?: (point: Point) => void;
    onEndStroke?: () => void;
}
export interface ArtboardRef {
    download: (filename?: string, type?: string) => void;
    getImageAsDataUri: (type?: string) => string | undefined;
    clear: () => void;
    context?: CanvasRenderingContext2D | null;
}
export interface ToolHandlers {
    name: string;
    startStroke?: (point: Point, context: CanvasRenderingContext2D) => void;
    continueStroke?: (point: Point, context: CanvasRenderingContext2D) => void;
    endStroke?: (context: CanvasRenderingContext2D) => void;
    cursor?: string;
}
export declare const Artboard: React.ForwardRefExoticComponent<ArtboardProps & React.RefAttributes<ArtboardRef>>;
