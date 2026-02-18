# HƯỚNG DẪN XUẤT BẢN APP (PRODUCTION)

## 1. Kiểm tra Build
Trước khi deploy, hãy chạy lệnh sau để đảm bảo không có lỗi:
```bash
npm run build
```
Kết quả build sẽ nằm trong thư mục `dist`.

## 2. Deploy lên Vercel (Khuyên dùng)
- **Bước 1:** Đẩy code lên GitHub/GitLab.
- **Bước 2:** Đăng nhập Vercel -> New Project -> Import Repository.
- **Bước 3:** Cấu hình **Environment Variables** (Quan trọng):
  Add các biến sau vào phần Settings > Environment Variables trên Vercel:
  
  - `VITE_SUPABASE_URL`: (Lấy từ project Supabase của bạn)
  - `VITE_SUPABASE_ANON_KEY`: (Lấy từ project Supabase của bạn)
  - `VITE_GOOGLE_API_KEY`: (API Key cho Google Gemini/Vision)

- **Bước 4:** Deploy. Vercel sẽ tự động detect `vite` và cấu hình build.
- **Lưu ý:** File `vercel.json` đã được cấu hình sẵn để xử lý Routing (F5 không lỗi 404).

## 3. Deploy lên Netlify
- **Bước 1:** Đẩy code lên GitHub hoặc Drag & Drop thư mục `dist` (sau khi build manual).
- **Bước 2:** Nếu connect GitHub, vào Site Settings -> Build & Deploy -> Environment -> Edit Variables để thêm các biến môi trường như trên.
- **Lưu ý:** File `public/_redirects` đã được tạo sẵn để xử lý Routing trên Netlify.

## 4. Deploy thủ công (VPS/Hosting thường)
- Build app: `npm run build`
- Upload toàn bộ nội dung trong thư mục `dist` lên server (public_html).
- Cấu hình Web Server (Nginx/Apache) để rewrite tất cả request về `index.html`.
  *Ví dụ Nginx:* `try_files $uri $uri/ /index.html;`

## 5. Checklist trước khi "Go Live"
- [x] Title & Meta description (`index.html`)
- [x] Routing configuration (`vercel.json`, `_redirects`)
- [ ] Kiểm tra lại các biến môi trường (Environment Variables) trên Server.
- [ ] Kiểm tra tính năng Upload ảnh và Database connection trên môi trường thật.

Chúc bạn thành công! 🚀
