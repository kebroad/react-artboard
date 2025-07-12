import { Point } from "../../utils/pointUtils";
export declare function varyColour(sourceColour: string, varyBrightness: number): string;
export interface Bristle {
    distance: number;
    thickness: number;
    colour: string;
}
export declare const rotatePoint: (distance: number, angle: number, origin: Point) => Point;
export declare const getBearing: (origin: Point, destination: Point) => number;
export declare const getNewAngle: (origin: Point, destination: Point, oldAngle?: number | undefined) => number;
export declare const angleDiff: (angleA: number, angleB: number) => number;
