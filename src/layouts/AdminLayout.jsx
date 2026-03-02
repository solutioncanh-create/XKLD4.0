import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getUserRole } from '../utils/auth'
import { Globe, Search, Home, LogOut, Menu, X, Users, Briefcase, MessageCircle, GitMerge, ChevronDown, Bell } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useState, useEffect, useRef } from 'react'

const NavItem = ({ to, icon: Icon, label, badge, exact = false, onClick }) => {
    const location = useLocation()
    const isActive = exact ? location.pathname === to : location.pathname.startsWith(to)

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`adml-nav-item ${isActive ? 'active' : ''}`}
        >
            {Icon && <Icon size={15} className="adml-nav-icon" />}
            <span>{label}</span>
            {badge && (
                <span className="adml-nav-badge">{badge}</span>
            )}
        </Link>
    )
}

export default function AdminLayout({ adminStats }) {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
    const role = getUserRole()
    const navigate = useNavigate()

    const handleLogout = () => {
        supabase.auth.signOut()
        localStorage.removeItem('user_role')
        window.location.href = '/login'
    }

    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState({ hoso: [], donhang: [] })
    const [showResults, setShowResults] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const searchRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!searchTerm.trim()) {
                setSearchResults({ hoso: [], donhang: [] })
                setShowResults(false)
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
                setSearchResults({ hoso: hosoIn.data || [], donhang: donhangIn.data || [] })
            } catch (err) { console.error(err) }
            finally { setIsSearching(false) }
        }, 400)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const handleResultClick = (path) => {
        navigate(path)
        setShowResults(false)
        setSearchTerm('')
    }

    return (
        <div className="adml-root">
            {/* TOPBAR */}
            <header className="adml-topbar">
                <div className="adml-topbar-left">
                    <Link to="/admin" className="adml-brand">
                        <div className="adml-brand-icon">
                            <Globe size={18} />
                        </div>
                        <span className="adml-brand-text">XKLD <span>4.0</span></span>
                    </Link>

                    <div className="adml-sep" />

                    <nav className="adml-desktop-nav">
                        <NavItem to="/admin/ho-so" icon={Users} label="Hồ sơ" badge={adminStats?.pending} />
                        <NavItem to="/admin/don-hang" icon={Briefcase} label="Đơn hàng" />
                        <NavItem to="/admin/yeu-cau-tu-van" icon={MessageCircle} label="Tư vấn" />
                        <NavItem to="/admin/ghep-don" icon={GitMerge} label="Ghép đơn" />
                    </nav>
                </div>

                <div className="adml-topbar-right">
                    {/* Smart Search */}
                    <div ref={searchRef} className="adml-search-wrap">
                        <div className="adml-search-box">
                            <Search size={14} className={`adml-search-icon ${isSearching ? 'spinning' : ''}`} />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchTerm && setShowResults(true)}
                                className="adml-search-input"
                                placeholder="Tìm hồ sơ, đơn hàng..."
                                autoComplete="off"
                            />
                            {searchTerm && (
                                <button onClick={() => { setSearchTerm(''); setSearchResults({ hoso: [], donhang: [] }); setShowResults(false) }} className="adml-search-clear">
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        {showResults && searchTerm.length > 0 && (
                            <div className="adml-search-dropdown">
                                {!isSearching && searchResults.hoso.length === 0 && searchResults.donhang.length === 0 ? (
                                    <div className="adml-search-empty">Không tìm thấy kết quả nào</div>
                                ) : (
                                    <>
                                        {searchResults.hoso.length > 0 && (
                                            <div className="adml-search-group">
                                                <p className="adml-search-group-label">Hồ sơ ứng viên</p>
                                                {searchResults.hoso.map(item => (
                                                    <div key={item.id} onClick={() => handleResultClick(`/ho-so/${item.id}`)} className="adml-search-item">
                                                        <img src={item.anh_ho_so || `https://ui-avatars.com/api/?name=${item.ho_ten}&background=d1fae5&color=065f46&size=40`} className="adml-search-avatar" alt="" />
                                                        <div>
                                                            <p className="adml-search-name">{item.ho_ten}</p>
                                                            <p className="adml-search-meta">{item.nganh_nghe_mong_muon || 'Chưa chọn ngành'} · {item.so_dien_thoai}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {searchResults.donhang.length > 0 && (
                                            <div className="adml-search-group" style={{ borderTop: '1px solid #f1f5f9' }}>
                                                <p className="adml-search-group-label">Đơn hàng</p>
                                                {searchResults.donhang.map(item => (
                                                    <div key={item.id} onClick={() => handleResultClick(`/admin/don-hang?edit=${item.id}`)} className="adml-search-item">
                                                        <div className="adml-search-job-icon">
                                                            <Briefcase size={13} />
                                                        </div>
                                                        <div>
                                                            <p className="adml-search-name">{item.ten_don_hang}</p>
                                                            <p className="adml-search-meta">{item.dia_diem_lam_viec} · {parseInt(item.muc_luong || 0).toLocaleString()}¥</p>
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

                    {/* Bell */}
                    <button className="adml-icon-btn" title="Thông báo">
                        <Bell size={17} />
                        <span className="adml-notif-dot" />
                    </button>

                    {/* Home */}
                    <Link to="/" className="adml-icon-btn" title="Trang chủ">
                        <Home size={17} />
                    </Link>

                    {/* Profile */}
                    <div className="adml-profile-wrap">
                        <button className="adml-profile-btn">
                            <img
                                src={`https://ui-avatars.com/api/?name=${role === 'super_admin' ? 'SA' : 'AD'}&background=dcfce7&color=166534&bold=true`}
                                className="adml-profile-avatar"
                                alt="Avatar"
                            />
                            <div className="adml-profile-info">
                                <span className="adml-profile-role">{role === 'super_admin' ? 'Super Admin' : 'Nhân viên'}</span>
                                <span className="adml-profile-status">● Online</span>
                            </div>
                            <ChevronDown size={13} className="adml-profile-caret" />
                        </button>

                        <div className="adml-profile-dropdown">
                            <div className="adml-profile-dd-header">
                                <p className="adml-profile-dd-name">{role === 'super_admin' ? 'Quản trị viên' : 'Nhân viên'}</p>
                                <p className="adml-profile-dd-email">{role}@xkld.app</p>
                            </div>
                            <button onClick={handleLogout} className="adml-profile-dd-logout">
                                <LogOut size={14} />
                                Đăng xuất
                            </button>
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setMobileMenuOpen(true)} className="adml-mobile-toggle adml-icon-btn">
                        <Menu size={20} />
                    </button>
                </div>
            </header>

            <main className="adml-main">
                <Outlet />
            </main>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="adml-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
                    <div className="adml-mobile-panel" onClick={e => e.stopPropagation()}>
                        <div className="adml-mobile-panel-header">
                            <span className="adml-mobile-panel-title">Menu</span>
                            <button onClick={() => setMobileMenuOpen(false)} className="adml-icon-btn"><X size={18} /></button>
                        </div>
                        <nav className="adml-mobile-nav">
                            <NavItem onClick={() => setMobileMenuOpen(false)} to="/admin/ho-so" icon={Users} label="Hồ sơ ứng viên" badge={adminStats?.pending} />
                            <NavItem onClick={() => setMobileMenuOpen(false)} to="/admin/don-hang" icon={Briefcase} label="Đơn hàng" />
                            <NavItem onClick={() => setMobileMenuOpen(false)} to="/admin/yeu-cau-tu-van" icon={MessageCircle} label="Yêu cầu tư vấn" />
                            <NavItem onClick={() => setMobileMenuOpen(false)} to="/admin/ghep-don" icon={GitMerge} label="Ghép đơn thi" />
                        </nav>
                        <div className="adml-mobile-footer">
                            <button onClick={handleLogout} className="adml-mobile-logout">
                                <LogOut size={15} />
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

                .adml-root {
                    min-height: 100vh;
                    background: #f8fafc;
                    font-family: 'Inter', sans-serif;
                    color: #1e293b;
                }

                /* ─── TOPBAR ─── */
                .adml-topbar {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    height: 56px;
                    background: #ffffff;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1.25rem;
                    z-index: 100;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                }

                .adml-topbar-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex: 1;
                }

                /* ─── BRAND ─── */
                .adml-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.55rem;
                    text-decoration: none;
                    flex-shrink: 0;
                }

                .adml-brand-icon {
                    width: 34px; height: 34px;
                    background: linear-gradient(135deg, #059669, #10b981);
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 2px 8px rgba(16,185,129,0.3);
                    transition: box-shadow 0.2s;
                }

                .adml-brand:hover .adml-brand-icon {
                    box-shadow: 0 4px 14px rgba(16,185,129,0.4);
                }

                .adml-brand-text {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.4px;
                }

                .adml-brand-text span { color: #059669; }

                .adml-sep {
                    width: 1px; height: 22px;
                    background: #e2e8f0;
                    flex-shrink: 0;
                }

                /* ─── NAV ─── */
                .adml-desktop-nav {
                    display: none;
                    align-items: center;
                    gap: 0.15rem;
                }

                @media (min-width: 1024px) { .adml-desktop-nav { display: flex; } }

                .adml-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.45rem 0.8rem;
                    border-radius: 8px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #64748b;
                    text-decoration: none;
                    transition: all 0.15s;
                    white-space: nowrap;
                }

                .adml-nav-item:hover {
                    color: #0f172a;
                    background: #f1f5f9;
                }

                .adml-nav-item.active {
                    background: #dcfce7;
                    color: #059669;
                }

                .adml-nav-icon { flex-shrink: 0; }

                .adml-nav-badge {
                    background: #ef4444;
                    color: white;
                    font-size: 0.6rem;
                    font-weight: 800;
                    min-width: 16px;
                    height: 16px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 4px;
                }

                /* ─── TOPBAR RIGHT ─── */
                .adml-topbar-right {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }

                .adml-icon-btn {
                    width: 34px; height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: none;
                    border: none;
                    border-radius: 8px;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.15s;
                    text-decoration: none;
                    position: relative;
                    flex-shrink: 0;
                }

                .adml-icon-btn:hover {
                    background: #f1f5f9;
                    color: #475569;
                }

                .adml-notif-dot {
                    position: absolute;
                    top: 7px; right: 7px;
                    width: 7px; height: 7px;
                    background: #f59e0b;
                    border-radius: 50%;
                    border: 2px solid #fff;
                }

                /* ─── SEARCH ─── */
                .adml-search-wrap {
                    position: relative;
                    display: none;
                }

                @media (min-width: 768px) { .adml-search-wrap { display: block; } }

                .adml-search-box {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 0 0.75rem;
                    height: 34px;
                    width: 200px;
                    cursor: text;
                    transition: all 0.2s;
                }

                .adml-search-box:focus-within {
                    background: #fff;
                    border-color: #10b981;
                    width: 280px;
                    box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
                }

                .adml-search-icon {
                    color: #cbd5e1;
                    flex-shrink: 0;
                    transition: color 0.2s;
                }

                .adml-search-icon.spinning {
                    animation: spinS 0.7s linear infinite;
                    color: #10b981;
                }

                @keyframes spinS { to { transform: rotate(360deg); } }

                .adml-search-input {
                    flex: 1;
                    background: none;
                    border: none;
                    outline: none;
                    color: #0f172a;
                    font-size: 0.8rem;
                    font-family: inherit;
                    font-weight: 500;
                    min-width: 0;
                }

                .adml-search-input::placeholder { color: #cbd5e1; }

                .adml-search-clear {
                    background: #f1f5f9;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 3px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    flex-shrink: 0;
                }

                .adml-search-dropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    min-width: 320px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05);
                    overflow: hidden;
                    animation: dropInL 0.15s ease;
                    z-index: 200;
                }

                @keyframes dropInL {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .adml-search-empty {
                    padding: 1.25rem;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 0.8rem;
                }

                .adml-search-group { padding: 0.4rem 0; }

                .adml-search-group-label {
                    padding: 0.3rem 0.85rem;
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    background: #f8fafc;
                }

                .adml-search-item {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    padding: 0.55rem 0.85rem;
                    cursor: pointer;
                    transition: background 0.12s;
                }

                .adml-search-item:hover { background: #f0fdf4; }

                .adml-search-avatar {
                    width: 30px; height: 30px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 1px solid #e2e8f0;
                    flex-shrink: 0;
                }

                .adml-search-job-icon {
                    width: 30px; height: 30px;
                    background: #eff6ff;
                    border: 1px solid #dbeafe;
                    border-radius: 7px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #3b82f6;
                    flex-shrink: 0;
                }

                .adml-search-name {
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #1e293b;
                }

                .adml-search-meta {
                    font-size: 0.7rem;
                    color: #94a3b8;
                    margin-top: 1px;
                }

                /* ─── PROFILE ─── */
                .adml-profile-wrap { position: relative; }

                .adml-profile-wrap:hover .adml-profile-dropdown {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .adml-profile-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.3rem 0.6rem 0.3rem 0.3rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .adml-profile-btn:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                }

                .adml-profile-avatar {
                    width: 28px; height: 28px;
                    border-radius: 7px;
                    object-fit: cover;
                    border: 1.5px solid #bbf7d0;
                }

                .adml-profile-info {
                    display: none;
                    flex-direction: column;
                }

                @media (min-width: 1280px) { .adml-profile-info { display: flex; } }

                .adml-profile-role {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #0f172a;
                    line-height: 1.2;
                }

                .adml-profile-status {
                    font-size: 0.62rem;
                    color: #10b981;
                    font-weight: 600;
                    line-height: 1.2;
                }

                .adml-profile-caret {
                    color: #cbd5e1;
                    display: none;
                }

                @media (min-width: 1280px) { .adml-profile-caret { display: block; } }

                .adml-profile-dropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    width: 200px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 0.5rem;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-4px);
                    transition: all 0.15s ease;
                    z-index: 200;
                }

                .adml-profile-dd-header {
                    padding: 0.6rem 0.75rem 0.75rem;
                    border-bottom: 1px solid #f1f5f9;
                    margin-bottom: 0.4rem;
                }

                .adml-profile-dd-name {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #0f172a;
                }

                .adml-profile-dd-email {
                    font-size: 0.7rem;
                    color: #94a3b8;
                    margin-top: 2px;
                }

                .adml-profile-dd-logout {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.55rem 0.75rem;
                    background: none;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #ef4444;
                    cursor: pointer;
                    transition: background 0.12s;
                    font-family: inherit;
                    text-align: left;
                }

                .adml-profile-dd-logout:hover { background: #fef2f2; }

                /* ─── MAIN ─── */
                .adml-main {
                    padding-top: 56px;
                    min-height: 100vh;
                    max-width: 1280px;
                    margin: 0 auto;
                    width: 100%;
                }

                /* ─── MOBILE ─── */
                .adml-mobile-toggle { display: flex; }

                @media (min-width: 1024px) { .adml-mobile-toggle { display: none; } }

                .adml-mobile-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 200;
                    background: rgba(15,23,42,0.3);
                    backdrop-filter: blur(4px);
                }

                .adml-mobile-panel {
                    position: absolute;
                    top: 0; right: 0; bottom: 0;
                    width: 260px;
                    background: #ffffff;
                    border-left: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    animation: slideInR 0.2s ease;
                    box-shadow: -8px 0 30px rgba(0,0,0,0.08);
                }

                @keyframes slideInR {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }

                .adml-mobile-panel-header {
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1rem;
                    border-bottom: 1px solid #f1f5f9;
                }

                .adml-mobile-panel-title {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .adml-mobile-nav {
                    flex: 1;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .adml-mobile-footer {
                    padding: 1rem;
                    border-top: 1px solid #f1f5f9;
                }

                .adml-mobile-logout {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.65rem 0.85rem;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #ef4444;
                    cursor: pointer;
                    font-family: inherit;
                    transition: background 0.15s;
                }

                .adml-mobile-logout:hover { background: #fee2e2; }
            `}</style>
        </div>
    )
}
