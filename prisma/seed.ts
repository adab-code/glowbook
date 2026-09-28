import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to .env before seeding.");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const PASSWORD = process.env.SEED_PASSWORD ?? "GlowBook!2026";

async function main() {
  // bcrypt, cost 12 — the same scheme Auth.js compares against in src/auth.ts.
  const passwordHash = await hash(PASSWORD, 12);

  // Idempotent: re-running the seed resets the demo studio instead of duplicating it.
  await db.$transaction([
    db.appointmentService.deleteMany(),
    db.appointment.deleteMany(),
    db.passwordResetToken.deleteMany(),
    db.staffInvite.deleteMany(),
    db.client.deleteMany(),
    db.service.deleteMany(),
    db.staffUser.deleteMany(),
    db.account.deleteMany(),
  ]);

  const account = await db.account.create({
    data: {
      studioName: "Aurea Lashes",
      slug: "aurea-lashes",
      timezone: "America/Boise",
      currency: "USD",
      onboardingComplete: true,
    },
  });

  const owner = await db.staffUser.create({
    data: {
      accountId: account.id,
      email: "owner@glowbook.dev",
      passwordHash,
      role: "OWNER",
      firstName: "Iván",
      lastName: "Chulde",
      phone: "+1 208 555 0143",
      emailVerifiedAt: new Date(),
    },
  });

  const staff = await db.staffUser.create({
    data: {
      accountId: account.id,
      email: "staff@glowbook.dev",
      passwordHash,
      role: "STAFF",
      firstName: "Aaron",
      lastName: "Alfaro",
      phone: "+1 208 555 0177",
      emailVerifiedAt: new Date(),
    },
  });

  const services = await Promise.all(
    [
      {
        name: "Classic eyelash extensions",
        description: "Classic set, one to two and a half hours.",
        priceCents: 8500,
        durationMinutes: 90,
      },
      {
        name: "Volume eyelash extensions",
        description: "Full volume set for a fuller, longer look.",
        priceCents: 12000,
        durationMinutes: 120,
      },
      {
        name: "Brow shaping and tint",
        description: "Shape, tint and finish.",
        priceCents: 4500,
        durationMinutes: 45,
      },
      {
        name: "Express lash refill",
        description: "Top-up for a classic set within three weeks.",
        priceCents: 5500,
        durationMinutes: 60,
      },
    ].map((service) =>
      db.service.create({ data: { accountId: account.id, ...service } }),
    ),
  );

  const clients = await Promise.all(
    [
      {
        firstName: "Sofía",
        lastName: "Ramírez",
        email: "sofia.ramirez@example.com",
        phone: "+1 208 555 0210",
        notes: "Prefers a natural set. Slightly sensitive to strong adhesive.",
      },
      {
        firstName: "Mateo",
        lastName: "Herrera",
        email: "mateo.herrera@example.com",
        phone: "+1 208 555 0331",
        notes: "Always books with Aaron on Friday afternoons.",
      },
      {
        firstName: "Camila",
        lastName: "Torres",
        email: "camila.torres@example.com",
        phone: "",
        notes: "Walk-in referral from Sofía.",
      },
    ].map((client) =>
      db.client.create({ data: { accountId: account.id, ...client } }),
    ),
  );

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  function slot(daysAhead: number, hour: number) {
    const date = new Date(startOfToday);
    date.setDate(date.getDate() + daysAhead);
    date.setHours(hour, 0, 0, 0);
    return date;
  }

  const appointments = [
    {
      client: clients[0],
      serviceIndexes: [0],
      staffUserId: owner.id,
      daysAhead: 1,
      hour: 10,
      status: "SCHEDULED" as const,
    },
    {
      client: clients[1],
      serviceIndexes: [1, 2],
      staffUserId: staff.id,
      daysAhead: 1,
      hour: 14,
      status: "SCHEDULED" as const,
    },
    {
      client: clients[2],
      serviceIndexes: [3],
      staffUserId: owner.id,
      daysAhead: 3,
      hour: 9,
      status: "SCHEDULED" as const,
    },
    {
      client: clients[0],
      serviceIndexes: [2],
      staffUserId: staff.id,
      daysAhead: -7,
      hour: 11,
      status: "COMPLETED" as const,
    },
  ];

  for (const appointment of appointments) {
    const chosen = appointment.serviceIndexes.map((index) => services[index]);
    const durationMinutes = chosen.reduce(
      (sum, service) => sum + service.durationMinutes,
      0,
    );
    const startsAt = slot(appointment.daysAhead, appointment.hour);

    await db.appointment.create({
      data: {
        accountId: account.id,
        clientId: appointment.client.id,
        staffUserId: appointment.staffUserId,
        startsAt,
        endsAt: new Date(startsAt.getTime() + durationMinutes * 60_000),
        status: appointment.status,
        priceCentsTotal: chosen.reduce(
          (sum, service) => sum + service.priceCents,
          0,
        ),
        services: {
          create: chosen.map((service) => ({ serviceId: service.id })),
        },
      },
    });
  }

  // Expired reset token, so the reset flow is demonstrable from a clean database.
  await db.passwordResetToken.create({
    data: {
      staffUserId: owner.id,
      tokenHash: createHash("sha256")
        .update("expired-demo-token")
        .digest("hex"),
      expiresAt: new Date(Date.now() - 60_000),
    },
  });

  console.info("Seeded demo studio:");
  console.info(`  account  ${account.studioName} (${account.slug})`);
  console.info(`  owner    owner@glowbook.dev  /  ${PASSWORD}`);
  console.info(`  staff    staff@glowbook.dev  /  ${PASSWORD}`);
  console.info(
    `  services ${services.length}, clients ${clients.length}, appointments ${appointments.length}`,
  );
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
