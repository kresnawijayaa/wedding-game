import { z } from "zod";

const identifierSchema = z.string().uuid();
const dateTimeSchema = z.string().datetime({ offset: true });

const partnerSchema = z.object({
  biography: z.string().min(1).max(1_000),
  displayName: z.string().min(1).max(80),
  fullName: z.string().min(1).max(160),
  parentNames: z.array(z.string().min(1).max(160)).length(2),
});

const eventSchema = z
  .object({
    address: z.string().min(1).max(500),
    endsAt: dateTimeSchema,
    id: identifierSchema,
    mapUrl: z.string().url(),
    startsAt: dateTimeSchema,
    title: z.string().min(1).max(120),
    type: z.enum(["ceremony", "reception"]),
    venueName: z.string().min(1).max(160),
    weddingId: identifierSchema,
  })
  .refine((event) => Date.parse(event.endsAt) > Date.parse(event.startsAt), {
    message: "Event end time must be after its start time.",
    path: ["endsAt"],
  });

export const weddingSeedSchema = z
  .object({
    couple: z.object({
      partnerOne: partnerSchema,
      partnerTwo: partnerSchema,
      weddingId: identifierSchema,
    }),
    events: z.array(eventSchema).min(1),
    guests: z.array(
      z.object({
        displayName: z.string().min(1).max(120),
        groupName: z.string().min(1).max(120),
        id: identifierSchema,
        invitationStatus: z.enum(["invited", "confirmed", "declined"]),
        maxPartySize: z.number().int().min(1).max(20),
        weddingId: identifierSchema,
      }),
    ),
    schemaVersion: z.literal(1),
    themeAssignment: z.object({
      customizations: z.record(z.string(), z.string()),
      themeId: z.string().regex(/^[a-z0-9-]+$/),
      themeVersion: z.number().int().positive(),
      weddingId: identifierSchema,
    }),
    wedding: z.object({
      id: identifierSchema,
      locale: z.literal("id-ID"),
      publishedAt: dateTimeSchema.nullable(),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      status: z.enum(["draft", "published", "archived"]),
      timezone: z.literal("Asia/Jakarta"),
    }),
  })
  .superRefine((seed, context) => {
    const weddingId = seed.wedding.id;
    const referencedWeddingIds = [
      seed.couple.weddingId,
      seed.themeAssignment.weddingId,
      ...seed.events.map((event) => event.weddingId),
      ...seed.guests.map((guest) => guest.weddingId),
    ];

    if (referencedWeddingIds.some((candidate) => candidate !== weddingId)) {
      context.addIssue({
        code: "custom",
        message: "Every seed record must reference the sample wedding.",
        path: ["wedding", "id"],
      });
    }

    if (new Set(seed.events.map((event) => event.id)).size !== seed.events.length) {
      context.addIssue({
        code: "custom",
        message: "Event IDs must be unique.",
        path: ["events"],
      });
    }

    if (seed.wedding.status === "published" && seed.wedding.publishedAt === null) {
      context.addIssue({
        code: "custom",
        message: "Published weddings require a publication timestamp.",
        path: ["wedding", "publishedAt"],
      });
    }
  });

export type WeddingSeed = z.infer<typeof weddingSeedSchema>;

export function defineWeddingSeed(seed: unknown): WeddingSeed {
  return weddingSeedSchema.parse(seed);
}

export const sampleWeddingSeed = defineWeddingSeed({
  schemaVersion: 1,
  wedding: {
    id: "018f3df0-6e80-7b13-9a31-58dd337dd001",
    locale: "id-ID",
    publishedAt: null,
    slug: "ayu-rama",
    status: "draft",
    timezone: "Asia/Jakarta",
  },
  couple: {
    weddingId: "018f3df0-6e80-7b13-9a31-58dd337dd001",
    partnerOne: {
      biography: "Ayu menyukai ilustrasi, perjalanan singkat, dan pagi yang tenang.",
      displayName: "Ayu",
      fullName: "Ayu Larasati",
      parentNames: ["Bapak Arif Contoh", "Ibu Sari Contoh"],
    },
    partnerTwo: {
      biography: "Rama menyukai permainan, fotografi, dan cerita yang hangat.",
      displayName: "Rama",
      fullName: "Rama Wijaya",
      parentNames: ["Bapak Budi Contoh", "Ibu Dewi Contoh"],
    },
  },
  events: [
    {
      address: "Jl. Contoh Bahagia No. 12, Yogyakarta",
      endsAt: "2027-06-12T10:00:00+07:00",
      id: "018f3df0-6e80-7b13-9a31-58dd337dd002",
      mapUrl: "https://maps.example.com/ayu-rama-ceremony",
      startsAt: "2027-06-12T08:00:00+07:00",
      title: "Akad Nikah",
      type: "ceremony",
      venueName: "Pendopo Bahagia",
      weddingId: "018f3df0-6e80-7b13-9a31-58dd337dd001",
    },
    {
      address: "Jl. Contoh Bahagia No. 12, Yogyakarta",
      endsAt: "2027-06-12T14:00:00+07:00",
      id: "018f3df0-6e80-7b13-9a31-58dd337dd003",
      mapUrl: "https://maps.example.com/ayu-rama-reception",
      startsAt: "2027-06-12T11:00:00+07:00",
      title: "Resepsi",
      type: "reception",
      venueName: "Pendopo Bahagia",
      weddingId: "018f3df0-6e80-7b13-9a31-58dd337dd001",
    },
  ],
  guests: [
    {
      displayName: "Tamu Contoh",
      groupName: "Sahabat",
      id: "018f3df0-6e80-7b13-9a31-58dd337dd004",
      invitationStatus: "invited",
      maxPartySize: 2,
      weddingId: "018f3df0-6e80-7b13-9a31-58dd337dd001",
    },
  ],
  themeAssignment: {
    customizations: {},
    themeId: "garden-placeholder",
    themeVersion: 1,
    weddingId: "018f3df0-6e80-7b13-9a31-58dd337dd001",
  },
});
