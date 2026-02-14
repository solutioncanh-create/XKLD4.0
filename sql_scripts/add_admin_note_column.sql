-- Thêm cột admin_note vào bảng yeu_cau_tu_van
-- Để Admin ghi chú nội bộ (Memo)

alter table public.yeu_cau_tu_van
add column if not exists admin_note text default '';
