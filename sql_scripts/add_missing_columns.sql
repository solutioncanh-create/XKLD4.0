-- Bổ sung các cột còn thiếu cho bảng Hồ Sơ để khớp với Form Đăng Ký
-- Chạy đoạn này trong SQL Editor của Supabase

alter table public.ho_so
-- Thông tin liên hệ bổ sung
add column if not exists facebook_zalo text,
add column if not exists dia_chi text, -- Hộ khẩu
add column if not exists noi_o_hien_tai text,

-- Giấy tờ
add column if not exists so_ho_chieu text,
add column if not exists ngay_cap_ho_chieu date,
add column if not exists ngay_het_han_ho_chieu date,
add column if not exists so_cccd text,
add column if not exists ngay_cap_cccd date,
add column if not exists noi_cap_cccd text,
add column if not exists anh_cccd_mat_truoc text,
add column if not exists anh_cccd_mat_sau text,

-- Thông tin cá nhân khác
add column if not exists ton_giao text,
add column if not exists size_ao text,
add column if not exists size_giay text,

-- Gia đình / Bảo lãnh
add column if not exists nguoi_bao_lanh text,
add column if not exists sdt_nguoi_bao_lanh text,

-- Sức khỏe
add column if not exists thi_luc_trai text,
add column if not exists thi_luc_phai text,
add column if not exists xam_hinh text,
add column if not exists mu_mau text,
add column if not exists hut_thuoc text,
add column if not exists uong_ruou text,
add column if not exists di_ung text,
add column if not exists benh_an_phau_thuat text,

-- Học vấn & Kinh nghiệm
add column if not exists qua_trinh_hoc_tap jsonb default '[]'::jsonb,
-- kinh_nghiem_lam_viec đã có hoặc chưa, them cho chac
add column if not exists kinh_nghiem_lam_viec jsonb default '[]'::jsonb,

-- Kỹ năng & Nguyện vọng
add column if not exists bang_lai_xe text,
add column if not exists diem_manh text,
add column if not exists diem_yeu text,
add column if not exists thoi_gian_du_kien text,
add column if not exists muc_dich_di_nhat text,
add column if not exists da_tung_di_nuoc_ngoai text,
add column if not exists co_nguoi_than_o_nhat text;
