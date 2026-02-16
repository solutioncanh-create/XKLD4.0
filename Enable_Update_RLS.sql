-- FIX RLS PERMISSIONS FOR HO_SO TABLE
-- Đảm bảo quyền cập nhật (Update) cho bảng Hồ Sơ

ALTER TABLE public.ho_so ENABLE ROW LEVEL SECURITY;

-- 1. Xóa các policy cũ để tránh xung đột
DROP POLICY IF EXISTS "Public Access" ON public.ho_so;
DROP POLICY IF EXISTS "Public Select" ON public.ho_so;
DROP POLICY IF EXISTS "Public Insert" ON public.ho_so;
DROP POLICY IF EXISTS "Public Update" ON public.ho_so;
DROP POLICY IF EXISTS "Public Delete" ON public.ho_so;

-- 2. Tạo Policy "Mở" cho phép tất cả thao tác (Select, Insert, Update, Delete) với mọi user (ẩn danh/đăng nhập)
-- Lưu ý: Chỉ dùng cho môi trường Demo/Dev. Production cần siết chặt hơn.
CREATE POLICY "Enable All Access" ON public.ho_so
FOR ALL
USING (true)
WITH CHECK (true);

-- Kiểm tra lại bảng yeu_cau_tu_van
ALTER TABLE public.yeu_cau_tu_van ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable All Access" ON public.yeu_cau_tu_van;
CREATE POLICY "Enable All Access" ON public.yeu_cau_tu_van
FOR ALL
USING (true)
WITH CHECK (true);
