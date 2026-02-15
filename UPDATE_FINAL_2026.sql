-- =================================================================
-- SCRIPT CẬP NHẬT TOÀN DIỆN DATABASE 2026
-- Đảm bảo đồng bộ với Code React (DangKy.jsx, YeuCauTuVan.jsx)
-- =================================================================

-- 1. Cập nhật bảng 'yeu_cau_tu_van' (Leads)
ALTER TABLE public.yeu_cau_tu_van ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.yeu_cau_tu_van ADD COLUMN IF NOT EXISTS gioi_tinh text;
ALTER TABLE public.yeu_cau_tu_van ADD COLUMN IF NOT EXISTS nguon_khach text; -- Để biết khách đến từ đâu (Direct, FB, Zalo...)

-- 2. Cập nhật bảng 'ho_so' (Candidates) - Đảm bảo đủ cột
-- Thông tin cá nhân & Liên hệ
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS ma_ho_so text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS nickname text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS facebook_zalo text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS ton_giao text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS dia_chi text; -- Hộ khẩu thường trú
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS noi_o_hien_tai text;

-- Giấy tờ tùy thân
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS so_cccd text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS ngay_cap_cccd date;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS noi_cap_cccd text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS anh_cccd_mat_truoc text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS anh_cccd_mat_sau text;

ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS so_ho_chieu text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS ngay_cap_ho_chieu date;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS ngay_het_han_ho_chieu date;

-- Ngoại hình & Bảo hộ
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS size_ao text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS size_giay text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS xam_hinh text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS mu_mau text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS thi_luc_trai text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS thi_luc_phai text;

-- Thói quen
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS hut_thuoc text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS uong_ruou text;

-- Sức khỏe & Tiền sử
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS di_ung text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS benh_an_phau_thuat text;

-- Gia đình & Bảo lãnh
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS nguoi_bao_lanh text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS sdt_nguoi_bao_lanh text;

-- Kỹ năng & Nguyện vọng
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS bang_lai_xe text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS diem_manh text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS diem_yeu text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS thoi_gian_du_kien text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS muc_dich_di_nhat text;

-- Sàng lọc
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS da_tung_di_nuoc_ngoai text;
ALTER TABLE public.ho_so ADD COLUMN IF NOT EXISTS co_nguoi_than_o_nhat text;
