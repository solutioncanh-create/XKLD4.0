import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { getUserRole } from '../utils/auth'

const MenuItem = ({ to, icon, label, badge, onClick }) => {
    const location = useLocation()
    const currentPath = location.pathname
    const isActive = currentPath === to || (to !== '/admin' && currentPath.startsWith(to))

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 mb-1.5 group font-medium
            ${isActive ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
        `}>
            <span className={`material-icons-outlined text-2xl transition-transform group-hover:scale-110 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'}`}>{icon}</span>
            <span className="flex-1 text-sm md:text-base">{label}</span>
            {badge && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">{badge}</span>}
        </Link>
    )
}

const SidebarContent = ({ onClose, adminStats, role }) => (
    <div className="flex flex-col h-full">
        <Link to="/" className="h-20 flex items-center px-6 border-b border-gray-100 shrink-0 bg-white/50 backdrop-blur-sm group hover:bg-gray-50 transition-colors">
            <span className="text-3xl font-black text-gray-800 tracking-tighter group-hover:text-primary-700 transition-colors">XKLD <span className="inline-block bg-gradient-to-r from-yellow-400 to-red-600 text-transparent bg-clip-text">ADMIN</span></span>
        </Link>

        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide space-y-8">
            <div>
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quản lý</p>
                <MenuItem to="/admin/yeu-cau-tu-van" icon="mark_email_unread" label="Yêu cầu tư vấn" onClick={onClose} />
                <MenuItem to="/admin/ho-so" icon="people" label="Hồ sơ ứng viên" badge={adminStats?.pending > 0 ? adminStats.pending : null} onClick={onClose} />
                <MenuItem to="/admin/don-hang" icon="work_outline" label="Đơn hàng" onClick={onClose} />
                <MenuItem to="/admin/ghep-don" icon="group_add" label="Ghép đơn thi" onClick={onClose} />

            </div>

            <div>
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Hệ thống</p>
                <MenuItem to="/" icon="home" label="Home" onClick={onClose} />
                <MenuItem to="/admin/tai-khoan" icon="manage_accounts" label="Tài khoản" onClick={onClose} />
                <MenuItem to="/admin/cai-dat" icon="settings" label="Cài đặt" onClick={onClose} />
                <MenuItem to="/admin/login" icon="logout" label="Đăng xuất" onClick={() => {
                    // Add logout logic here (e.g., supabase.auth.signOut())
                    localStorage.removeItem('sb-access-token'); // Simple clear for now if using local storage
                    onClose && onClose()
                }} />
            </div>
        </div>

        <div className="p-5 border-t border-gray-100 shrink-0 bg-gray-50/30">
            <div
                className="flex items-center gap-3 p-2 rounded-xl"
            >
                <div className="relative">
                    <img src={`https://ui-avatars.com/api/?name=${role === 'super_admin' ? 'Super Admin' : 'Admin'}&background=${role === 'super_admin' ? '0d9488' : '6366f1'}&color=fff`} alt="Admin" className="w-12 h-12 rounded-xl shadow-sm object-cover" />
                    <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${role === 'super_admin' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 uppercase text-xs tracking-wider">
                        {role === 'super_admin' ? 'Quản trị cấp cao' : 'Quản trị viên'}
                    </p>
                </div>
            </div>
        </div>
    </div>
)

export default function AdminLayout({ adminStats }) {
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const [role, setRole] = useState(getUserRole())

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
            {/* --- SIDEBAR DESKTOP --- */}
            <aside className="w-72 bg-white border-r border-gray-100 flex-col hidden md:flex shrink-0 z-20 shadow-xl shadow-gray-200/50">
                <SidebarContent adminStats={adminStats} role={role} />
            </aside>

            {/* --- SIDEBAR MOBILE OVERLAY --- */}
            {isMobileSidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setMobileSidebarOpen(false)}></div>
                    <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl animate-fade-in-right">
                        <button onClick={() => setMobileSidebarOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600">
                            <span className="material-icons-outlined text-2xl">close</span>
                        </button>
                        <SidebarContent onClose={() => setMobileSidebarOpen(false)} adminStats={adminStats} role={role} />
                    </aside>
                </div>
            )}


            {/* --- MAIN CONTENT WRAPPER --- */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-gray-50">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 z-10 shrink-0 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="md:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-xl transition-colors active:scale-95"
                        >
                            <span className="material-icons-outlined text-2xl">menu</span>
                        </button>
                        <h2 className="text-2xl font-black text-gray-800 capitalize hidden sm:block tracking-tight">Tổng Quan</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block group">
                            <input type="text" placeholder="Tìm kiếm nhanh..." className="pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white w-64 transition-all group-hover:w-80 font-medium" />
                            <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400 text-xl pointer-events-none">search</span>
                        </div>
                        <button className="relative p-2.5 text-gray-500 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all active:scale-95">
                            <span className="material-icons-outlined text-2xl">notifications</span>
                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        </button>
                    </div>
                </header>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth relative no-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
