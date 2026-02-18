import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Globe, Briefcase, FileText, Users, LayoutDashboard, User } from 'lucide-react'

export default function Navbar() {
    const location = useLocation()
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)


    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Trang Chủ', path: '/', icon: <Globe size={18} /> },
        // { name: 'Cộng Đồng Số', path: '/community', icon: <Users size={18} /> }, // Hidden
        { name: 'Hồ Sơ Của Tôi', path: '/dang-ky', icon: <FileText size={18} /> },
        // { name: 'Cơ Hội Việc Làm', path: '/viec-lam', icon: <Briefcase size={18} /> }, // Hidden
    ]

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMobileMenuOpen
            ? 'bg-white shadow-sm border-b border-gray-100 py-3 md:bg-white/95 md:backdrop-blur-md'
            : 'bg-white shadow-sm border-b border-gray-100 py-3 md:bg-transparent md:shadow-none md:border-none md:py-5'
            }`}>
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between">

                    {/* LOGO */}
                    <Link to="/" className="flex items-center gap-2 group z-50" onClick={() => setMobileMenuOpen(false)}>
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-300">
                            <Globe className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                            XKLD <span className="text-emerald-600">4.0</span>
                        </span>
                    </Link>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-emerald-600 flex items-center gap-2 ${location.pathname === link.path ? 'text-emerald-700 font-bold' : 'text-slate-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Admin Link */}
                        <Link
                            to="/admin/login"
                            className="text-slate-500 hover:text-emerald-700 transition-colors p-2 rounded-full hover:bg-emerald-50"
                            title="Quản trị viên"
                        >
                            <LayoutDashboard size={20} />
                        </Link>

                        {/* User Profile */}
                        <Link
                            to="/dang-ky" // Assuming this goes to profile/dashboard
                            className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 hover:bg-emerald-200 transition-colors"
                        >
                            <User size={18} />
                        </Link>
                    </div>

                    {/* MOBILE MENU TOGGLE */}
                    <button
                        className="md:hidden z-50 p-2 text-slate-600"
                        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU OVERLAY */}
            <div className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 md:hidden pt-24 px-6 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`text-lg font-medium py-2 border-b border-slate-100 flex items-center gap-3 ${location.pathname === link.path ? 'text-emerald-600' : 'text-slate-800'
                                }`}
                        >
                            {link.icon}
                            {link.name}
                        </Link>
                    ))}

                    <div className="pt-4 flex flex-col gap-4">
                        <Link
                            to="/admin/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 text-slate-600 hover:text-emerald-600 py-2"
                        >
                            <LayoutDashboard size={20} />
                            Truy cập Admin
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
