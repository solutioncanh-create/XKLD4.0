import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { getUserRole } from '../utils/auth'
import { Globe } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useState, useEffect, useRef } from 'react'

const NavItem = ({ to, icon, label, badge, exact = false, onClick }) => {
    const location = useLocation()
    const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 relative
            ${isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
        `}>
            {icon && <span className={`material-icons-outlined text-[20px] ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>{icon}</span>}
            <span>{label}</span>
            {badge && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold shadow-sm ring-2 ring-white">
                    {badge}
                </span>
            )}
        </Link>
    )
}

export default function AdminLayout({ adminStats }) {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
    const role = getUserRole()
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('sb-access-token');
        window.location.href = '/login';
    }

    // --- SMART SEARCH LOGIC ---
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState({ hoso: [], donhang: [] })
    const [showResults, setShowResults] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const searchRef = useRef(null)

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!searchTerm.trim()) {
                setSearchResults({ hoso: [], donhang: [] })
                return
            }

            setIsSearching(true)
            setShowResults(true)
            try {
                const [hosoIn, donhangIn] = await Promise.all([
                    supabase.from('ho_so')
                        .select('id, ho_ten, anh_ho_so, trang_thai, nganh_nghe_mong_muon, so_dien_thoai')
                        .or(`ho_ten.ilike.%${searchTerm}%,so_dien_thoai.ilike.%${searchTerm}%`)
                        .limit(5),
                    supabase.from('don_hang')
                        .select('id, ten_don_hang, muc_luong, dia_diem_lam_viec')
                        .ilike('ten_don_hang', `%${searchTerm}%`)
                        .limit(3)
                ])
                setSearchResults({
                    hoso: hosoIn.data || [],
                    donhang: donhangIn.data || []
                })
            } catch (error) {
                console.error(error)
            } finally {
                setIsSearching(false)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm])

    const handleResultClick = (path) => {
        navigate(path)
        setShowResults(false)
        setSearchTerm('')
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            {/* --- TOPBAR NAVIGATION (APP STYLE) --- */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 px-4 shadow-sm flex items-center justify-between transition-all">

                {/* LEFT: Logo & Desktop Nav */}
                <div className="flex items-center gap-4 lg:gap-8">
                    <Link to="/admin" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-300">
                            <Globe className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors hidden sm:block">
                            XKLD <span className="text-emerald-600">4.0</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">


                        <div className="w-px h-6 bg-gray-200 mx-2"></div>

                        <NavItem to="/admin/ho-so" icon="people" label="Hồ sơ" badge={adminStats?.pending} />
                        <NavItem to="/admin/don-hang" icon="work_outline" label="Đơn hàng" />
                        <NavItem to="/admin/yeu-cau-tu-van" icon="mark_email_unread" label="Tư vấn" />
                        <NavItem to="/admin/ghep-don" icon="group_add" label="Ghép đơn" />
                    </nav>
                </div>

                {/* RIGHT: Global Actions */}
                <div className="flex items-center gap-2 lg:gap-4">
                    {/* Search Bar - Compact */}
                    {/* Search Bar - Smart Search */}
                    <div ref={searchRef} className="hidden md:block relative z-50">
                        <div className="flex bg-gray-100/80 hover:bg-white focus-within:bg-white border border-transparent focus-within:border-emerald-500/30 rounded-full px-3 py-1.5 transition-all w-[200px] focus-within:w-[320px] focus-within:shadow-lg h-10 items-center group cursor-text" onClick={() => document.getElementById('global-search').focus()}>
                            <span className={`material-icons-outlined text-lg transition-colors ${isSearching ? 'animate-spin text-emerald-500' : 'text-gray-400 group-hover:text-emerald-500'}`}>
                                {isSearching ? 'autorenew' : 'search'}
                            </span>
                            <input
                                id="global-search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchTerm && setShowResults(true)}
                                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-700 font-medium placeholder-gray-400"
                                placeholder="Tìm hồ sơ, đơn hàng..."
                                autoComplete="off"
                            />
                            {searchTerm && (
                                <button onClick={() => { setSearchTerm(''); setSearchResults({ hoso: [], donhang: [] }) }} className="text-gray-400 hover:text-gray-600">
                                    <span className="material-icons-outlined text-base">close</span>
                                </button>
                            )}
                        </div>

                        {/* Dropdown Results */}
                        {showResults && (searchTerm.length > 0) && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up max-h-[80vh] overflow-y-auto">
                                {!isSearching && searchResults.hoso.length === 0 && searchResults.donhang.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">Không tìm thấy kết quả nào</div>
                                ) : (
                                    <>
                                        {/* HỒ SƠ */}
                                        {searchResults.hoso.length > 0 && (
                                            <div className="py-2">
                                                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">Hồ sơ ứng viên</div>
                                                {searchResults.hoso.map(item => (
                                                    <div key={item.id} onClick={() => handleResultClick(`/ho-so/${item.id}`)} className="px-3 py-2 hover:bg-emerald-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0">
                                                        <img src={item.anh_ho_so || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full object-cover border border-gray-200" alt="" />
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-gray-800 truncate">{item.ho_ten}</p>
                                                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                                <span className="truncate max-w-[80px] text-emerald-600 font-medium">{item.nganh_nghe_mong_muon}</span>
                                                                <span>•</span>
                                                                <span>{item.so_dien_thoai}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* ĐƠN HÀNG */}
                                        {searchResults.donhang.length > 0 && (
                                            <div className="py-2 border-t border-gray-100">
                                                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">Đơn hàng</div>
                                                {searchResults.donhang.map(item => (
                                                    <div key={item.id} onClick={() => handleResultClick(`/admin/don-hang?edit=${item.id}`)} className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0">
                                                        <div className="flex items-start gap-2">
                                                            <span className="material-icons-outlined text-blue-500 text-lg mt-0.5">work_outline</span>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-gray-800 truncate">{item.ten_don_hang}</p>
                                                                <p className="text-[10px] text-gray-500">{item.dia_diem_lam_viec} • {parseInt(item.muc_luong).toLocaleString()}¥</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <Link to="/" className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors tooltip" title="Về trang chủ">
                            <span className="material-icons-outlined text-xl">home</span>
                        </Link>

                        {/* ADMIN PROFILE */}
                        <div className="relative group ml-1">
                            <button className="flex items-center gap-2.5 pl-1 pr-1.5 py-1 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all">
                                <img src={`https://ui-avatars.com/api/?name=${role === 'super_admin' ? 'Super Admin' : 'Admin'}&background=10b981&color=fff`} className="w-8 h-8 rounded-full shadow-sm" alt="Avatar" />
                                <div className="hidden xl:block text-left">
                                    <p className="text-xs font-bold text-gray-900 leading-none">{role === 'super_admin' ? 'Quản trị viên' : 'Nhân viên'}</p>
                                    <p className="text-[10px] text-green-600 font-bold leading-none mt-1">● Online</p>
                                </div>
                                <span className="material-icons-outlined text-gray-400 text-sm hidden xl:block">expand_more</span>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 hidden group-hover:block animate-fade-in-up origin-top-right">
                                <div className="px-3 py-2 border-b border-gray-50 mb-1">
                                    <p className="text-sm font-bold text-gray-900">Tài khoản</p>
                                    <p className="text-xs text-gray-500 truncate">{role}@xkld.app</p>
                                </div>
                                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors">
                                    <span className="material-icons-outlined text-lg">logout</span> Đăng xuất
                                </button>
                            </div>
                        </div>

                        {/* Mobile Toggle */}
                        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100">
                            <span className="material-icons-outlined text-2xl">menu</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT SPACE */}
            <main className="pt-20 px-4 min-h-screen pb-10 max-w-[1920px] mx-auto transition-all animate-fade-in">
                <Outlet />
            </main>

            {/* MOBILE MENU FULLSCREEN OVERLAY */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)}></div>

                    {/* Menu Content */}
                    <div className="absolute top-0 right-0 bottom-0 w-[280px] bg-white shadow-2xl animate-slide-in-right flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <span className="text-lg font-black text-gray-800">MENU</span>
                            <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-500 shadow-sm border border-gray-100">
                                <span className="material-icons-outlined text-lg">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-2 mt-2">Ứng dụng</p>

                            <NavItem onClick={() => setMobileMenuOpen(false)} to="/admin/ho-so" icon="people" label="Hồ sơ ứng viên" badge={adminStats?.pending} />
                            <NavItem onClick={() => setMobileMenuOpen(false)} to="/admin/don-hang" icon="work_outline" label="Đơn hàng" />
                            <NavItem onClick={() => setMobileMenuOpen(false)} to="/admin/yeu-cau-tu-van" icon="mark_email_unread" label="Yêu cầu tư vấn" />
                            <NavItem onClick={() => setMobileMenuOpen(false)} to="/admin/ghep-don" icon="group_add" label="Ghép đơn thi" />

                            <div className="my-4 border-t border-gray-100"></div>
                            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm text-red-600 hover:bg-red-50 transition-colors">
                                <span className="material-icons-outlined text-[20px]">logout</span>
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
