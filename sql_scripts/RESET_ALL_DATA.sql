-- ===================================================
-- SCRIPT XÓA TOÀN BỘ DỮ LIỆU (RESET HỆ THỐNG)
-- ===================================================
-- CẢNH BÁO: Lệnh này sẽ xóa ĐÃ CÓ VĨNH VIỄN, không thể khôi phục.
-- 1. Xóa tất cả hồ sơ ứng viên
-- 2. Xóa tất cả đơn hàng & yêu cầu tư vấn
-- 3. Xóa tất cả tài khoản đăng nhập (Auth) & Phân quyền
-- ===================================================

-- 1. Xóa dữ liệu nghiệp vụ
TRUNCATE TABLE public.ho_so CASCADE;
TRUNCATE TABLE public.don_hang CASCADE;
TRUNCATE TABLE public.yeu_cau_tu_van CASCADE;

-- 2. Xóa dữ liệu phân quyền
TRUNCATE TABLE public.admin_roles CASCADE;

-- 3. Xóa dữ liệu tài khoản đăng nhập (Auth Users)
-- Lưu ý: Một số phiên bản Supabase có thể yêu cầu xóa qua API 
-- nhưng lệnh dưới đây thường hoạt động nếu bạn có quyền cao nhất.
DELETE FROM auth.users;

-- ===================================================
-- SAU KHI CHẠY XONG:
-- Hệ thống sẽ trống trơn. Bạn cần vào Auth -> Add User 
-- trên Supabase Dashboard để tạo lại tài khoản Admin mới.
-- ===================================================
