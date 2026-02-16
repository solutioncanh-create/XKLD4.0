# Hướng Dẫn Cập Nhật Ứng Dụng Lên Vercel

Tài liệu này hướng dẫn chi tiết cách đưa phiên bản mới nhất của ứng dụng Quản lý XKLD lên Vercel.

---

## 🚀 Cách 1: Sử dụng Script Tự Động (Khuyên Dùng)

Đây là cách nhanh nhất, tôi đã chuẩn bị sẵn file chạy cho bạn.

1. **Mở Terminal** (trong VS Code hoặc CMD).
2. Chạy lệnh sau:
   ```cmd
   .\deploy_vercel.bat
   ```
3. **Lần đầu tiên**:
   - Trình duyệt sẽ mở ra và yêu cầu bạn đăng nhập vào Vercel. Hãy đăng nhập bằng GitHub hoặc Email.
   - Quay lại Terminal, nếu nó hỏi "Set up and deploy?", hãy nhấn **Enter** (chọn Yes).
   - Chọn Scope (nhấn Enter).
   - Link existing project? **No** (nếu mới) hoặc **Yes** (nếu đã có).
4. **Các lần sau**:
   - Chỉ cần chạy lệnh trên, đợi chạy xong là Web sẽ tự động cập nhật.

---

## 🛠 Cách 2: Làm Thủ Công (Nếu script lỗi)

Nếu bạn muốn gõ lệnh từng bước để kiểm soát:

1. **Đăng nhập Vercel** (chỉ cần làm 1 lần):
   ```bash
   npx vercel login
   ```

2. **Build & Deploy**:
   Chạy lệnh sau để đẩy lên môi trường Production (Thực tế):
   ```bash
   npx vercel --prod
   ```
   - Nếu được hỏi các câu hỏi cài đặt, cứ nhấn **Enter** để chọn mặc định.

---

## 🔗 Cách 3: Tự Động Qua GitHub (Nếu có dùng Git)

Nếu bạn đã kết nối dự án này với GitHub:

1. Chỉ cần **Commit** và **Push** code lên nhánh `main`.
2. Vercel sẽ tự động phát hiện thay đổi và cập nhật web sau khoảng 1-2 phút.

---

## ⚠️ Lưu Ý Quan Trọng: Biến Môi Trường (.env)

Để App hoạt động đúng trên Vercel (kết nối được Supabase), bạn cần cài đặt 2 biến này trên trang quản trị Vercel:

1. Vào [Vercel Dashboard](https://vercel.com/dashboard) -> Chọn Dự Án.
2. Vào **Settings** -> **Environment Variables**.
3. Thêm 2 biến sau (Lấy giá trị từ file `.env` ở máy bạn):
   - Key: `VITE_SUPABASE_URL` | Value: (Copy từ .env)
   - Key: `VITE_SUPABASE_ANON_KEY` | Value: (Copy từ .env)
4. Sau khi thêm biến, bạn cần **Redeploy** (Triển khai lại) để áp dụng.

---

**Kiểm tra:**
Sau khi deploy xong, hãy mở link web (dạng `quan-ly-xkld.vercel.app`) và nhấn `Ctrl + F5` để xóa cache và tải bản mới nhất.
