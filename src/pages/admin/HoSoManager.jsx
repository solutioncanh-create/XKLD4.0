import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import HoSoRow from './HoSoRow'

// Updated font sizes for better readability
export default function HoSoManager() {
    const [profiles, setProfiles] = useState([])
    const [search, setSearch] = useState('')
    const [loadingList, setLoadingList] = useState(false)
    const [filterStatus, setFilterStatus] = useState('All')
    const navigate = useNavigate()

    // Match Modal State
    const [showMatchModal, setShowMatchModal] = useState(false)
    const [selectedProfile, setSelectedProfile] = useState(null)
    const [activeOrders, setActiveOrders] = useState([])
    const [loadingOrders, setLoadingOrders] = useState(false)

    useEffect(() => {
        fetchProfiles()
    }, [])

    const fetchProfiles = async () => {
        setLoadingList(true)
        try {
            const { data, error } = await supabase
                .from('ho_so')
                .select('*, nickname')
                .order('created_at', { ascending: false })

            if (error) throw error
            setProfiles(data || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingList(false)
        }
    }

    const openMatchModal = async (profile) => {
        setSelectedProfile(profile)
        setShowMatchModal(true)
        setLoadingOrders(true)
        try {
            const { data, error } = await supabase
                .from('don_hang')
                .select('*')
                .eq('trang_thai', 'Đang tuyển')
                .order('created_at', { ascending: false })

            if (error) throw error
            setActiveOrders(data || [])
        } catch (error) {
            alert('Lỗi tải danh sách đơn hàng: ' + error.message)
        } finally {
            setLoadingOrders(false)
        }
    }

    const handleMatchOrder = async (order) => {
        if (!selectedProfile) return
        if (!confirm(`Xác nhận ghép ứng viên ${selectedProfile.ho_ten} vào đơn hàng ${order.ten_don_hang}?`)) return

        try {
            // 1. Get max SBD for this order to increment
            const { data: existingLinks } = await supabase
                .from('lien_ket_don_hang_ho_so')
                .select('sbd')
                .eq('don_hang_id', order.id)

            let nextSBD = 1
            if (existingLinks && existingLinks.length > 0) {
                const max = Math.max(...existingLinks.map(l => parseInt(l.sbd) || 0))
                nextSBD = max + 1
            }
            const sbdString = nextSBD.toString().padStart(3, '0')

            // 2. Insert Link
            const { error: linkError } = await supabase
                .from('lien_ket_don_hang_ho_so')
                .insert({
                    don_hang_id: order.id,
                    ho_so_id: selectedProfile.id,
                    sbd: sbdString
                })

            if (linkError) {
                if (linkError.code === '23505') { // Unique constraint violation
                    alert('Ứng viên này đã được ghép vào đơn hàng này rồi!')
                    return
                }
                throw linkError
            }

            // 3. Update Candidate Status
            const { error: updateError } = await supabase
                .from('ho_so')
                .update({ trang_thai: 'Chờ phỏng vấn' })
                .eq('id', selectedProfile.id)

            if (updateError) throw updateError

            // Success UI Update
            alert(`Ghép đơn thành công! SBD: ${sbdString}`)
            setProfiles(prev => prev.map(p => p.id === selectedProfile.id ? { ...p, trang_thai: 'Chờ phỏng vấn' } : p))
            setShowMatchModal(false)

        } catch (error) {
            console.error(error)
            alert('Lỗi ghép đơn: ' + error.message)
        }
    }

    // Normalize status for grouping
    const getNormalizedStatus = (status) => {
        if (status === 'Đợi đơn' || status === 'Chờ tư vấn') return 'Đã tư vấn'
        if (status === 'Đỗ đơn') return 'Đã trúng tuyển'
        if (status === 'Rút đơn') return 'Hủy hồ sơ'
        return status || 'Mới đăng ký'
    }

    const STATUS_ORDER = [
        'Mới đăng ký',
        'Đã tư vấn',
        'Chờ phỏng vấn',
        'Đã trúng tuyển',
        'Đã xuất cảnh',
        'Hủy hồ sơ'
    ]

    const filteredProfiles = profiles.filter(p => {
        const matchesSearch = p.ho_ten.toLowerCase().includes(search.toLowerCase()) ||
            (p.so_dien_thoai && p.so_dien_thoai.includes(search)) ||
            (p.nickname && p.nickname.toLowerCase().includes(search.toLowerCase()))

        if (filterStatus !== 'All') {
            const normalized = getNormalizedStatus(p.trang_thai)
            if (normalized !== filterStatus && p.trang_thai !== filterStatus) return false
        }

        return matchesSearch
    })

    // Group profiles logic
    const groupedProfiles = STATUS_ORDER.reduce((acc, status) => {
        acc[status] = []
        return acc
    }, {})

    // Bucket sort
    filteredProfiles.forEach(p => {
        const status = getNormalizedStatus(p.trang_thai)
        if (groupedProfiles[status]) {
            groupedProfiles[status].push(p)
        } else {
            if (!groupedProfiles['Mới đăng ký']) groupedProfiles['Mới đăng ký'] = []
            groupedProfiles['Mới đăng ký'].push(p)
        }
    })

    const updateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('ho_so')
                .update({ trang_thai: newStatus })
                .eq('id', id)

            if (error) throw error

            setProfiles(prev => prev.map(p => p.id === id ? { ...p, trang_thai: newStatus } : p))
        } catch (error) {
            alert('Lỗi cập nhật trạng thái: ' + error.message)
        }
    }

    const updateJob = async (id, newJob) => {
        try {
            const { error } = await supabase
                .from('ho_so')
                .update({ nganh_nghe_mong_muon: newJob })
                .eq('id', id)

            if (error) throw error

            setProfiles(prev => prev.map(p => p.id === id ? { ...p, nganh_nghe_mong_muon: newJob } : p))
        } catch (error) {
            console.error(error)
            alert('Lỗi cập nhật ngành nghề: ' + error.message)
        }
    }

    const handleSmartAction = async (profile) => {
        const status = getNormalizedStatus(profile.trang_thai)

        switch (status) {
            case 'Mới đăng ký':
                if (window.confirm(`Xác nhận đã tư vấn xong cho ứng viên ${profile.ho_ten}?`)) {
                    await updateStatus(profile.id, 'Đã tư vấn')
                }
                break;
            case 'Đã tư vấn':
                openMatchModal(profile)
                break;
            case 'Chờ phỏng vấn':
                if (window.confirm(`Xác nhận ứng viên ${profile.ho_ten} đã trúng tuyển?`)) {
                    await updateStatus(profile.id, 'Đã trúng tuyển')
                }
                break;
            case 'Đã trúng tuyển':
                if (window.confirm(`Xác nhận ứng viên ${profile.ho_ten} đã xuất cảnh?`)) {
                    await updateStatus(profile.id, 'Đã xuất cảnh')
                }
                break;
            default:
                break;
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa hồ sơ này?')) return
        try {
            const { error } = await supabase.from('ho_so').delete().eq('id', id)
            if (error) throw error
            setProfiles(profiles.filter(p => p.id !== id))
        } catch (error) {
            alert('Lỗi xóa: ' + error.message)
        }
    }

    const stats = {
        total: profiles.length,
        new: profiles.filter(p => getNormalizedStatus(p.trang_thai) === 'Mới đăng ký').length,
        consulted: profiles.filter(p => getNormalizedStatus(p.trang_thai) === 'Đã tư vấn').length,
        interview: profiles.filter(p => getNormalizedStatus(p.trang_thai) === 'Chờ phỏng vấn').length,
        passed: profiles.filter(p => getNormalizedStatus(p.trang_thai) === 'Đã trúng tuyển').length
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20 no-scrollbar">
            {/* Header Stats - Removed */}

            {/* Toolbar - Natural Scroll */}
            {/* Toolbar - Combined Responsive */}
            <div className="bg-gray-50 px-3 pt-3 md:px-4 mb-4">
                <div className="flex flex-wrap items-center gap-2">


                    {/* Filter Buttons & Actions */}
                    <div className="flex flex-wrap gap-2 flex-1 md:justify-start w-full md:w-auto">
                        {/* Add Button */}
                        <button
                            onClick={() => navigate('/dang-ky')}
                            className="shrink-0 h-[38px] px-3.5 rounded-lg text-sm font-bold transition-all border shadow-sm bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <span className="material-icons-outlined text-lg">add_circle</span>
                            <span>Thêm mới</span>
                        </button>

                        {/* Filter Chips */}
                        {['All', ...STATUS_ORDER].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`shrink-0 h-[38px] px-3.5 rounded-lg text-sm font-bold transition-all border shadow-sm whitespace-nowrap ${filterStatus === status
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100'
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {status === 'All' ? 'Tất cả' : status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area - Timeline Layout */}
            <div className="px-4 md:px-6 no-scrollbar">
                {loadingList ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredProfiles.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        <span className="material-icons-outlined text-4xl mb-2 text-gray-300">search_off</span>
                        <p>Không tìm thấy hồ sơ nào phù hợp.</p>
                    </div>
                ) : (
                    <div className="space-y-8 my-4 pb-20">
                        {STATUS_ORDER.map(status => {
                            const group = groupedProfiles[status] || []
                            if (group.length === 0) return null

                            // Text Color mapping for header
                            const headerColor = status === 'Mới đăng ký' ? 'text-green-600' :
                                status === 'Đã tư vấn' ? 'text-yellow-600' :
                                    status === 'Chờ phỏng vấn' ? 'text-purple-600' :
                                        status === 'Đã trúng tuyển' ? 'text-rose-600' :
                                            status === 'Đã xuất cảnh' ? 'text-blue-600' : 'text-gray-600';

                            return (
                                <div key={status} className="animate-fade-in group-section">
                                    {/* Group Header - Simple Design */}
                                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-2">
                                        <h3 className={`text-lg font-black uppercase tracking-tight ${headerColor}`}>{status}</h3>
                                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border border-gray-200">{group.length}</span>
                                    </div>

                                    {/* MOBILE VIEW: GRID CARDS */}
                                    <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {group.map(p => (
                                            <HoSoCard
                                                key={p.id}
                                                profile={p}
                                                onMatch={() => openMatchModal(p)}
                                                onDelete={handleDelete}
                                                onSmartAction={handleSmartAction}
                                                navigate={navigate}
                                            />
                                        ))}
                                    </div>

                                    {/* DESKTOP VIEW: TABLE LIST */}
                                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50/50 border-b border-gray-100 uppercase text-xs font-bold text-gray-400 tracking-wider">
                                                <tr>
                                                    <th className="px-4 py-3">Ứng Viên</th>
                                                    <th className="px-4 py-3">Thông Tin</th>
                                                    <th className="px-4 py-3">Nguyện Vọng</th>
                                                    <th className="px-4 py-3">Trạng Thái</th>
                                                    <th className="px-4 py-3 text-center">Ghép Đơn</th>
                                                    <th className="px-4 py-3 text-right">Hành Động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {group.map(p => (
                                                    <HoSoRow
                                                        key={p.id}
                                                        profile={p}
                                                        onMatch={() => openMatchModal(p)}
                                                        onDelete={handleDelete}
                                                        onSmartAction={handleSmartAction}
                                                        navigate={navigate}
                                                        onStatusChange={updateStatus}
                                                        onJobChange={updateJob}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Match Modal */}
            {showMatchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-scale-up">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-xl font-black text-gray-800">Ghép Đơn Hàng</h3>
                                <p className="text-sm text-gray-500">Chọn đơn hàng phù hợp cho <span className="font-bold text-primary-700">{selectedProfile?.ho_ten}</span></p>
                            </div>
                            <button onClick={() => setShowMatchModal(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 bg-gray-50/30">
                            {loadingOrders ? (
                                <div className="text-center py-10"><span className="animate-spin inline-block w-8 h-8 border-2 border-primary-600 rounded-full border-t-transparent"></span></div>
                            ) : activeOrders.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <span className="material-icons-outlined text-4xl mb-2">work_off</span>
                                    <p>Không có đơn hàng nào đang tuyển.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {activeOrders.map(order => (
                                        <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all group cursor-pointer" onClick={() => handleMatchOrder(order)}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-800 text-sm group-hover:text-primary-700 transition-colors">{order.ten_don_hang}</h4>
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Tuyển ({order.so_luong_tuyen})</span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1"><span className="material-icons-outlined text-sm">place</span> {order.dia_diem_lam_viec}</span>
                                                <span className="flex items-center gap-1"><span className="material-icons-outlined text-sm">payments</span> {order.muc_luong}</span>
                                            </div>
                                            <button className="mt-3 w-full py-2 bg-primary-50 text-primary-700 font-bold rounded-lg text-sm group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                                Chọn đơn hàng này
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
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

function HoSoCard({ profile, onMatch, onDelete, onSmartAction, navigate }) {
    const statusConfig = {
        'Mới đăng ký': { color: 'bg-green-50 text-green-700 ring-green-500', icon: 'new_releases' },
        'Đã tư vấn': { color: 'bg-yellow-50 text-yellow-700 ring-yellow-500', icon: 'support_agent' },
        'Đợi đơn': { color: 'bg-yellow-50 text-yellow-700 ring-yellow-500', icon: 'hourglass_empty' },
        'Chờ tư vấn': { color: 'bg-yellow-50 text-yellow-700 ring-yellow-500', icon: 'hourglass_top' },
        'Chờ phỏng vấn': { color: 'bg-purple-50 text-purple-700 ring-purple-500', icon: 'contact_page' },
        'Đã trúng tuyển': { color: 'bg-rose-50 text-rose-700 ring-rose-500', icon: 'celebration' },
        'Đỗ đơn': { color: 'bg-rose-50 text-rose-700 ring-rose-500', icon: 'celebration' },
        'Đã xuất cảnh': { color: 'bg-blue-50 text-blue-700 ring-blue-500', icon: 'flight_takeoff' },
        'Hủy hồ sơ': { color: 'bg-gray-100 text-gray-600 ring-gray-400', icon: 'cancel' },
        'Rút đơn': { color: 'bg-gray-100 text-gray-600 ring-gray-400', icon: 'cancel' }
    }

    const config = statusConfig[profile.trang_thai] || { color: 'bg-gray-50 text-gray-600 ring-gray-400', icon: 'info' }

    const avatarUrl = profile.anh_ho_so || (profile.gioi_tinh === 'Nữ'
        ? `https://avatar.iran.liara.run/public/girl?username=${profile.ho_ten}`
        : `https://avatar.iran.liara.run/public/boy?username=${profile.ho_ten}`)

    const age = profile.ngay_sinh ? (new Date().getFullYear() - new Date(profile.ngay_sinh).getFullYear()) : '?'

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative group hover:shadow-md transition-all">
            {/* Header: Name + Status */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0 cursor-pointer" onClick={() => navigate(`/ho-so/${profile.id}`)}>
                        <img src={avatarUrl} alt={profile.ho_ten} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${profile.gioi_tinh === 'Nữ' ? 'bg-pink-400' : 'bg-blue-500'}`}></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-1 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/ho-so/${profile.id}`)}>{profile.ho_ten}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span>{age}t</span>
                            {profile.que_quan && (
                                <>
                                    <span>•</span>
                                    <span className="truncate max-w-[100px]">{profile.que_quan}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {/* Status Badge */}
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border-0 ring-1 ring-inset ${config.color}`}>
                    {profile.trang_thai}
                </div>
            </div>

            {/* Content: Job, Phone, Marriage */}
            <div className="space-y-2 mb-4 pl-1">
                {/* Job */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="material-icons-outlined text-gray-400 text-[16px]">work_outline</span>
                    <span className="font-medium text-gray-800">{profile.nganh_nghe_mong_muon || 'Chưa chọn ngành'}</span>
                </div>
                {/* Phone */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="material-icons-outlined text-gray-400 text-[16px]">phone</span>
                    <a href={`tel:${profile.so_dien_thoai}`} className="font-mono hover:text-blue-600 hover:underline decoration-blue-600/30">{profile.so_dien_thoai}</a>
                </div>
                {/* Marriage (New) */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="material-icons-outlined text-gray-400 text-[16px]">family_restroom</span>
                    <span>{profile.tinh_trang_hon_nhan || profile.hon_nhan || 'Chưa cập nhật TT hôn nhân'}</span>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
                {/* Call Button */}
                <a href={`tel:${profile.so_dien_thoai}`} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors bg-gray-50 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-gray-100 hover:border-emerald-200">
                    <span className="material-icons-outlined text-[16px]">call</span>
                    Gọi điện
                </a>

                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/ho-so/${profile.id}`)} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border border-gray-100 hover:border-blue-200">
                        <span className="material-icons-outlined text-[16px]">visibility</span>
                        Xem
                    </button>
                </div>
            </div>
        </div>
    )
}
