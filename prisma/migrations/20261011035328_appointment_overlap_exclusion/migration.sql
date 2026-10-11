-- Race-safe overlap protection for appointments (FR-021, issue #34).
--
-- `assertNoOverlap` in src/lib/appointments/scheduling.ts stays as the friendly
-- pre-check (it returns a 409 naming the clashing booking), but read-then-write
-- can never win a race: two requests in the same instant both read "no conflict"
-- and both write. This constraint is the backstop — the loser's INSERT or UPDATE
-- fails, and the route handler maps it onto the same 409 (see
-- `isOverlapViolation` in scheduling.ts).
--
-- Two modelling problems, solved with generated columns. They are deliberately
-- NOT mapped in prisma/schema.prisma: Prisma ignores extra columns, and a
-- generated column cannot be written, so there is nothing for the client to know.
--
-- 1. `staffUserId` is nullable, and gist `=` never matches NULL, so unassigned
--    bookings would slip through the constraint. `staff_key` coalesces NULL to a
--    sentinel UUID that can never be a real StaffUser id, preserving the rule
--    that "unassigned" is its own resource.
-- 2. Exclusion constraints cannot be partial, so CANCELLED rows would keep
--    blocking their old slot forever. `active_range` collapses to the empty
--    range on cancel — empty ranges never overlap anything — while the row and
--    its cancellationReason survive as history.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Appointment" ADD COLUMN "staff_key" uuid
  GENERATED ALWAYS AS (COALESCE("staffUserId", '00000000-0000-0000-0000-000000000000'::uuid)) STORED;

ALTER TABLE "Appointment" ADD COLUMN "active_range" tstzrange
  GENERATED ALWAYS AS (
    CASE WHEN "status" = 'CANCELLED' THEN 'empty'::tstzrange
         ELSE tstzrange("startsAt", "endsAt")
    END
  ) STORED;

ALTER TABLE "Appointment" ADD CONSTRAINT "appointment_no_overlap"
  EXCLUDE USING gist ("accountId" WITH =, "staff_key" WITH =, "active_range" WITH &&);
