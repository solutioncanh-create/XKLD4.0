import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export default function DonHangManager() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [filterStatus, setFilterStatus] = useState('All')
    const [searchTerm, setSearchTerm] = useState('')
    const [searchParams] = useSearchParams()

    // Initial State
    const initialOrderState = {
        ten_don_hang: '', nganh_nghe: 'Xây dựng', muc_luong: '',
        so_luong_tuyen: 1, dia_diem_lam_viec: '',
        thoi_han_nop_ho_so: '', ngay_tuyen_du_kien: '',
        mo_ta_cong_viec: '',
        trang_thai: 'Mới đăng',
        yeu_cau_gioi_tinh: 'Không yêu cầu'
    }

    const [formData, setFormData] = useState(initialOrderState)

    useEffect(() => { fetchOrders() }, [])

    useEffect(() => {
        const editId = searchParams.get('edit')
        if (editId && orders.length > 0 && !isAdding) {
            const orderToEdit = orders.find(o => o.id === editId)
            if (orderToEdit) {
                handleEdit(orderToEdit)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orders, searchParams])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.from('don_hang').select('*').order('created_at', { ascending: false })
            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            console.error('Lỗi tải đơn hàng:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (order) => {
        setFormData(order)
        setEditingId(order.id)
        setIsAdding(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSaveOrder = async (e) => {
        e.preventDefault()
        try {
            // eslint-disable-next-line no-unused-vars
            const { yeu_cau_gioi_tinh, ...safePayload } = formData

            if (editingId) {
                const { error } = await supabase.from('don_hang').update(safePayload).eq('id', editingId)
                if (error) throw error
                fetchOrders() // Refresh grid
                alert('Cập nhật đơn hàng thành công!')
            } else {
                const { error } = await supabase.from('don_hang').insert([safePayload])
                if (error) throw error
                fetchOrders() // Refresh grid
                alert('Thêm đơn hàng mới thành công!')
            }
            handleCancel()
        } catch (error) { alert('Lỗi: ' + error.message) }
    }

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return
        try {
            const { error } = await supabase.from('don_hang').delete().eq('id', id)
            if (error) throw error
            setOrders(orders.filter(o => o.id !== id))
        } catch (error) { alert('Lỗi xóa: ' + error.message) }
    }

    const handleStatusChange = async (id, newStatus) => {
        // Optimistic update
        setOrders(orders.map(o => o.id === id ? { ...o, trang_thai: newStatus } : o))
        try {
            const { error } = await supabase.from('don_hang').update({ trang_thai: newStatus }).eq('id', id)
            if (error) {
                fetchOrders() // Revert
                throw error
            }
        } catch (error) { alert('Lỗi cập nhật trạng thái: ' + error.message) }
    }

    const handleCancel = () => {
        setIsAdding(false)
        setEditingId(null)
        setFormData(initialOrderState)
    }

    // Filter Logic Updated
    const filteredOrders = orders.filter(o => {
        const matchesStatus = filterStatus === 'All' || o.trang_thai === filterStatus
        const matchesSearch = o.ten_don_hang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.dia_diem_lam_viec?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.nganh_nghe?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const stats = {
        total: orders.length,
        new: orders.filter(o => o.trang_thai === 'Mới đăng').length,
        active: orders.filter(o => o.trang_thai === 'Đang tuyển').length,
        urgent: orders.filter(o => o.trang_thai === 'Sắp hết hạn').length,
        closed: orders.filter(o => o.trang_thai === 'Đã đóng').length
    }

    const STATUS_OPTIONS = ['Mới đăng', 'Đang tuyển', 'Sắp hết hạn', 'Đã đóng']
    const JOB_CATEGORIES = ['Xây dựng', 'Thực phẩm', 'Cơ khí', 'May mặc', 'Nông nghiệp', 'Điều dưỡng', 'Vệ sinh tòa nhà', 'Khách sạn', 'IT/Kỹ sư', 'Khác']

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            {/* Header Stats - Hidden on Mobile */}
            <div className="hidden md:flex overflow-x-auto gap-3 pb-2 mb-4 px-4 pt-4 no-scrollbar snap-x">
                <div className="min-w-[140px] snap-center"><StatCard label="Tổng đơn" count={stats.total} icon="work_outline" color="bg-blue-600" /></div>
                <div className="min-w-[140px] snap-center"><StatCard label="Mới đăng" count={stats.new} icon="new_releases" color="bg-blue-400" /></div>
                <div className="min-w-[140px] snap-center"><StatCard label="Đang tuyển" count={stats.active} icon="check_circle" color="bg-green-500" /></div>
                <div className="min-w-[140px] snap-center"><StatCard label="Sắp hết" count={stats.urgent} icon="warning" color="bg-orange-500" /></div>
                <div className="min-w-[140px] snap-center"><StatCard label="Đã đóng" count={stats.closed} icon="archive" color="bg-gray-500" /></div>
            </div>

            {/* Toolbar - Natural Scroll */}
            <div className="bg-gray-50 px-3 pt-3 md:px-4 mb-4">
                <div className="flex gap-2 items-center mb-3">
                    {/* Search - Hidden on Mobile */}
                    <div className="hidden md:block relative flex-1">
                        <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Tìm đơn hàng, địa điểm..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={() => {
                            if (isAdding) handleCancel()
                            else setIsAdding(true)
                        }}
                        className={` px-4 py-2 rounded-lg shadow-sm transition-all shrink-0 font-bold text-sm flex items-center gap-2
                        ${isAdding ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-primary-600 text-white active:scale-95 w-full md:w-auto justify-center'}
                    `}
                    >
                        <span className="material-icons-outlined text-lg">{isAdding ? 'close' : 'add'}</span>
                        <span>{isAdding ? 'Hủy' : 'Thêm Đơn Hàng'}</span>
                    </button>
                </div>

                {/* Filter Buttons - Grid Layout */}
                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 mb-2">
                    {['All', ...STATUS_OPTIONS].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-2 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all border shadow-sm truncate ${filterStatus === status
                                ? 'bg-primary-50 text-primary-700 border-primary-200 ring-1 ring-primary-100'
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {status === 'All' ? 'Tất cả' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area - Natural Scroll */}
            <div className="px-3 md:px-4 no-scrollbar">
                {/* Adding Form */}
                {isAdding ? (
                    <div className="mb-6 bg-white p-5 rounded-xl border border-primary-100 shadow-md animate-scale-up">
                        <h3 className="font-bold text-lg mb-4 text-primary-700 flex items-center gap-2">
                            <span className="material-icons-outlined">{editingId ? 'edit_note' : 'post_add'}</span>
                            {editingId ? 'Cập Nhật Đơn Hàng' : 'Thêm Đơn Hàng Mới'}
                        </h3>
                        <form onSubmit={handleSaveOrder} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="md:col-span-2 group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Tên đơn hàng <span className="text-red-500">*</span></label>
                                <input required className="input-field w-full pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary-500 outline-none font-medium"
                                    placeholder="VD: Kỹ sư xây dựng..."
                                    value={formData.ten_don_hang}
                                    onChange={e => setFormData({ ...formData, ten_don_hang: e.target.value })}
                                />
                            </div>

                            <div className="group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Ngành nghề</label>
                                <select className="input-field w-full pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary-500 outline-none font-medium"
                                    value={formData.nganh_nghe}
                                    onChange={e => setFormData({ ...formData, nganh_nghe: e.target.value })}
                                >
                                    {JOB_CATEGORIES.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>

                            <div className="group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Mức lương (¥) <span className="text-red-500">*</span></label>
                                <input required type="number" className="input-field w-full pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary-500 outline-none font-medium"
                                    placeholder="VD: 180000"
                                    value={formData.muc_luong}
                                    onChange={e => setFormData({ ...formData, muc_luong: e.target.value })}
                                />
                            </div>

                            <div className="group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Số lượng <span className="text-red-500">*</span></label>
                                <input type="number" min="1" className="input-field w-full pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary-500 outline-none font-medium"
                                    value={formData.so_luong_tuyen}
                                    onChange={e => setFormData({ ...formData, so_luong_tuyen: e.target.value })}
                                />
                            </div>

                            <div className="group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Địa điểm làm việc <span className="text-red-500">*</span></label>
                                <input required className="input-field w-full pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary-500 outline-none font-medium"
                                    placeholder="VD: Tokyo, Osaka..."
                                    value={formData.dia_diem_lam_viec}
                                    onChange={e => setFormData({ ...formData, dia_diem_lam_viec: e.target.value })}
                                />
                            </div>

                            <div className="group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Hạn nộp hồ sơ</label>
                                <input type="date" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-800 focus:outline-none focus:border-primary-500"
                                    value={formData.thoi_han_nop_ho_so}
                                    onChange={e => setFormData({ ...formData, thoi_han_nop_ho_so: e.target.value })}
                                />
                            </div>

                            <div className="group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Trạng thái</label>
                                <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-800 focus:outline-none focus:border-primary-500"
                                    value={formData.trang_thai}
                                    onChange={e => setFormData({ ...formData, trang_thai: e.target.value })}
                                >
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="md:col-span-2 lg:col-span-4 group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Mô tả công việc</label>
                                <textarea className="input-field w-full pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary-500 outline-none font-medium min-h-[100px]"
                                    placeholder="Mô tả chi tiết..."
                                    value={formData.mo_ta_cong_viec || ''}
                                    onChange={e => setFormData({ ...formData, mo_ta_cong_viec: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 md:col-span-2 lg:col-span-4 mt-2">
                                <button type="button" onClick={handleCancel} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors">Hủy</button>
                                <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center gap-2">
                                    <span className="material-icons-outlined">save</span>
                                    {editingId ? 'Cập Nhật' : 'Lưu Đơn Hàng'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <span className="material-icons-outlined text-4xl mb-2">work_off</span>
                        <p>Không tìm thấy đơn hàng nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ label, count, icon, color }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1 truncate">{label}</p>
                <p className="text-2xl font-black text-gray-800">{count}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white shadow-md bg-opacity-90 flex-shrink-0 ml-2`}>
                <span className="material-icons-outlined">{icon}</span>
            </div>
        </div>
    )
}

function OrderCard({ order, onStatusChange, onEdit, onDelete }) {
    const statusColors = {
        'Mới đăng': 'bg-blue-500',
        'Đang tuyển': 'bg-green-500',
        'Sắp hết hạn': 'bg-orange-500',
        'Đã đóng': 'bg-gray-400'
    }

    const currentStatusColor = statusColors[order.trang_thai] || 'bg-gray-300'
    const STATUS_OPTIONS = ['Mới đăng', 'Đang tuyển', 'Sắp hết hạn', 'Đã đóng']

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden transition-all active:scale-[0.99] hover:shadow-md h-full">
            {/* Status Bar */}
            <div className={`h-1.5 w-full ${currentStatusColor}`}></div>

            <div className="p-4 flex-1">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2" title={order.ten_don_hang}>{order.ten_don_hang}</h3>
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wide truncate max-w-[120px]">{order.nganh_nghe}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white ${currentStatusColor}`}>{order.trang_thai}</span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="bg-gray-50 rounded-lg p-2.5 flex flex-col justify-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Mức lương</p>
                        <p className="font-black text-gray-800 text-sm whitespace-nowrap">{parseInt(order.muc_luong || 0).toLocaleString()}¥</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 flex flex-col justify-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Số lượng</p>
                        <p className="font-black text-gray-800 text-sm">{order.so_luong_tuyen} người</p>
                    </div>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 font-medium truncate">
                    <span className="material-icons-outlined text-sm">place</span> {order.dia_diem_lam_viec}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="grid grid-cols-3 border-t border-gray-100 divide-x divide-gray-100 bg-gray-50/50">
                <button onClick={() => onEdit(order)} className="flex flex-col items-center justify-center gap-1 py-3 hover:bg-white transition-colors group">
                    <span className="material-icons-outlined text-blue-500 text-xl group-hover:scale-110 transition-transform">edit</span>
                    <span className="text-[9px] font-bold text-blue-600 uppercase">Sửa</span>
                </button>

                <div className="relative group flex flex-col items-center justify-center gap-1 py-3 hover:bg-white transition-colors cursor-pointer">
                    <span className="material-icons-outlined text-purple-500 text-xl group-hover:text-primary-600 group-hover:scale-110 transition-transform">change_circle</span>
                    <span className="text-[9px] font-bold text-purple-600 uppercase group-hover:text-primary-600">Trạng thái</span>
                    <select
                        value={order.trang_thai}
                        onChange={(e) => onStatusChange(order.id, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <button onClick={() => onDelete(order.id)} className="flex flex-col items-center justify-center gap-1 py-3 hover:bg-white transition-colors group">
                    <span className="material-icons-outlined text-red-400 text-xl group-hover:scale-110 transition-transform">delete</span>
                    <span className="text-[9px] font-bold text-red-500 uppercase">Xóa</span>
                </button>
            </div>
        </div>
    )
}
