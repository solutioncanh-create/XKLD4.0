import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

export default function DanhSachHoSo() {
    const [hoSoList, setHoSoList] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('All')

    useEffect(() => {
        fetchHoSo()
    }, [])

    const fetchHoSo = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('ho_so')
                .select(`
                    id,
                    ho_ten,
                    ngay_sinh,
                    gioi_tinh,
                    so_dien_thoai,
                    email,
                    nganh_nghe_mong_muon,
                    trang_thai,
                    created_at,
                    anh_ho_so
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setHoSoList(data || [])
        } catch (error) {
            console.error('Lỗi tải danh sách:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (id, newStatus) => {
        // Optimistic update
        setHoSoList(prev => prev.map(h => h.id === id ? { ...h, trang_thai: newStatus } : h))

        try {
            const { error } = await supabase.from('ho_so').update({ trang_thai: newStatus }).eq('id', id)
            if (error) throw error
        } catch (error) {
            alert('Lỗi cập nhật trạng thái: ' + error.message)
            fetchHoSo() // Revert
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) return
        try {
            const { error } = await supabase.from('ho_so').delete().eq('id', id)
            if (error) throw error
            setHoSoList(prev => prev.filter(h => h.id !== id))
        } catch (error) {
            alert('Lỗi xóa: ' + error.message)
        }
    }

    const filteredList = hoSoList.filter(hoso => {
        const matchesSearch = hoso.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (hoso.so_dien_thoai && hoso.so_dien_thoai.includes(searchTerm))

        const matchesStatus = filterStatus === 'All' || hoso.trang_thai === filterStatus

        return matchesSearch && matchesStatus
    })

    const stats = {
        total: hoSoList.length,
        new: hoSoList.filter(h => h.trang_thai === 'Mới đăng ký').length,
        consulted: hoSoList.filter(h => h.trang_thai === 'Đã tư vấn').length,
        interview: hoSoList.filter(h => h.trang_thai === 'Chờ phỏng vấn').length,
        passed: hoSoList.filter(h => h.trang_thai === 'Đã trúng tuyển').length
    }

    return (
        <div className="p-6 h-full flex flex-col bg-gray-50 overflow-hidden font-sans">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <StatCard label="Tổng hồ sơ" count={stats.total} icon="groups" color="bg-blue-600" />
                <StatCard label="Mới đăng ký" count={stats.new} icon="new_releases" color="bg-green-500" />
                <StatCard label="Đã tư vấn" count={stats.consulted} icon="support_agent" color="bg-yellow-500" />
                <StatCard label="Chờ phỏng vấn" count={stats.interview} icon="thinking" color="bg-purple-500" />
                <StatCard label="Đã trúng tuyển" count={stats.passed} icon="verified" color="bg-rose-500" />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1 w-full md:w-auto">
                    <div className="relative">
                        <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, SĐT..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                    {['All', 'Mới đăng ký', 'Đã tư vấn', 'Chờ phỏng vấn', 'Đã trúng tuyển', 'Đã xuất cảnh'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${filterStatus === status
                                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600'
                                }`}
                        >
                            {status === 'All' ? 'Tất cả' : status}
                        </button>
                    ))}
                </div>

                <Link to="/dang-ky" className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-md shadow-primary-200 transition-all active:scale-95">
                    <span className="material-icons-outlined">person_add</span>
                    Thêm mới
                </Link>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto pr-2 pb-20">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        <span className="material-icons-outlined text-4xl mb-2 text-gray-300">person_off</span>
                        <p>Không tìm thấy hồ sơ phù hợp.</p>
                        <Link to="/dang-ky" className="mt-4 inline-block text-primary-600 font-bold hover:underline">Tạo hồ sơ mới ngay</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredList.map(hoso => (
                            <HoSoCard
                                key={hoso.id}
                                hoso={hoso}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile Fab */}
            <Link to="/dang-ky" className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-500/40 flex items-center justify-center z-50">
                <span className="material-icons-outlined text-2xl">add</span>
            </Link>
        </div>
    )
}

function StatCard({ label, count, icon, color }) {
    return (
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                <span className="material-icons-outlined text-lg">{icon}</span>
            </div>
            <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase font-bold truncate">{label}</p>
                <p className="text-xl font-black text-gray-800 leading-none">{count}</p>
            </div>
        </div>
    )
}

