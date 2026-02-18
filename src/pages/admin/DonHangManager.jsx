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
            {/* Header Stats - Removed */}

            {/* Toolbar - Natural Scroll */}
            {/* Toolbar - Combined Responsive */}
            <div className="bg-gray-50 px-3 pt-3 md:px-4 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Search Input */}


                    {/* Filter Buttons & Actions */}
                    <div className="flex flex-wrap gap-2 flex-1 md:justify-start w-full md:w-auto">
                        <button
                            onClick={() => {
                                if (isAdding) handleCancel()
                                else setIsAdding(true)
                            }}
                            className={`shrink-0 h-[38px] px-4 rounded-lg shadow-sm transition-all font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap
                            ${isAdding ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-600 text-white active:scale-95 hover:bg-emerald-700'}
                            `}
                        >
                            <span className="material-icons-outlined text-lg">{isAdding ? 'close' : 'add'}</span>
                            <span>{isAdding ? 'Hủy' : 'Thêm Đơn'}</span>
                        </button>

                        {['All', ...STATUS_OPTIONS].map(status => (
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
                    <div className="w-full">
                        {/* Mobile View */}
                        <div className="md:hidden grid grid-cols-1 gap-4">
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

                        {/* Desktop View */}
                        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 uppercase text-xs font-bold text-gray-500 border-b border-gray-100 tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Đơn hàng</th>
                                        <th className="px-6 py-4">Lương / Số lượng</th>
                                        <th className="px-6 py-4">Thời gian</th>
                                        <th className="px-6 py-4">Trạng thái</th>
                                        <th className="px-6 py-4 text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredOrders.map(order => (
                                        <OrderRow
                                            key={order.id}
                                            order={order}
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                            onEdit={handleEdit}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
    const STATUS_OPTIONS = ['Mới đăng', 'Đang tuyển', 'Sắp hết hạn', 'Đã đóng']

    // Format currency
    const formatMoney = (amount) => parseInt(amount || 0).toLocaleString('vi-VN')

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '--/--'
        return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }

    // Status Badge Style
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Mới đăng': return 'bg-sky-50 text-sky-600 border-sky-100'
            case 'Đang tuyển': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'Sắp hết hạn': return 'bg-orange-50 text-orange-600 border-orange-100'
            default: return 'bg-slate-100 text-slate-500 border-slate-200'
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow transition-all flex flex-col h-full group">

            <div className="p-4 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start gap-3 mb-3">
                    <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2" title={order.ten_don_hang}>
                        {order.ten_don_hang}
                    </h3>
                    <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusStyle(order.trang_thai)}`}>
                        {order.trang_thai}
                    </span>
                </div>

                {/* Info List - Clean */}
                <div className="space-y-2 text-xs mb-3">
                    <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-1.5">
                        <span className="text-slate-400">Mức lương</span>
                        <span className="font-bold text-slate-700 text-sm">{formatMoney(order.muc_luong)}¥</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-1.5">
                        <span className="text-slate-400">Số lượng</span>
                        <span className="font-bold text-slate-700">{order.so_luong_tuyen} người</span>
                    </div>
                </div>

                {/* Sub-info */}
                <div className="mt-auto">
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1" title="Địa điểm">
                        <span className="material-icons-outlined text-[14px] text-slate-400">place</span>
                        <span className="truncate">{order.dia_diem_lam_viec}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span title={`Hạn nộp: ${formatDate(order.thoi_han_nop_ho_so)}`}>
                            Hạn: {formatDate(order.thoi_han_nop_ho_so)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span title="Ngành nghề">{order.nganh_nghe}</span>
                    </div>
                </div>
            </div>

            {/* Footer Actions - Compact & Minimal */}
            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                {/* Status Changer (Hidden select trick) */}
                <div className="relative group/status cursor-pointer">
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                        <span className="material-icons-outlined text-[14px]">sync_alt</span>
                        Đổi trạng thái
                    </div>
                    <select
                        value={order.trang_thai}
                        onChange={(e) => onStatusChange(order.id, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(order)} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Sửa">
                        <span className="material-icons-outlined text-[16px]">edit</span>
                    </button>
                    <button onClick={() => onDelete(order.id)} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" title="Xóa">
                        <span className="material-icons-outlined text-[16px]">delete</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

function OrderRow({ order, onStatusChange, onEdit, onDelete }) {
    const STATUS_OPTIONS = ['Mới đăng', 'Đang tuyển', 'Sắp hết hạn', 'Đã đóng']

    const formatMoney = (amount) => parseInt(amount || 0).toLocaleString('vi-VN')
    const formatDate = (dateString) => {
        if (!dateString) return '--/--'
        return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Mới đăng': return 'bg-sky-50 text-sky-600 border-sky-100'
            case 'Đang tuyển': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'Sắp hết hạn': return 'bg-orange-50 text-orange-600 border-orange-100'
            default: return 'bg-slate-100 text-slate-500 border-slate-200'
        }
    }

    return (
        <tr className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-6 py-4 align-top">
                <div className="max-w-[300px]">
                    <p className="font-bold text-slate-800 text-sm leading-snug line-clamp-2" title={order.ten_don_hang}>{order.ten_don_hang}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wide">
                            {order.nganh_nghe}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <span className="material-icons-outlined text-[12px]">place</span> {order.dia_diem_lam_viec}
                        </span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 align-top">
                <div className="space-y-1">
                    <p className="font-mono font-bold text-slate-700 text-sm">{formatMoney(order.muc_luong)}¥</p>
                    <p className="text-xs text-slate-500 font-medium">SL: {order.so_luong_tuyen}</p>
                </div>
            </td>
            <td className="px-6 py-4 align-top">
                <div className="text-xs text-slate-500 space-y-1">
                    <p><span className="text-slate-400">Hạn nộp:</span> <span className="font-medium text-slate-700">{formatDate(order.thoi_han_nop_ho_so)}</span></p>
                    {order.ngay_tuyen_du_kien && (
                        <p><span className="text-slate-400">Tuyển:</span> <span className="font-medium text-slate-700">{formatDate(order.ngay_tuyen_du_kien)}</span></p>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 align-top">
                <div className="relative inline-block group/status">
                    <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusStyle(order.trang_thai)} hover:shadow-sm transition-all bg-white`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                        {order.trang_thai}
                        <span className="material-icons-outlined text-[14px] ml-1 opacity-50">expand_more</span>
                    </button>
                    <select
                        value={order.trang_thai}
                        onChange={(e) => onStatusChange(order.id, e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </td>
            <td className="px-6 py-4 align-top text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(order)} className="w-8 h-8 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-colors" title="Sửa">
                        <span className="material-icons-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => onDelete(order.id)} className="w-8 h-8 flex items-center justify-center rounded bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 transition-colors" title="Xóa">
                        <span className="material-icons-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    )
}
