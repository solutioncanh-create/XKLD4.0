import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error
            if (data.user) {
                const { data: roleData } = await supabase
                    .from('admin_roles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()

                const userRole = roleData?.role || 'staff'
                localStorage.setItem('user_role', userRole)
                navigate('/admin')
            }
        } catch (error) {
            alert('Lỗi: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-teal-100/30 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 w-full max-w-md overflow-hidden flex flex-col relative z-10 animate-fade-in-up">
                {/* Header */}
                <div className="bg-emerald-900 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>

                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-lg relative z-10">
                        <span className="material-icons-outlined text-3xl text-white">admin_panel_settings</span>
                    </div>
                    <h2 className="text-2xl font-black text-white relative z-10 tracking-tight">Quản Trị Hệ Thống</h2>
                    <p className="text-emerald-200 text-sm mt-1 relative z-10 font-medium">Đăng nhập để truy cập Dashboard</p>
                </div>

                <div className="p-8 pt-10">
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Email</label>
                            <div className="relative">
                                <span className="material-icons-outlined absolute left-3 top-3.5 text-slate-400">email</span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 ml-1">Mật khẩu</label>
                            <div className="relative">
                                <span className="material-icons-outlined absolute left-3 top-3.5 text-slate-400">lock</span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    Đăng Nhập <span className="material-icons-outlined">login</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center bg-orange-50 rounded-xl p-4 border border-orange-100">
                        <p className="text-xs text-orange-800 font-bold flex items-center justify-center gap-1.5 mb-1">
                            <span className="material-icons-outlined text-sm">warning</span>
                            Khu vực hạn chế
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Chỉ dành cho Quản trị viên và Nhân viên hệ thống.<br />Vui lòng liên hệ IT nếu quên mật khẩu.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 px-8 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-xs text-slate-400 font-medium">XKLD 4.0 &copy; {new Date().getFullYear()}</p>
                    <Link to="/" className="text-xs text-slate-500 hover:text-emerald-600 font-bold flex items-center gap-1 transition-colors group">
                        <span className="material-icons-outlined text-sm group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        Trang chủ
                    </Link>
                </div>
            </div>
        </div>
    )
}
