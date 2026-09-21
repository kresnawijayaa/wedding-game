import type { WeddingSeed } from "@wedding-quest/config";
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const weddingStatus = pgEnum("wedding_status", ["draft", "published", "archived"]);
export const eventType = pgEnum("event_type", ["ceremony", "reception"]);
export const invitationStatus = pgEnum("invitation_status", ["invited", "confirmed", "declined"]);

export const weddings = pgTable(
  "weddings",
  {
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    id: uuid("id").primaryKey(),
    locale: varchar("locale", { length: 16 }).notNull(),
    publishedAt: timestamp("published_at", { mode: "date", withTimezone: true }),
    slug: varchar("slug", { length: 120 }).notNull(),
    status: weddingStatus("status").default("draft").notNull(),
    timezone: varchar("timezone", { length: 64 }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("weddings_slug_unique").on(table.slug),
    check("weddings_slug_format", sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check(
      "weddings_publication_state",
      sql`${table.status} <> 'published' OR ${table.publishedAt} IS NOT NULL`,
    ),
  ],
);

export const couples = pgTable("couples", {
  partnerOne: jsonb("partner_one").$type<WeddingSeed["couple"]["partnerOne"]>().notNull(),
  partnerTwo: jsonb("partner_two").$type<WeddingSeed["couple"]["partnerTwo"]>().notNull(),
  weddingId: uuid("wedding_id")
    .primaryKey()
    .references(() => weddings.id, { onDelete: "cascade" }),
});

export const events = pgTable(
  "events",
  {
    address: text("address").notNull(),
    endsAt: timestamp("ends_at", { mode: "date", withTimezone: true }).notNull(),
    id: uuid("id").primaryKey(),
    mapUrl: text("map_url").notNull(),
    startsAt: timestamp("starts_at", { mode: "date", withTimezone: true }).notNull(),
    streamingUrl: text("streaming_url"),
    title: varchar("title", { length: 120 }).notNull(),
    type: eventType("type").notNull(),
    venueName: varchar("venue_name", { length: 160 }).notNull(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("events_wedding_start_idx").on(table.weddingId, table.startsAt),
    check("events_time_order", sql`${table.endsAt} > ${table.startsAt}`),
  ],
);

export const guests = pgTable(
  "guests",
  {
    displayName: varchar("display_name", { length: 120 }).notNull(),
    groupName: varchar("group_name", { length: 120 }).notNull(),
    id: uuid("id").primaryKey(),
    invitationStatus: invitationStatus("invitation_status").default("invited").notNull(),
    maxPartySize: integer("max_party_size").notNull(),
    weddingId: uuid("wedding_id")
      .notNull()
      .references(() => weddings.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("guests_wedding_idx").on(table.weddingId),
    check("guests_party_size_range", sql`${table.maxPartySize} BETWEEN 1 AND 20`),
  ],
);

export const themeAssignments = pgTable("theme_assignments", {
  customizations: jsonb("customizations").$type<Record<string, string>>().default({}).notNull(),
  themeId: varchar("theme_id", { length: 120 }).notNull(),
  themeVersion: integer("theme_version").notNull(),
  weddingId: uuid("wedding_id")
    .primaryKey()
    .references(() => weddings.id, { onDelete: "cascade" }),
});
