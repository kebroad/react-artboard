export interface History {
    setContext: (context: CanvasRenderingContext2D) => void;
    pushState: (canvas: HTMLCanvasElement) => Promise<boolean>;
}
export interface HistoryHook {
    history: History;
    undo: () => Promise<boolean>;
    redo: () => Promise<boolean>;
    clear: () => void;
    canUndo: boolean;
    canRedo: boolean;
}
export declare function useHistory(size?: number): HistoryHook;
