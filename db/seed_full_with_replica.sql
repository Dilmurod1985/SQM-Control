-- Wrapper to apply seed_full.sql with FK checks disabled (dev only)
-- Use psql to run this file from project root: psql <DATABASE_URL> -f db/seed_full_with_replica.sql

BEGIN;
SET session_replication_role = 'replica';
\i seed_full.sql
SET session_replication_role = 'origin';
COMMIT;
