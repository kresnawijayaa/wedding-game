import { sampleWeddingSeed, weddingSeedSchema } from "../src/wedding-seed.ts";

const seed = weddingSeedSchema.parse(sampleWeddingSeed);

console.log(
  `Sample wedding seed is valid: ${seed.wedding.slug} (${seed.events.length} events, ${seed.guests.length} guest).`,
);
