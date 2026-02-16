# Hướng dẫn Triển khai Ứng dụng Quản lý XKLD

Ứng dụng đã được đóng gói thành công vào thư mục `dist`. Bạn có thể triển khai thư mục này lên bất kỳ nền tảng Hosting nào hỗ trợ Static Site (React/Vite).

## 1. Triển khai lên Vercel (Khuyên dùng)
Đây là cách nhanh và ổn định nhất.
1. Đăng nhập vào [Vercel](https://vercel.com).
2. Chọn "Add New Project".
3. Import Repository của dự án này (nếu đã đẩy lên GitHub/GitLab).
4. Vercel sẽ tự động nhận diện Vite.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Nhấn "Deploy".

## 2. Triển khai lên Netlify
1. Kéo thả thư mục `dist` vào trang Deploy của Netlify.
2. Hoặc kết nối Git tương tự như Vercel.

## 3. Chạy trên Server riêng (Nginx/Apache)
Copy toàn bộ nội dung trong thư mục `dist` vào thư mục gốc của Web Server (vd: `/var/www/html`).
Cần cấu hình Server để hỗ trợ SPA (Single Page Application) - chuyển hướng mọi request về `index.html`.

**Ví dụ Nginx Config:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 4. Chạy thử nghiệm Local (Production Preview)
Nếu muốn kiểm tra phiên bản đã đóng gói ngay trên máy tính này:
1. Mở terminal tại thư mục dự án.
2. Chạy lệnh:
   ```bash
   npm run preview
   ```
3. Truy cập địa chỉ được hiển thị (thường là `http://localhost:4173`).

---
**Lưu ý:**
- Đảm bảo các biến môi trường trong file `.env` đã được cấu hình đúng trên Server (nếu cần). Với Static Site, các biến bắt đầu bằng `VITE_` sẽ được bake vào code lúc build, nên cần khai báo Environment Variables trên Dashboard của Vercel/Netlify trước khi bấm Build.
