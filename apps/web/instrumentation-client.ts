import { registerClientErrorMonitoring } from "./observability/client";

registerClientErrorMonitoring();

// Performance tracing is intentionally disabled for the invitation shell.
export function onRouterTransitionStart(): void {}