function HoSoCard({ hoso, onStatusChange, onDelete }) {
    const statusConfig = {
        'Mới đăng ký': { color: 'bg-green-50 text-green-700 ring-green-500', icon: 'new_releases' },
        'Đã tư vấn': { color: 'bg-yellow-50 text-yellow-700 ring-yellow-500', icon: 'support_agent' },
        'Chờ phỏng vấn': { color: 'bg-purple-50 text-purple-700 ring-purple-500', icon: 'contact_page' },
        'Đã trúng tuyển': { color: 'bg-rose-50 text-rose-700 ring-rose-500', icon: 'celebration' },
        'Đã xuất cảnh': { color: 'bg-blue-50 text-blue-700 ring-blue-500', icon: 'flight_takeoff' },
        'Hủy hồ sơ': { color: 'bg-gray-100 text-gray-600 ring-gray-400', icon: 'cancel' }
    }

    const config = statusConfig[hoso.trang_thai] || { color: 'bg-gray-50 text-gray-600 ring-gray-400', icon: 'info' }

    // Calculate Age
    const currentYear = new Date().getFullYear()
    const birthYear = hoso.ngay_sinh ? new Date(hoso.ngay_sinh).getFullYear() : null
    const age = birthYear ? currentYear - birthYear : '?'

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
            {/* Gradient Overlay on Top */}
            <div className={`h-2 w-full bg-gradient-to-r from-gray-100 to-white ${hoso.trang_thai === 'Đã trúng tuyển' ? 'from-rose-400 to-rose-200' : 'from-primary-500 to-primary-300'}`}></div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 relative">
                        {hoso.anh_ho_so ? (
                            <img src={hoso.anh_ho_so} alt={hoso.ho_ten} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-gray-100" />
                        ) : (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white shadow-md ring-2 ring-gray-100 ${hoso.gioi_tinh === 'Nữ' ? 'bg-pink-100 text-pink-500' : 'bg-blue-100 text-blue-500'}`}>
                                {hoso.ho_ten.charAt(0)}
                            </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] ${hoso.gioi_tinh === 'Nữ' ? 'bg-pink-400' : 'bg-blue-500'}`} title={hoso.gioi_tinh}>
                            <span className="material-icons-outlined text-[10px]">{hoso.gioi_tinh === 'Nữ' ? 'female' : 'male'}</span>
                        </div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <Link to={`/ho-so/${hoso.id}`} className="font-bold text-gray-900 text-lg hover:text-primary-600 transition-colors line-clamp-1 block" title={hoso.ho_ten}>
                            {hoso.ho_ten}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">{age} tuổi</span>
                            <span>•</span>
                            <span className="truncate max-w-[100px]" title={hoso.email}>{new Date(hoso.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="material-icons-outlined text-gray-400 text-sm">work_outline</span>
                        <span className="font-medium text-gray-800 truncate">{hoso.nganh_nghe_mong_muon || 'Chưa chọn ngành'}</span>
                    </div>
                    <div className="flex items-center gap-2 group/phone cursor-pointer">
                        <span className="material-icons-outlined text-gray-400 text-sm group-hover/phone:text-blue-500 transition-colors">phone</span>
                        <a href={`tel:${hoso.so_dien_thoai}`} className="font-mono font-bold text-gray-700 group-hover/phone:text-blue-600 hover:underline">{hoso.so_dien_thoai}</a>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-icons-outlined text-gray-400 text-sm">email</span>
                        <span className="truncate text-gray-500" title={hoso.email}>{hoso.email || 'Chưa có email'}</span>
                    </div>
                </div>

                {/* Status Selector */}
                <div className="mt-auto">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Trạng thái hồ sơ</label>
                    <div className="relative">
                        <select
                            value={hoso.trang_thai || 'Mới đăng ký'}
                            onChange={(e) => onStatusChange(hoso.id, e.target.value)}
                            className={`w-full appearance-none pl-9 pr-8 py-2 rounded-lg text-xs font-bold border-0 ring-1 ring-inset cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 transition-all shadow-sm ${config.color}`}
                        >
                            <option value="Mới đăng ký">Mới đăng ký</option>
                            <option value="Đã tư vấn">Đã tư vấn</option>
                            <option value="Chờ phỏng vấn">Chờ phỏng vấn</option>
                            <option value="Đã trúng tuyển">Đã trúng tuyển</option>
                            <option value="Đã xuất cảnh">Đã xuất cảnh</option>
                            <option value="Hủy hồ sơ">Hủy hồ sơ</option>
                        </select>
                        <span className="material-icons-outlined absolute left-2.5 top-2 text-base pointer-events-none opacity-80">
                            {config.icon}
                        </span>
                        <span className="material-icons-outlined absolute right-2.5 top-2 text-base pointer-events-none opacity-50">expand_more</span>
                    </div>
                </div>
            </div>

            {/* Footer Quick Actions */}
            <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                <Link
                    to={`/ho-so/${hoso.id}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary-600 transition-colors py-1"
                >
                    <span className="material-icons-outlined text-sm">visibility</span> Xem chi tiết
                </Link>
                <div className="w-px h-4 bg-gray-300"></div>
                <button
                    onClick={() => onDelete(hoso.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors py-1"
                >
                    <span className="material-icons-outlined text-sm">delete</span> Xóa
                </button>
            </div>
        </div>
    )
}
