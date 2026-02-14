-- Chạy script này trong SQL Editor của Supabase để thêm các cột còn thiếu cho bảng ho_so
alter table public.ho_so add column if not exists hon_nhan text;
alter table public.ho_so add column if not exists chieu_cao text;
alter table public.ho_so add column if not exists can_nang text;
alter table public.ho_so add column if not exists hut_thuoc text;
alter table public.ho_so add column if not exists trinh_do_van_hoa text;
