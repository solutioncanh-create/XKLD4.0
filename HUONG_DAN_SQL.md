# Hướng Dẫn Thêm Cột Mã Hồ Sơ

Hiện tại tính năng nhập "Mã hồ sơ" đang bị lỗi do cơ sở dữ liệu chưa có cột `ma_ho_so`.
Bạn vui lòng thực hiện các bước sau để thêm cột này vào database trên Supabase:

1. Truy cập vào **Supabase Dashboard** của dự án: [https://supabase.com/dashboard/project/pcczqwoytkpveegtfoee](https://supabase.com/dashboard/project/pcczqwoytkpveegtfoee)
2. Vào mục **SQL Editor** (biểu tượng 2 dấu ngoặc nhọn bên trái).
3. Tạo một **New Query**.
4. Copy đoạn lệnh SQL dưới đây và paste vào:

```sql
ALTER TABLE ho_so ADD COLUMN IF NOT EXISTS ma_ho_so TEXT;
```

5. Nhấn **Run**.
6. Sau khi chạy thành công (Success), quay lại ứng dụng và thử lại.

Nếu bạn gặp khó khăn, hãy cho tôi biết!
