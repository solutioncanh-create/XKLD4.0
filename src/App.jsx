import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DangKy from './pages/DangKy'
import ChiTietHoSo from './pages/ChiTietHoSo'
import HomePage from './pages/HomePage'
import JobBoard from './pages/JobBoard'
import JobDetail from './pages/JobDetail'
import HoSoPrintTemplate from './pages/HoSoPrintTemplate'
import HoSoPrintTemplateJP from './pages/HoSoPrintTemplateJP'
import Navbar from './Navbar'

// Admin Pages
import AdminLayout from './layouts/AdminLayout'
import DashboardHome from './pages/admin/DashboardHome'
import HoSoManager from './pages/admin/HoSoManager'
import DonHangManager from './pages/admin/DonHangManager'
import OrderMatching from './pages/admin/OrderMatching'
import YeuCauTuVanManager from './pages/admin/YeuCauTuVanManager'
import DanhSachThiTuyenPrint from './pages/admin/DanhSachThiTuyenPrint'

import YeuCauTuVan from './pages/YeuCauTuVan'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES - Có Navbar */}
        <Route path="/" element={<><Navbar /><HomePage /></>} />
        <Route path="/viec-lam" element={<><Navbar /><JobBoard /></>} />
        <Route path="/viec-lam/:id" element={<><Navbar /><JobDetail /></>} />
        <Route path="/yeu-cau-tu-van" element={<YeuCauTuVan />} />
        <Route path="/dang-ky" element={<><Navbar /><DangKy /></>} />
        <Route path="/sua-ho-so/:id" element={<><Navbar /><DangKy /></>} />
        <Route path="/ho-so/:id" element={<><Navbar /><ChiTietHoSo /></>} />
        <Route path="/in-ho-so/:id" element={<HoSoPrintTemplate />} />
        <Route path="/in-ho-so-jp/:id" element={<HoSoPrintTemplateJP />} />
        <Route path="/in-danh-sach-pv/:id" element={<DanhSachThiTuyenPrint />} />

        {/* ADMIN ROUTES - Dùng AdminLayout riêng */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="yeu-cau-tu-van" element={<YeuCauTuVanManager />} />
          <Route path="ho-so" element={<HoSoManager />} />
          <Route path="don-hang" element={<DonHangManager />} />
          <Route path="ghep-don" element={<OrderMatching />} />

          <Route path="thong-ke" element={<div className="text-center py-20 bg-white m-6 rounded-xl shadow-sm"><span className="material-icons-outlined text-6xl text-gray-200 block mb-4">insights</span><h3 className="text-xl font-bold text-gray-400">Đang xây dựng Thống kê</h3></div>} />
          <Route path="tai-khoan" element={<div className="text-center py-20 bg-white m-6 rounded-xl shadow-sm"><span className="material-icons-outlined text-6xl text-gray-200 block mb-4">manage_accounts</span><h3 className="text-xl font-bold text-gray-400">Đang xây dựng Quản lý Tài khoản</h3></div>} />
          <Route path="cai-dat" element={<div className="text-center py-20 bg-white m-6 rounded-xl shadow-sm"><span className="material-icons-outlined text-6xl text-gray-200 block mb-4">settings</span><h3 className="text-xl font-bold text-gray-400">Đang xây dựng Cấu hình</h3></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
