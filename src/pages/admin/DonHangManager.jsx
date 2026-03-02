import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export default function DonHangManager() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [activeTab, setActiveTab] = useState('Mới đăng')
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
            // Only send safe, known columns — prevents stale id/created_at leaking in
            const safePayload = {
                ten_don_hang: formData.ten_don_hang,
                nganh_nghe: formData.nganh_nghe,
                muc_luong: formData.muc_luong,
                so_luong_tuyen: formData.so_luong_tuyen,
                dia_diem_lam_viec: formData.dia_diem_lam_viec,
                thoi_han_nop_ho_so: formData.thoi_han_nop_ho_so || null,
                ngay_tuyen_du_kien: formData.ngay_tuyen_du_kien || null,
                mo_ta_cong_viec: formData.mo_ta_cong_viec || null,
                trang_thai: formData.trang_thai
            }

            if (editingId) {
                const { error } = await supabase.from('don_hang').update(safePayload).eq('id', editingId)
                if (error) throw error
                fetchOrders()
                alert('Cập nhật đơn hàng thành công!')
            } else {
                const { error } = await supabase.from('don_hang').insert([safePayload])
                if (error) throw error
                fetchOrders()
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


    const STATUS_OPTIONS = ['Mới đăng', 'Đang tuyển', 'Sắp hết hạn', 'Đã đóng']
    const JOB_CATEGORIES = ['Xây dựng', 'Thực phẩm', 'Cơ khí', 'May mặc', 'Nông nghiệp', 'Điều dưỡng', 'Vệ sinh tòa nhà', 'Khách sạn', 'IT/Kỹ sư', 'Khác']

    const TAB_CONFIG = {
        'Mới đăng': { color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd', icon: 'new_releases' },
        'Đang tuyển': { color: '#059669', bg: '#d1fae5', border: '#6ee7b7', icon: 'work' },
        'Sắp hết hạn': { color: '#d97706', bg: '#fef3c7', border: '#fcd34d', icon: 'timer' },
        'Đã đóng': { color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', icon: 'lock' },
    }

    const tabCount = (s) => orders.filter(o => o.trang_thai === s).length
    const tabOrders = orders.filter(o => o.trang_thai === activeTab)
    const cfg = TAB_CONFIG[activeTab] || TAB_CONFIG['Mới đăng']


    return (
        <div className="admin-page" style={{ paddingTop: '0' }}>

            {/* ── Add/Edit form (slides in above tabs) ── */}
            {isAdding && (
                <div className="admin-panel" style={{ margin: '1rem 0', padding: '1.25rem', borderLeft: `3px solid ${editingId ? '#7c3aed' : '#059669'}` }}>
                    <h3 style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span className="material-icons-outlined" style={{ fontSize: '20px', color: editingId ? '#7c3aed' : '#059669' }}>{editingId ? 'edit_note' : 'post_add'}</span>
                        {editingId ? 'Cập Nhật Đơn Hàng' : 'Thêm Đơn Hàng Mới'}
                    </h3>
                    <form onSubmit={handleSaveOrder} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="md:col-span-2">
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Tên đơn hàng <span style={{ color: '#ef4444' }}>*</span></label>
                            <input required
                                style={{ width: '100%', padding: '0.55rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', background: '#f8fafc', outline: 'none', fontFamily: 'inherit' }}
                                placeholder="VD: Kỹ sư xây dựng..."
                                value={formData.ten_don_hang}
                                onChange={e => setFormData({ ...formData, ten_don_hang: e.target.value })}
                                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = '#fff' }}
                                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Ngành nghề</label>
                            <select style={{ width: '100%', padding: '0.55rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', background: '#f8fafc', outline: 'none', fontFamily: 'inherit' }}
                                value={formData.nganh_nghe} onChange={e => setFormData({ ...formData, nganh_nghe: e.target.value })}>
                                {JOB_CATEGORIES.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Mức lương (¥) <span style={{ color: '#ef4444' }}>*</span></label>
                            <input required type="number"
                                style={{ width: '100%', padding: '0.55rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', background: '#f8fafc', outline: 'none', fontFamily: 'inherit' }}
                                placeholder="VD: 180000"
                                value={formData.muc_luong}
                                onChange={e => setFormData({ ...formData, muc_luong: e.target.value })}
                                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = '#fff' }}
                                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Số lượng <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="number" min="1"
                                style={{ width: '100%', padding: '0.55rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', background: '#f8fafc', outline: 'none', fontFamily: 'inherit' }}
                                value={formData.so_luong_tuyen}
                                onChange={e => setFormData({ ...formData, so_luong_tuyen: e.target.value })}
                                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = '#fff' }}
                                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Địa điểm <span style={{ color: '#ef4444' }}>*</span></label>
                            <input required
                                style={{ width: '100%', padding: '0.55rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', background: '#f8fafc', outline: 'none', fontFamily: 'inherit' }}
                                placeholder="VD: Tokyo, Osaka..."
                                value={formData.dia_diem_lam_viec}
                                onChange={e => setFormData({ ...formData, dia_diem_lam_viec: e.target.value })}
                                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = '#fff' }}
                                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Hạn nộp hồ sơ</label>
                            <input type="date"
                                style={{ width: '100%', padding: '0.55rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', background: '#f8fafc', outline: 'none', fontFamily: 'inherit' }}
                                value={formData.thoi_han_nop_ho_so}
                                onChange={e => setFormData({ ...formData, thoi_han_nop_ho_so: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Trạng thái</label>
                            <select style={{ width: '100%', padding: '0.55rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', background: '#f8fafc', outline: 'none', fontFamily: 'inherit' }}
                                value={formData.trang_thai} onChange={e => setFormData({ ...formData, trang_thai: e.target.value })}>
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2 lg:col-span-4">
                            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Mô tả công việc</label>
                            <textarea
                                style={{ width: '100%', padding: '0.55rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#0f172a', background: '#f8fafc', outline: 'none', fontFamily: 'inherit', minHeight: '80px', resize: 'vertical' }}
                                placeholder="Mô tả chi tiết..."
                                value={formData.mo_ta_cong_viec || ''}
                                onChange={e => setFormData({ ...formData, mo_ta_cong_viec: e.target.value })}
                                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = '#fff' }}
                                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', gridColumn: '1 / -1' }}>
                            <button type="button" onClick={handleCancel}
                                style={{ padding: '0.5rem 1.1rem', background: 'none', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontWeight: '700', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem' }}
                            >Hủy</button>
                            <button type="submit" className="admin-btn-primary" style={{ height: '38px' }}>
                                <span className="material-icons-outlined" style={{ fontSize: '18px' }}>save</span>
                                {editingId ? 'Cập Nhật' : 'Lưu Đơn Hàng'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Tab bar ── */}
            <div style={{
                display: 'flex',
                alignItems: 'stretch',
                borderBottom: '2px solid #e2e8f0',
                background: '#ffffff',
                overflowX: 'auto',
                paddingTop: '0.6rem',
                marginBottom: '1.25rem',
            }} className="no-scrollbar">
                {/* Add button */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.85rem 0.6rem', borderRight: '1px solid #f1f5f9', marginRight: '0.25rem', flexShrink: 0 }}>
                    <button
                        onClick={() => { if (isAdding) handleCancel(); else setIsAdding(true) }}
                        className={isAdding ? 'admin-btn-danger' : 'admin-btn-primary'}
                        style={{ height: '32px', fontSize: '0.73rem', padding: '0 0.75rem' }}
                    >
                        <span className="material-icons-outlined" style={{ fontSize: '15px' }}>{isAdding ? 'close' : 'add'}</span>
                        {isAdding ? 'Hủy' : 'Thêm Đơn'}
                    </button>
                </div>

                {/* Status tabs */}
                {STATUS_OPTIONS.map(status => {
                    const tcfg = TAB_CONFIG[status]
                    const count = tabCount(status)
                    const isActive = activeTab === status
                    return (
                        <button
                            key={status}
                            onClick={() => setActiveTab(status)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.45rem 1rem 0.65rem',
                                border: 'none',
                                borderBottom: isActive ? `2.5px solid ${tcfg.color}` : '2.5px solid transparent',
                                background: 'none',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontSize: '0.77rem',
                                fontWeight: isActive ? '800' : '600',
                                color: isActive ? tcfg.color : '#94a3b8',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s',
                                flexShrink: 0,
                                marginBottom: '-2px',
                            }}
                        >
                            <span className="material-icons-outlined" style={{ fontSize: '14px' }}>{tcfg.icon}</span>
                            {status}
                            <span style={{
                                minWidth: '18px', height: '18px', padding: '0 5px',
                                borderRadius: '20px', fontSize: '0.6rem', fontWeight: '800',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                background: isActive ? tcfg.bg : '#f1f5f9',
                                color: isActive ? tcfg.color : '#94a3b8',
                                border: `1px solid ${isActive ? tcfg.border : '#e2e8f0'}`,
                                transition: 'all 0.15s',
                            }}>{count}</span>
                        </button>
                    )
                })}
            </div>

            {/* ── Tab content ── */}
            {loading ? (
                <div className="admin-spinner-wrap"><div className="admin-spinner" /></div>
            ) : tabOrders.length === 0 ? (
                <div className="admin-panel admin-empty" style={{ minHeight: '260px' }}>
                    <span className="material-icons-outlined" style={{ fontSize: '2.5rem', color: cfg.border }}>{cfg.icon}</span>
                    <p style={{ fontWeight: '600', color: '#64748b' }}>
                        Chưa có đơn hàng nào ở trạng thái <strong style={{ color: cfg.color }}>{activeTab}</strong>
                    </p>
                    <button onClick={() => setIsAdding(true)} className="admin-btn-primary" style={{ marginTop: '0.75rem', height: '34px', fontSize: '0.75rem' }}>
                        <span className="material-icons-outlined" style={{ fontSize: '15px' }}>add</span>
                        Thêm đơn hàng mới
                    </button>
                </div>
            ) : (
                <>
                    {/* Mobile cards */}
                    <div className="md:hidden grid grid-cols-1 gap-4">
                        {tabOrders.map(order => (
                            <OrderCard key={order.id} order={order}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete} onEdit={handleEdit}
                            />
                        ))}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block admin-panel">
                        {/* Panel header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.1rem', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                            <span className="material-icons-outlined" style={{ fontSize: '16px', color: cfg.color }}>{cfg.icon}</span>
                            <span style={{ fontWeight: '800', fontSize: '0.78rem', color: cfg.color }}>{activeTab}</span>
                            <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: '0.62rem', fontWeight: '800', padding: '0.15rem 0.55rem', borderRadius: '20px' }}>
                                {tabOrders.length} đơn
                            </span>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '36px', paddingLeft: '1.1rem' }}>#</th>
                                    <th>Đơn hàng</th>
                                    <th>Lương / Số lượng</th>
                                    <th>Thời gian</th>
                                    <th>Trạng thái</th>
                                    <th style={{ textAlign: 'right' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tabOrders.map((order, idx) => (
                                    <OrderRow key={order.id} order={order} index={idx + 1}
                                        onStatusChange={handleStatusChange}
                                        onDelete={handleDelete} onEdit={handleEdit}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
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

function OrderRow({ order, index, onStatusChange, onEdit, onDelete }) {
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
            {/* # */}
            <td style={{ paddingLeft: '1.1rem', color: '#cbd5e1', fontWeight: '700', fontSize: '0.72rem', width: '36px' }}>
                {index}
            </td>
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
                <div className="flex items-center justify-end gap-2">
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
