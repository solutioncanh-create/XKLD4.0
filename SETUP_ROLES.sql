-- 1. Tạo bảng phân quyền (admin_roles)
create table if not exists public.admin_roles (
  id uuid references auth.users not null primary key,
  email text,
  role text default 'staff', -- Các quyền: 'super_admin', 'admin', 'staff'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Bật bảo mật RLS
alter table public.admin_roles enable row level security;

-- 3. Cho phép tất cả người dùng đã đăng nhập xem bảng này (để lấy quyền của chính mình)
create policy "Allow read roles" on public.admin_roles for select using (auth.role() = 'authenticated');

-- 4. Tự động thêm quyền 'staff' khi có tài khoản mới đăng ký
create or replace function public.handle_new_admin()
returns trigger as $$
begin
  insert into public.admin_roles (id, email, role)
  values (new.id, new.email, 'staff');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_admin();

-- 5. CẬP NHẬT QUYỀN CHO CÁC TÀI KHOẢN ĐÃ CÓ (quan trọng cho trường hợp của bạn)
insert into public.admin_roles (id, email, role)
select id, email, 'staff' from auth.users
where id not in (select id from public.admin_roles);

-- SAU KHI CHẠY CODE NÀY:
-- Vào Table "admin_roles", sửa cột role của email bạn muốn làm Super Admin thành 'super_admin'.
