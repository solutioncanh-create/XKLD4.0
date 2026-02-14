ALTER TABLE ho_so ADD COLUMN IF NOT EXISTS ma_ho_so TEXT;
-- Refresh schema cache instruction usually isn't needed for Postgres itself, but let's make sure the column is there.
SELECT column_name FROM information_schema.columns WHERE table_name = 'ho_so' AND column_name = 'ma_ho_so';
