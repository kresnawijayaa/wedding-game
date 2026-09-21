export function defineWeddingConfig<const TConfig>(config: TConfig): TConfig {
  return config;
}

export {
  defineWeddingSeed,
  sampleWeddingSeed,
  weddingSeedSchema,
  type WeddingSeed,
} from "./wedding-seed.ts";
