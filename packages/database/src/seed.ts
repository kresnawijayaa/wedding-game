import type { WeddingSeed } from "@wedding-quest/config";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { couples, events, guests, themeAssignments, weddings } from "./schema/index.ts";

export async function persistWeddingSeed(
  database: PostgresJsDatabase,
  seed: WeddingSeed,
): Promise<void> {
  await database.transaction(async (transaction) => {
    const updatedAt = new Date();

    await transaction
      .insert(weddings)
      .values({
        id: seed.wedding.id,
        locale: seed.wedding.locale,
        publishedAt: seed.wedding.publishedAt ? new Date(seed.wedding.publishedAt) : null,
        slug: seed.wedding.slug,
        status: seed.wedding.status,
        timezone: seed.wedding.timezone,
        updatedAt,
      })
      .onConflictDoUpdate({
        target: weddings.id,
        set: {
          locale: seed.wedding.locale,
          publishedAt: seed.wedding.publishedAt ? new Date(seed.wedding.publishedAt) : null,
          slug: seed.wedding.slug,
          status: seed.wedding.status,
          timezone: seed.wedding.timezone,
          updatedAt,
        },
      });

    await transaction
      .insert(couples)
      .values(seed.couple)
      .onConflictDoUpdate({
        target: couples.weddingId,
        set: {
          partnerOne: seed.couple.partnerOne,
          partnerTwo: seed.couple.partnerTwo,
        },
      });

    for (const event of seed.events) {
      await transaction
        .insert(events)
        .values({ ...event, endsAt: new Date(event.endsAt), startsAt: new Date(event.startsAt) })
        .onConflictDoUpdate({
          target: events.id,
          set: {
            address: event.address,
            endsAt: new Date(event.endsAt),
            mapUrl: event.mapUrl,
            startsAt: new Date(event.startsAt),
            title: event.title,
            type: event.type,
            venueName: event.venueName,
            weddingId: event.weddingId,
          },
        });
    }

    for (const guest of seed.guests) {
      await transaction
        .insert(guests)
        .values(guest)
        .onConflictDoUpdate({
          target: guests.id,
          set: {
            displayName: guest.displayName,
            groupName: guest.groupName,
            invitationStatus: guest.invitationStatus,
            maxPartySize: guest.maxPartySize,
            weddingId: guest.weddingId,
          },
        });
    }

    await transaction
      .insert(themeAssignments)
      .values(seed.themeAssignment)
      .onConflictDoUpdate({
        target: themeAssignments.weddingId,
        set: {
          customizations: seed.themeAssignment.customizations,
          themeId: seed.themeAssignment.themeId,
          themeVersion: seed.themeAssignment.themeVersion,
        },
      });
  });
}
