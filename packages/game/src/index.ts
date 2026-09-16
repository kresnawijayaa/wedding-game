export const GAME_RUNTIME_PACKAGE = "@wedding-quest/game" as const;

export type GameRuntimeState = "idle" | "loading" | "ready" | "failed";
