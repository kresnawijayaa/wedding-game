import { z } from "zod";

export const foundationStatusSchema = z.object({
  milestone: z.literal("M1"),
  task: z.literal("M1-01"),
  state: z.enum(["ready", "building", "verified"]),
});

export type FoundationStatus = z.infer<typeof foundationStatusSchema>;

export {
  createDiagnosticRuntimeOptions,
  sanitizeDiagnosticBreadcrumb,
  sanitizeDiagnosticEvent,
} from "./observability.ts";
