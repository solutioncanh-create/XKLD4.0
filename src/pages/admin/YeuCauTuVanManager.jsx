import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function YeuCauTuVanManager() {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchLeads = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('yeu_cau_tu_van')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setLeads(data || [])
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error.message)
            // alert('Lỗi tải danh sách yêu cầu tư vấn!')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeads()
    }, [])

    const handleStatusChange = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('yeu_cau_tu_van')
                .update({ trang_thai: newStatus })
                .eq('id', id)

            if (error) throw error
            fetchLeads() // Reload lại để cập nhật UI
        } catch (error) {
            alert('Lỗi cập nhật trạng thái: ' + error.message)
        }
    }

    const deleteLead = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa yêu cầu này?')) return
        try {
            const { error } = await supabase.from('yeu_cau_tu_van').delete().eq('id', id)
            if (error) throw error
            fetchLeads()
        } catch (error) {
            alert('Lỗi xóa: ' + error.message)
        }
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Yêu Cầu Tư Vấn</h1>
                    <p className="text-gray-500 mt-1">Danh sách khách hàng tiềm năng từ Form & Modal</p>
                </div>
                <button onClick={fetchLeads} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                    <span className="material-icons-outlined text-lg">refresh</span>
                    <span>Làm mới</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Ngày gửi</th>
                                <th className="p-4 font-semibold">Họ Tên</th>
                                <th className="p-4 font-semibold">Số điện thoại</th>
                                <th className="p-4 font-semibold">Tuổi</th>
                                <th className="p-4 font-semibold">Quê quán</th>
                                <th className="p-4 font-semibold">Nội dung quan tâm</th>
                                <th className="p-4 font-semibold">Trạng thái</th>
                                <th className="p-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-500">Chưa có yêu cầu tư vấn nào.</td>
                                </tr>
                            ) : (
                                leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-500 text-sm whitespace-nowrap">
                                            {new Date(lead.created_at).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="p-4 font-bold text-gray-800">{lead.ho_ten}</td>
                                        <td className="p-4 font-mono text-primary-600 font-medium">{lead.so_dien_thoai}</td>
                                        <td className="p-4 text-gray-600">{lead.tuoi || '-'}</td>
                                        <td className="p-4 text-gray-600">{lead.que_quan}</td>
                                        <td className="p-4 text-gray-600 max-w-xs truncate" title={lead.ghi_chu}>
                                            {lead.ghi_chu}
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={lead.trang_thai || 'Chờ tư vấn'}
                                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 outline-none
                                                    ${lead.trang_thai === 'Đã liên hệ' ? 'bg-green-100 text-green-700' :
                                                        lead.trang_thai === 'Đã chốt' ? 'bg-blue-100 text-blue-700' :
                                                            lead.trang_thai === 'Hủy' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'}`}
                                            >
                                                <option value="Chờ tư vấn">Chờ tư vấn</option>
                                                <option value="Đã liên hệ">Đã liên hệ</option>
                                                <option value="Đã chốt">Đã chốt</option>
                                                <option value="Hủy">Hủy</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => deleteLead(lead.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <span className="material-icons-outlined">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
