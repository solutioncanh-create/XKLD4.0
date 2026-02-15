-- =================================================================
-- SCRIPT CẬP NHẬT CẤU TRÚC BẢNG 'ho_so' CHO ỨNG DỤNG XUẤT KHẨU LAO ĐỘNG
-- Chạy script này trong Supabase Dashboard -> SQL Editor
-- =================================================================

-- 1. Bổ sung các cột thông tin cá nhân và liên hệ
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS nickname text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS facebook_zalo text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS ton_giao text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS noi_o_hien_tai text; -- Nơi ở hiện tại (khác hộ khẩu)

-- 2. Bổ sung thông tin giấy tờ tùy thân (CCCD & Hộ chiếu)
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS so_cccd text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS ngay_cap_cccd date;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS noi_cap_cccd text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS anh_cccd_mat_truoc text; -- URL ảnh
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS anh_cccd_mat_sau text;  -- URL ảnh

ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS so_ho_chieu text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS ngay_cap_ho_chieu date;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS ngay_het_han_ho_chieu date;

-- 3. Bổ sung thông tin ngoại hình & bảo hộ
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS size_ao text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS size_giay text; -- Lưu text để linh hoạt (VD: "39", "40.5")

-- 4. Bổ sung thông tin Gia đình & Bảo lãnh (Khẩn cấp)
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS nguoi_bao_lanh text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS sdt_nguoi_bao_lanh text;

-- 5. Bổ sung thông tin Sức khỏe & Tiền sử bệnh
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS di_ung text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS benh_an_phau_thuat text;

-- 6. Bổ sung thông tin Sàng lọc & Kinh nghiệm Nhật Bản
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS da_tung_di_nuoc_ngoai text; -- "Chưa" / "Rồi"
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS co_nguoi_than_o_nhat text;  -- "Không" / "Có"

-- =================================================================
-- KẾT THÚC SCRIPT
-- Sau khi chạy xong, hãy quay lại ứng dụng và reload trang.
-- =================================================================
