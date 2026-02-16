import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export default function AdminLogin() {
    // ... existing code ...
    <div className="bg-gray-50 p-4 text-center border-t border-gray-100 flex justify-between items-center">
        <p className="text-xs text-gray-400">XKLD 4.0 &copy; {new Date().getFullYear()}</p>
        <Link to="/" className="text-xs text-gray-500 hover:text-primary-600 font-bold flex items-center gap-1 transition-colors">
            <span className="material-icons-outlined text-sm">home</span>
            Trang chủ
        </Link>
    </div>
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const [isRegistering, setIsRegistering] = useState(false)

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (isRegistering) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                alert('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận (nếu cần) hoặc đăng nhập ngay.')
                setIsRegistering(false)
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                if (data.user) {
                    // Lấy quyền từ bảng admin_roles
                    const { data: roleData } = await supabase
                        .from('admin_roles')
                        .select('role')
                        .eq('id', data.user.id)
                        .single()

                    const userRole = roleData?.role || 'staff'
                    localStorage.setItem('user_role', userRole) // Lưu để dùng trong AdminLayout
                    navigate('/admin')
                }
            }
        } catch (error) {
            alert('Lỗi: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="bg-primary-900 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-[-50%] right-[-50%] w-[300px] h-[300px] bg-primary-500/20 rounded-full blur-3xl"></div>
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/20 relative z-10">
                        <span className="material-icons-outlined text-3xl text-white">admin_panel_settings</span>
                    </div>
                    <h2 className="text-2xl font-black text-white relative z-10">Quản Trị Hệ Thống</h2>
                    <p className="text-primary-200 text-sm mt-1 relative z-10">{isRegistering ? 'Đăng ký tài khoản mới' : 'Đăng nhập để tiếp tục'}</p>
                </div>

                <div className="p-8 pt-10">
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Email</label>
                            <div className="relative">
                                <span className="material-icons-outlined absolute left-3 top-3 text-gray-400">email</span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Mật khẩu</label>
                            <div className="relative">
                                <span className="material-icons-outlined absolute left-3 top-3 text-gray-400">lock</span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    {isRegistering ? 'Đăng Ký' : 'Đăng Nhập'} <span className="material-icons-outlined">{isRegistering ? 'person_add' : 'login'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                        <p className="text-xs text-yellow-800 font-medium flex items-center justify-center gap-1.5 mb-1">
                            <span className="material-icons-outlined text-sm">info</span>
                            Quên tài khoản / mật khẩu?
                        </p>
                        <p className="text-xs text-gray-500">
                            Vui lòng liên hệ <span className="font-bold text-gray-700">Quản trị viên (Super Admin)</span> để được cấp lại quyền truy cập.
                        </p>
                    </div>


                </div>

                <div className="bg-gray-50 p-4 px-8 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs text-gray-400">XKLD 4.0 &copy; {new Date().getFullYear()}</p>
                    <Link to="/" className="text-xs text-gray-500 hover:text-primary-600 font-bold flex items-center gap-1 transition-colors">
                        <span className="material-icons-outlined text-sm">home</span>
                        Trang chủ
                    </Link>
                </div>
            </div>
        </div>
    )
}
