-- AlterEnum
-- This must run in its own migration because Postgres does not allow
-- ALTER TYPE ... ADD VALUE inside a transaction together with other DDL.
ALTER TYPE "Role" ADD VALUE 'hr';
