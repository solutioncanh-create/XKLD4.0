# Hướng Dẫn Phân Quyền Quản Trị Viên (Staff vs Admin)

Để phân quyền cho 2 tài khoản bạn đã tạo, hãy làm theo các bước sau:

## Bước 1: Chạy lệnh tạo bảng phân quyền
Bạn cần chạy lệnh SQL để tạo bảng lưu trữ quyền hạn (admin_roles) trên Supabase.

1. Vào **Supabase Dashboard** > **SQL Editor**.
2. Tạo một **New Query**.
3. Copy toàn bộ nội dung từ file `SETUP_ROLES.sql` trong dự án và dán vào đó.
   - *Lệnh này sẽ tạo bảng `admin_roles` và tự động thêm 2 tài khoản hiện có của bạn vào với quyền mặc định là `staff`.*
4. Nhấn **Run**.

## Bước 2: Cấp quyền (Super Admin / Admin)
Sau khi chạy lệnh trên, 2 tài khoản của bạn đang có quyền thấp nhất là `staff`. Bạn cần nâng quyền thủ công cho tài khoản chính.

1. Vào **Supabase Dashboard** > **Table Editor**.
2. Chọn bảng `admin_roles`.
3. Bạn sẽ thấy danh sách email của 2 tài khoản.
4. Tại cột `role`, hãy sửa giá trị:
   - Tài khoản chính (Chủ): Sửa thành `super_admin`.
   - Tài khoản phụ (Nhân viên): Để nguyên là `staff` hoặc sửa thành `admin` (nếu muốn quyền quản lý nhưng không full quyền).

## Bước 3: Kiểm tra
1. Quay lại trang đăng nhập: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
2. Đăng nhập bằng tài khoản **Super Admin**.
3. Hệ thống sẽ tự động nhận diện quyền và cho phép bạn truy cập đầy đủ tính năng.
4. Nếu đăng nhập bằng tài khoản **Staff**, một số tính năng nhạy cảm (như Xóa dữ liệu, Xuất file Excel...) có thể sẽ bị ẩn hoặc chặn (tùy theo logic code trong `src/utils/auth.js`).

---
**Lưu ý:**
- **super_admin**: Toàn quyền hệ thống.
- **admin**: Quản lý hầu hết các mục, trừ các cấu hình nhạy cảm.
- **staff**: Chỉ xem và xử lý cơ bản, không được xóa dữ liệu quan trọng.
