-- Convert every timestamp column to TIMESTAMPTZ(3).
--
-- Why: the local development database has always had `timestamptz` columns,
-- but the initial migration created them as `TIMESTAMP(3)`, which in PostgreSQL
-- means *without* a time zone. That is drift: a production database created
-- from this migration history would have zone-naive columns while development
-- had zone-aware ones, and the appointment overlap logic would then behave
-- differently in production than it does locally.
--
-- `AT TIME ZONE 'UTC'` reinterprets each stored naive value as UTC rather than
-- shifting it, which preserves the instant. That is the correct reading here
-- because Prisma sends JavaScript `Date` objects through node-postgres, which
-- serialises them as UTC before they reach the column.
--
-- `prisma/schema.prisma` now carries an explicit @db.Timestamptz(3) on all 20
-- fields, so future migrations cannot reintroduce the mismatch.

ALTER TABLE "Account" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "Account" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE "Appointment" ALTER COLUMN "startsAt" SET DATA TYPE TIMESTAMPTZ(3) USING "startsAt" AT TIME ZONE 'UTC';
ALTER TABLE "Appointment" ALTER COLUMN "endsAt" SET DATA TYPE TIMESTAMPTZ(3) USING "endsAt" AT TIME ZONE 'UTC';
ALTER TABLE "Appointment" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "Appointment" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE "Client" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "Client" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE "PasswordResetToken" ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMPTZ(3) USING "expiresAt" AT TIME ZONE 'UTC';
ALTER TABLE "PasswordResetToken" ALTER COLUMN "usedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "usedAt" AT TIME ZONE 'UTC';
ALTER TABLE "PasswordResetToken" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "Service" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "Service" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';
ALTER TABLE "StaffInvite" ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMPTZ(3) USING "expiresAt" AT TIME ZONE 'UTC';
ALTER TABLE "StaffInvite" ALTER COLUMN "acceptedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "acceptedAt" AT TIME ZONE 'UTC';
ALTER TABLE "StaffInvite" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "StaffUser" ALTER COLUMN "emailVerifiedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "emailVerifiedAt" AT TIME ZONE 'UTC';
ALTER TABLE "StaffUser" ALTER COLUMN "lastLoginAt" SET DATA TYPE TIMESTAMPTZ(3) USING "lastLoginAt" AT TIME ZONE 'UTC';
ALTER TABLE "StaffUser" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
ALTER TABLE "StaffUser" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3) USING "updatedAt" AT TIME ZONE 'UTC';
