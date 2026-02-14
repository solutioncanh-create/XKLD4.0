-- File: add_missing_cols_v2.sql
-- Run this in Supabase SQL Editor to fix missing columns error and update schema for print layout

-- Add missing columns for print layout
ALTER TABLE ho_so ADD COLUMN IF NOT EXISTS hon_nhan TEXT;
ALTER TABLE ho_so ADD COLUMN IF NOT EXISTS chieu_cao INTEGER;
ALTER TABLE ho_so ADD COLUMN IF NOT EXISTS can_nang INTEGER;
ALTER TABLE ho_so ADD COLUMN IF NOT EXISTS hut_thuoc TEXT; -- 'Có' / 'Không'

-- Note: trinh_do_van_hoa column is removed from print layout requirement, so no need to add it strictly, 
-- but added here just in case other features use it.
ALTER TABLE ho_so ADD COLUMN IF NOT EXISTS trinh_do_van_hoa TEXT;
