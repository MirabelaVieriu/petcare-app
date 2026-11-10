-- Align legacy DB schema with the current Prisma model.
-- Earlier migrations created User/Admin records without the required passwordHash field.
ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT '';

ALTER TABLE "Admin"
    ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT '';

-- Existing rows need real bcrypt hashes before login is usable.
-- The seed script populates them when the database is seeded after this migration.
