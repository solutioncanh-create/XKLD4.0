import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
    const location = useLocation()
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
    const isActive = (path) => location.pathname === path

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center gap-12">
                        {/* LOGO */}
                        <Link to="/" className="flex-shrink-0 flex items-center group" onClick={() => setMobileMenuOpen(false)}>
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-2 shadow-lg shadow-primary-200 group-hover:scale-105 transition-transform">
                                <span className="material-icons-outlined text-white text-2xl">public</span>
                            </div>
                            <span className="text-2xl font-black text-gray-800 group-hover:text-primary-600 transition-colors">
                                XKLD <span className="inline-block bg-gradient-to-r from-yellow-400 to-red-600 text-transparent bg-clip-text pb-1 pr-1">4.0</span>
                            </span>
                        </Link>

                        {/* DESKTOP MENU */}
                        <div className="hidden md:flex space-x-1">
                            <NavLink to="/" label="Trang Chủ" icon="home" active={isActive('/')} />
                            <NavLink to="/viec-lam" label="Việc Làm" icon="work_outline" active={isActive('/viec-lam')} badge="Hot" />
                            <NavLink to="/dang-ky" label="Đăng Ký Hồ Sơ" icon="assignment_turned_in" active={isActive('/dang-ky')} />
                        </div>
                    </div>

                    {/* RIGHT ACTIONS (Desktop) */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin/login"
                            className="hidden sm:flex text-gray-500 hover:text-primary-700 px-4 py-2 rounded-full text-sm font-bold items-center gap-2 transition-all hover:bg-gray-100 border border-transparent hover:border-gray-200"
                        >
                            <span className="material-icons-outlined text-xl">admin_panel_settings</span>
                            Quản Trị Viên
                        </Link>

                        {/* MOBILE MENU TOGGLE */}
                        <button
                            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden text-gray-500 hover:text-primary-600 focus:outline-none p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <span className="material-icons-outlined text-3xl transition-transform duration-300 transform">
                                {isMobileMenuOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU DROPDOWN */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute top-20 left-0 right-0 shadow-xl py-4 px-4 flex flex-col space-y-2 animate-fade-in-up h-[calc(100vh-5rem)] overflow-y-auto z-40">
                    <NavLinkMobile to="/" label="Trang Chủ" icon="home" onClick={() => setMobileMenuOpen(false)} active={isActive('/')} />
                    <NavLinkMobile to="/viec-lam" label="Việc Làm" icon="work_outline" onClick={() => setMobileMenuOpen(false)} active={isActive('/viec-lam')} badge="Hot" />
                    <NavLinkMobile to="/dang-ky" label="Đăng Ký Hồ Sơ" icon="assignment_turned_in" onClick={() => setMobileMenuOpen(false)} active={isActive('/dang-ky')} />

                    <div className="border-t border-gray-100 my-2 pt-2">
                        <Link
                            to="/admin/login"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="material-icons-outlined text-xl">admin_panel_settings</span>
                            Quản Trị Viên
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}

function NavLink({ to, label, icon, active, badge }) {
    return (
        <Link
            to={to}
            className={`relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 group
                ${active
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }
            `}
        >
            <span className={`material-icons-outlined mr-2 text-lg ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500 transition-colors'}`}>{icon}</span>
            {label}
            {badge && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">{badge}</span>}
        </Link>
    )
}

function NavLinkMobile({ to, label, icon, onClick, active, badge }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`relative flex items-center gap-4 px-4 py-3 rounded-xl text-base font-bold transition-all duration-200
                ${active
                    ? 'text-primary-700 bg-primary-50 border border-primary-100 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }
            `}
        >
            <span className={`material-icons-outlined text-2xl ${active ? 'text-primary-600' : 'text-gray-400'}`}>{icon}</span>
            {label}
            {badge && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">{badge}</span>}
        </Link>
    )
}
