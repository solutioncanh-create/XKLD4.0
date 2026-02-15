# Quy Trình Phát Triển & Triển Khai (Workflow)

Dự án này sử dụng quy trình phát triển như sau:

## 1. Source Code & Deployment
- **Repository**: GitHub
- **Deployment**: Vercel (Tự động deploy khi có commit mới vào nhánh `main`)
- **Local Development**: 
  - Chạy `npm run dev` để phát triển.
  - Sau khi hoàn thành tính năng/fix bug:
    ```bash
    git add .
    git commit -m "Mô tả thay đổi"
    git push origin main
    ```

## 2. Database (Supabase)
- **Cơ sở dữ liệu**: PostgreSQL trên Supabase.
- **Quản lý Schema**: 
  - Không có migration tự động từ code.
  - Mọi thay đổi về cấu trúc bảng (thêm cột, tạo bảng mới) phải được thực hiện thủ công bằng **SQL Editor** trên Supabase Dashboard.
  - Các câu lệnh SQL cập nhật nên được lưu lại trong file `UPDATE_DATABASE.sql` hoặc tương tự để tham khảo.

## 3. Lưu ý Quan trọng
- Khi thêm một trường dữ liệu mới trong Code (ví dụ: thêm `nickname` vào form):
  1. Cập nhật Code (React Components).
  2. Tạo/Cập nhật file `.sql` chứa lệnh `ALTER TABLE` tương ứng.
  3. **BẮT BUỘC**: Chạy lệnh SQL đó trên Supabase Dashboard.
  4. Commit và Push code lên GitHub.

---
*File này được tạo để nhắc nhở quy trình phát triển đồng nhất.*
