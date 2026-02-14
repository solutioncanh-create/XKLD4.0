import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function DonHangManager() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState(null)

    // Initial State for Reset
    const initialOrderState = {
        ten_don_hang: '', nganh_nghe: 'Xây dựng', muc_luong: '',
        so_luong_tuyen: 1, dia_diem_lam_viec: '',
        thoi_han_nop_ho_so: '', ngay_tuyen_du_kien: '',
        mo_ta_cong_viec: '', // Thêm mô tả
        trang_thai: 'Đang tuyển'
    }

    const [formData, setFormData] = useState(initialOrderState)

    useEffect(() => { fetchOrders() }, [])

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
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSaveOrder = async (e) => {
        e.preventDefault()
        try {
            if (editingId) {
                // UPDATE
                const { error } = await supabase.from('don_hang').update(formData).eq('id', editingId)
                if (error) throw error
                alert('Cập nhật đơn hàng thành công!')
            } else {
                // INSERT
                const { error } = await supabase.from('don_hang').insert([formData])
                if (error) throw error
                alert('Thêm đơn hàng mới thành công!')
            }

            // Reset & Refresh
            setIsAdding(false)
            setEditingId(null)
            setFormData(initialOrderState)
            fetchOrders()

        } catch (error) { alert('Lỗi: ' + error.message) }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
            try {
                const { error } = await supabase.from('don_hang').delete().eq('id', id)
                if (error) throw error
                fetchOrders()
            } catch (error) { alert('Lỗi xóa: ' + error.message) }
        }
    }

    const handleCancel = () => {
        setIsAdding(false)
        setEditingId(null)
        setFormData(initialOrderState)
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-secondary-100 mb-6 sticky top-0 z-20">
                <div>
                    <h2 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
                        <span className="material-icons-outlined text-primary-600">work_outline</span>
                        Quản lý Đơn hàng
                    </h2>
                    <p className="text-secondary-500 text-sm mt-1">Danh sách các đơn hàng tuyển dụng hiện tại</p>
                </div>
                <button
                    onClick={() => {
                        if (isAdding) handleCancel()
                        else setIsAdding(true)
                    }}
                    className={`px-5 py-2.5 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95
                        ${isAdding ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-none' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200'}
                    `}
                >
                    <span className="material-icons-outlined">{isAdding ? 'close' : 'add_circle'}</span>
                    {isAdding ? 'Đóng Form' : 'Thêm Đơn Mới'}
                </button>
            </div>

            {/* Form Thêm/Sửa */}
            {isAdding && (
                <div className="bg-white p-8 rounded-xl border border-primary-100 shadow-xl animate-fade-in-down mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                    <h3 className="font-bold text-xl mb-6 text-primary-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <span className="material-icons-outlined">{editingId ? 'edit_note' : 'post_add'}</span>
                        {editingId ? 'Cập Nhật Đơn Hàng' : 'Thêm Đơn Hàng Mới'}
                    </h3>

                    <form onSubmit={handleSaveOrder} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="md:col-span-2 group">
                            <label className="text-xs font-bold text-secondary-500 uppercase tracking-wide mb-1.5 block">Tên đơn hàng <span className="text-red-500">*</span></label>
                            <input required className="input-field w-full pl-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:bg-white focus:border-primary-500 outline-none font-medium"
                                placeholder="VD: Kỹ sư xây dựng cầu đường..."
                                value={formData.ten_don_hang}
                                onChange={e => setFormData({ ...formData, ten_don_hang: e.target.value })}
                            />
                        </div>

                        <div className="group">
                            <label className="text-xs font-bold text-secondary-500 uppercase tracking-wide mb-1.5 block">Ngành nghề</label>
                            <select className="input-field w-full pl-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:bg-white focus:border-primary-500 outline-none font-medium"
                                value={formData.nganh_nghe}
                                onChange={e => setFormData({ ...formData, nganh_nghe: e.target.value })}
                            >
                                {['Xây dựng', 'Thực phẩm', 'Cơ khí', 'May mặc', 'Nông nghiệp', 'Điều dưỡng', 'Vệ sinh tòa nhà', 'Khách sạn', 'IT/Kỹ sư', 'Khác'].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>

                        <div className="group">
                            <label className="text-xs font-bold text-secondary-500 uppercase tracking-wide mb-1.5 block">Mức lương (¥) <span className="text-red-500">*</span></label>
                            <input required type="number" className="input-field w-full pl-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:bg-white focus:border-primary-500 outline-none font-medium"
                                placeholder="VD: 180000"
                                value={formData.muc_luong}
                                onChange={e => setFormData({ ...formData, muc_luong: e.target.value })}
                            />
                        </div>

                        <div className="group">
                            <label className="text-xs font-bold text-secondary-500 uppercase tracking-wide mb-1.5 block">Số lượng <span className="text-red-500">*</span></label>
                            <input type="number" min="1" className="input-field w-full pl-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:bg-white focus:border-primary-500 outline-none font-medium"
                                value={formData.so_luong_tuyen}
                                onChange={e => setFormData({ ...formData, so_luong_tuyen: e.target.value })}
                            />
                        </div>

                        <div className="group">
                            <label className="text-xs font-bold text-secondary-500 uppercase tracking-wide mb-1.5 block">Địa điểm làm việc <span className="text-red-500">*</span></label>
                            <input required className="input-field w-full pl-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:bg-white focus:border-primary-500 outline-none font-medium"
                                placeholder="VD: Tokyo, Osaka..."
                                value={formData.dia_diem_lam_viec}
                                onChange={e => setFormData({ ...formData, dia_diem_lam_viec: e.target.value })}
                            />
                        </div>

                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <label className="text-xs font-bold text-yellow-800 uppercase tracking-wide mb-1.5 block">Hạn nộp hồ sơ <span className="text-red-500">*</span></label>
                            <input type="date" required className="w-full px-3 py-2 bg-white border border-yellow-300 rounded font-medium text-gray-800 focus:outline-none"
                                value={formData.thoi_han_nop_ho_so}
                                onChange={e => setFormData({ ...formData, thoi_han_nop_ho_so: e.target.value })}
                            />
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <label className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1.5 block">Dự kiến thi tuyển</label>
                            <input type="date" className="w-full px-3 py-2 bg-white border border-blue-300 rounded font-medium text-gray-800 focus:outline-none"
                                value={formData.ngay_tuyen_du_kien}
                                onChange={e => setFormData({ ...formData, ngay_tuyen_du_kien: e.target.value })}
                            />
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <label className="text-xs font-bold text-green-800 uppercase tracking-wide mb-1.5 block">Trạng thái</label>
                            <select className="w-full px-3 py-2 bg-white border border-green-300 rounded font-medium text-gray-800 focus:outline-none cursor-pointer"
                                value={formData.trang_thai}
                                onChange={e => setFormData({ ...formData, trang_thai: e.target.value })}
                            >
                                <option value="Đang tuyển">Đang tuyển</option>
                                <option value="Đã đóng">Đã đóng</option>
                                <option value="Sắp hết hạn">Sắp hết hạn</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 lg:col-span-4 group">
                            <label className="text-xs font-bold text-secondary-500 uppercase tracking-wide mb-1.5 block">Mô tả công việc</label>
                            <textarea className="input-field w-full pl-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:bg-white focus:border-primary-500 outline-none font-medium min-h-[100px]"
                                placeholder="Mô tả chi tiết công việc, yêu cầu, quyền lợi..."
                                value={formData.mo_ta_cong_viec || ''}
                                onChange={e => setFormData({ ...formData, mo_ta_cong_viec: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-4 md:col-span-2 lg:col-span-4 mt-4 pt-4 border-t border-secondary-100">
                            <button type="button" onClick={handleCancel} className="px-6 py-2.5 text-secondary-500 font-bold hover:text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors">Hủy bỏ</button>
                            <button type="submit" className="px-8 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center gap-2">
                                <span className="material-icons-outlined">save</span>
                                {editingId ? 'Cập Nhật' : 'Lưu Đơn Hàng'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Danh sách đơn hàng table */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden min-h-[500px] flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-secondary-50 text-secondary-500 text-xs uppercase tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 font-bold border-b border-secondary-200">Thông tin đơn hàng</th>
                                <th className="px-6 py-4 font-bold border-b border-secondary-200">Lương & Số lượng</th>
                                <th className="px-6 py-4 font-bold border-b border-secondary-200">Địa điểm</th>
                                <th className="px-6 py-4 font-bold border-b border-secondary-200">Thời gian</th>
                                <th className="px-6 py-4 font-bold border-b border-secondary-200">Trạng thái</th>
                                <th className="px-6 py-4 font-bold border-b border-secondary-200 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100 bg-white">
                            {loading ? (
                                <tr><td colSpan="6" className="p-12 text-center"><div className="inline-block animate-spin rounded-full h-10 w-10 border-b-4 border-primary-600"></div></td></tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-secondary-400 flex flex-col items-center">
                                        <span className="material-icons-outlined text-5xl mb-3 text-secondary-200 block w-full">folder_off</span>
                                        <span className="text-lg">Chưa có đơn hàng nào.</span>
                                        <button onClick={() => setIsAdding(true)} className="mt-4 text-primary-600 font-bold hover:underline">Thêm ngay</button>
                                    </td>
                                </tr>
                            ) : orders.map(o => (
                                <tr key={o.id} className="hover:bg-primary-50/30 transition-colors group">
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="font-bold text-primary-900 text-base mb-1 truncate" title={o.ten_don_hang}>{o.ten_don_hang}</div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-600 border border-secondary-200">
                                            {o.nganh_nghe}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-accent-600 mb-1">{o.muc_luong || o.luong_co_ban} ¥</div>
                                        <div className="text-xs text-secondary-500">
                                            Tuyển: <span className="font-bold text-primary-700">{o.so_luong_tuyen}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-secondary-700 font-medium">
                                        {o.dia_diem_lam_viec}
                                    </td>
                                    <td className="px-6 py-4 text-sm space-y-1">
                                        <div className="text-red-500 text-xs font-bold flex items-center gap-1">
                                            <span className="material-icons-outlined text-[14px]">event_busy</span>
                                            {o.thoi_han_nop_ho_so ? new Date(o.thoi_han_nop_ho_so).toLocaleDateString('vi-VN') : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${o.trang_thai === 'Đang tuyển' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${o.trang_thai === 'Đang tuyển' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                            {o.trang_thai || 'Đang tuyển'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(o)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-100" title="Sửa">
                                                <span className="material-icons-outlined">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(o.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Xóa">
                                                <span className="material-icons-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-secondary-100 bg-secondary-50 text-center text-xs text-secondary-400">
                    Hiển thị {orders.length} kết quả
                </div>
            </div>
        </div>
    )
}
