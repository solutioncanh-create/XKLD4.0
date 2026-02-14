import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function DashboardHome() {
    const [stats, setStats] = useState({ totalActive: 0, newToday: 0, pending: 0, consultationReq: 0 })
    const [recentProfiles, setRecentProfiles] = useState([])
    const [consultationRequests, setConsultationRequests] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            const today = new Date().toISOString().split('T')[0]

            // 1. Tổng hồ sơ (Tất cả)
            const { count: totalCount } = await supabase.from('ho_so').select('*', { count: 'exact', head: true })

            // 2. Hồ sơ mới hôm nay (Tất cả)
            const { count: newCount } = await supabase.from('ho_so').select('*', { count: 'exact', head: true }).gte('created_at', today)

            // 3. Hồ sơ chờ xử lý (Chưa có trạng thái hoặc Mới)
            const { count: pendingCount } = await supabase.from('ho_so').select('*', { count: 'exact', head: true }).is('trang_thai', null)

            // 4. Yêu cầu tư vấn (Lọc theo trạng thái 'Chờ tư vấn')
            const { count: consultCount, data: consultData } = await supabase
                .from('ho_so')
                .select('*')
                .eq('trang_thai', 'Chờ tư vấn')
                .order('created_at', { ascending: false })
                .limit(10)

            // 5. Vừa đăng ký (Lấy tất cả MỚI NHẤT, loại bỏ những cái là Yêu cầu tư vấn để không bị trùng lặp hiển thị bên kia)
            const { data: recent } = await supabase
                .from('ho_so')
                .select('*')
                .neq('trang_thai', 'Chờ tư vấn')
                .order('created_at', { ascending: false })
                .limit(10)


            setStats({
                totalActive: totalCount || 0,
                newToday: newCount || 0,
                pending: pendingCount || 0,
                consultationReq: consultCount || 0
            })
            setRecentProfiles(recent || [])
            setConsultationRequests(consultData || [])

        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    )

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Tổng hồ sơ" value={stats.totalActive} unit="ứng viên" icon="people_alt" color="blue" description="Tổng trên hệ thống" />
                <StatCard title="Hồ sơ mới" value={`+${stats.newToday}`} unit="hôm nay" icon="person_add" color="green" description="Cập nhật real-time" trend="up" />
                <StatCard title="Chờ xử lý" value={stats.pending} unit="hồ sơ" icon="pending_actions" color="yellow" description="Cần duyệt ngay" />
                <StatCard title="Yêu cầu tư vấn" value={stats.consultationReq} unit="yêu cầu" icon="support_agent" color="purple" description="Cần tư vấn ngay" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Cot 1: Vua dang ky */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                            <span className="material-icons-outlined text-green-500">fiber_new</span>
                            Vừa đăng ký
                        </h3>
                        <Link to="/admin/ho-so" className="text-xs font-bold text-primary-600 hover:text-white bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-600 transition-colors">Xem tất cả</Link>
                    </div>
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {recentProfiles.map(profile => (
                            <Link key={profile.id} to={`/ho-so/${profile.id}`} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100 group cursor-pointer">
                                <div className="relative shrink-0">
                                    <img src={profile.anh_ho_so || `https://ui-avatars.com/api/?name=${profile.ho_ten.replace(' ', '+')}&background=random`} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 truncate text-base group-hover:text-primary-700 transition-colors">{profile.ho_ten}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600 truncate max-w-[150px]">{profile.nganh_nghe_mong_muon || 'Chưa chọn ngành'}</span>
                                        <span>•</span>
                                        <span>{new Date(profile.created_at).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                                <span className="material-icons-outlined text-gray-300 group-hover:text-primary-500 transition-transform group-hover:translate-x-1">chevron_right</span>
                            </Link>
                        ))}
                        {recentProfiles.length === 0 && <EmptyState message="Chưa có hồ sơ mới" />}
                    </div>
                </div>

                {/* Cot 2: Yeu cau Tu van */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                            <span className="material-icons-outlined text-purple-500">support_agent</span>
                            Yêu cầu Tư Vấn
                        </h3>
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">Mới nhất</span>
                    </div>
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {consultationRequests.map(req => (
                            <div key={req.id} className="flex items-start gap-4 p-4 bg-purple-50 hover:bg-purple-100/50 rounded-xl transition-all border border-purple-100 group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-xl"></div>
                                <div className="w-10 h-10 rounded-full bg-white text-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                                    <span className="material-icons-outlined text-xl">call</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-bold text-gray-800 truncate text-base">{req.ho_ten}</p>
                                        <span className="text-[10px] text-gray-400">{new Date(req.created_at).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-icons-outlined text-[14px] text-purple-500">phone</span>
                                        <p className="text-sm text-gray-700 font-bold">{req.so_dien_thoai}</p>
                                    </div>
                                    {req.ghi_chu && <p className="text-xs text-gray-500 bg-white p-2 rounded border border-purple-100 italic leading-relaxed line-clamp-2">{req.ghi_chu}</p>}
                                </div>
                            </div>
                        ))}
                        {consultationRequests.length === 0 && <EmptyState message="Chưa có yêu cầu tư vấn mới" />}
                    </div>
                </div>

            </div>
        </div>
    )
}

const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-300 opacity-60 h-full">
        <span className="material-icons-outlined text-5xl mb-3">inbox</span>
        <span className="text-sm font-medium">{message}</span>
    </div>
)

// Modern Stat Card Component
const StatCard = ({ title, value, unit, icon, color, description, trend }) => {
    // Map colors to Tailwind classes
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 ring-blue-100',
        green: 'bg-green-50 text-green-600 ring-green-100',
        yellow: 'bg-yellow-50 text-yellow-600 ring-yellow-100',
        red: 'bg-red-50 text-red-600 ring-red-100',
        purple: 'bg-purple-50 text-purple-600 ring-purple-100',
    }
    const currentColor = colorClasses[color] || colorClasses.blue

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-default relative overflow-hidden">
            {/* Background Decor */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${currentColor.split(' ')[0]} group-hover:scale-150 transition-transform duration-500`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl ${currentColor} ring-1 shadow-sm`}>
                    <span className="material-icons-outlined text-2xl">{icon}</span>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <span>{trend === 'up' ? '▲' : '▼'} 12%</span>
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-4xl font-black text-gray-800 mb-1 tracking-tight group-hover:text-primary-600 transition-colors">
                    {value}
                    {unit && <span className="text-sm font-medium text-gray-400 ml-1 align-baseline tracking-normal">{unit}</span>}
                </h3>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">{title}</p>
                <p className="text-xs text-gray-400 font-medium opacity-80">{description}</p>
            </div>
        </div>
    )
}
