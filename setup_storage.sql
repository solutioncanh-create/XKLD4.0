-- Chạy đoạn này trong Supabase SQL Editor để tạo và cấu hình Bucket 'avatars'

-- 1. Tạo Bucket 'avatars' (Công khai)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Cho phép mọi người (kể cả khách chưa đăng nhập) UPLOAD và XEM ảnh trong 'avatars'
create policy "Mọi người có thể xem ảnh avatars"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Mọi người có thể upload ảnh avatars"
on storage.objects for insert
with check ( bucket_id = 'avatars' );

create policy "Mọi người có thể sửa ảnh avatars"
on storage.objects for update
using ( bucket_id = 'avatars' );

create policy "Mọi người có thể xóa ảnh avatars"
on storage.objects for delete
using ( bucket_id = 'avatars' );
