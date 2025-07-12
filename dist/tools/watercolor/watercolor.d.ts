import { Point } from "../../utils/pointUtils";
export declare function makePolygon(centre: Point, sides: number, radius: number): Array<Point>;
export declare function deformPolygon(points: Array<Point>, depth: number, variance: number, vdiv: number): Array<Point>;
export declare function getSplodge(point: Point, sides: number, radius: number): Array<Point>;
export declare function splodgeAtPoint(point: Point, context: CanvasRenderingContext2D, width: number): void;
export declare function splodgeTrail(points: Array<Point>, width: number, trail: number, context: CanvasRenderingContext2D): void;
