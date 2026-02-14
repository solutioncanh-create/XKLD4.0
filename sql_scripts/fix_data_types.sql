-- Chuyển đổi các cột từ Boolean sang Text để khớp với Form (lưu "Có"/"Không")
-- Copy và chạy trong Supabase SQL Editor

ALTER TABLE public.ho_so 
ALTER COLUMN hut_thuoc TYPE text USING hut_thuoc::text,
ALTER COLUMN uong_ruou TYPE text USING uong_ruou::text,
ALTER COLUMN xam_hinh TYPE text USING xam_hinh::text,
ALTER COLUMN mu_mau TYPE text USING mu_mau::text,
ALTER COLUMN co_nguoi_than_o_nhat TYPE text USING co_nguoi_than_o_nhat::text,
ALTER COLUMN da_tung_di_nuoc_ngoai TYPE text USING da_tung_di_nuoc_ngoai::text;
