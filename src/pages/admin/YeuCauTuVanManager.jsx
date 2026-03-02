import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function YeuCauTuVanManager() {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('All')
    const [searchTerm, setSearchTerm] = useState('')

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
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeads()
    }, [])

    const handleStatusChange = async (id, newStatus) => {
        // Optimistic update
        setLeads(leads.map(lead => lead.id === id ? { ...lead, trang_thai: newStatus } : lead))

        try {
            const { error } = await supabase
                .from('yeu_cau_tu_van')
                .update({ trang_thai: newStatus })
                .eq('id', id)

            if (error) {
                fetchLeads() // Revert if error
                throw error
            }
        } catch (error) {
            alert('Lỗi cập nhật: ' + error.message)
        }
    }

    const deleteLead = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa yêu cầu này?')) return
        try {
            const { error } = await supabase
                .from('yeu_cau_tu_van')
                .delete()
                .eq('id', id)
            if (error) {
                console.error('Delete error:', error)
                throw error
            }
            setLeads(prev => prev.filter(lead => lead.id !== id))
        } catch (error) {
            alert('Lỗi xóa: ' + (error.message || JSON.stringify(error)))
        }
    }

    const filteredLeads = leads.filter(l => {
        const matchesStatus = filterStatus === 'All' || l.trang_thai === filterStatus
        const matchesSearch = l.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.so_dien_thoai?.includes(searchTerm) ||
            l.email?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.trang_thai === 'Chờ tư vấn').length,
        contacted: leads.filter(l => l.trang_thai === 'Đã liên hệ').length,
        done: leads.filter(l => l.trang_thai === 'Đã chốt').length
    }

    const STATUS_OPTIONS = ['Chờ tư vấn', 'Đã liên hệ', 'Đã chốt', 'Hủy']

    return (
        <div className="admin-page">

            <div className="admin-toolbar">
                {['All', ...STATUS_OPTIONS].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`admin-chip ${filterStatus === status ? 'active' : ''}`}
                    >
                        {status === 'All' ? 'Tất cả' : status}
                    </button>
                ))}
            </div>

            <div className="no-scrollbar">
                {loading ? (
                    <div className="admin-spinner-wrap"><div className="admin-spinner" /></div>
                ) : filteredLeads.length === 0 ? (
                    <div className="admin-panel admin-empty">
                        <span className="material-icons-outlined" style={{ fontSize: '2rem', color: '#e2e8f0' }}>search_off</span>
                        <p>Không tìm thấy yêu cầu nào.</p>
                    </div>
                ) : (
                    <div>
                        {/* Mobile */}
                        <div className="md:hidden grid grid-cols-1 gap-4">
                            {filteredLeads.map(lead => (
                                <LeadCard
                                    key={lead.id}
                                    lead={lead}
                                    onStatusChange={handleStatusChange}
                                    onDelete={() => deleteLead(lead.id)}
                                />
                            ))}
                        </div>

                        {/* Desktop */}
                        <div className="hidden md:block admin-panel">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Ứng viên</th>
                                        <th>Liên hệ</th>
                                        <th>Nhu cầu</th>
                                        <th>Trạng thái</th>
                                        <th style={{ textAlign: 'right' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.map(lead => (
                                        <LeadRow
                                            key={lead.id}
                                            lead={lead}
                                            onStatusChange={handleStatusChange}
                                            onDelete={() => deleteLead(lead.id)}
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
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">{label}</p>
                <p className="text-2xl font-black text-gray-800">{count}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white shadow-md bg-opacity-90`}>
                <span className="material-icons-outlined">{icon}</span>
            </div>
        </div>
    )
}

function LeadCard({ lead, onStatusChange, onDelete }) {
    const STATUS_OPTIONS = ['Chờ tư vấn', 'Đã liên hệ', 'Đã chốt', 'Hủy']

    // Helpers
    const formatDate = (dateString) => {
        if (!dateString) return ''
        return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Chờ tư vấn': return 'bg-amber-50 text-amber-600 border-amber-100'
            case 'Đã liên hệ': return 'bg-blue-50 text-blue-600 border-blue-100'
            case 'Đã chốt': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'Hủy': return 'bg-rose-50 text-rose-600 border-rose-100'
            default: return 'bg-slate-100 text-slate-500 border-slate-200'
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow transition-all flex flex-col h-full group">

            <div className="p-4 flex-1 flex flex-col">
                {/* Header: Name & Status */}
                <div className="flex justify-between items-start gap-3 mb-3">
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm leading-snug" title={lead.ho_ten}>{lead.ho_ten}</h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{formatDate(lead.created_at)}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusStyle(lead.trang_thai)}`}>
                        {lead.trang_thai}
                    </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-xs mb-3">
                    <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-1.5 group/phone cursor-pointer" onClick={() => window.open(`tel:${lead.so_dien_thoai}`)}>
                        <span className="text-slate-400 flex items-center gap-1"><span className="material-icons-outlined text-[14px]">phone</span> SĐT</span>
                        <span className="font-bold text-blue-600 font-mono group-hover/phone:underline">{lead.so_dien_thoai}</span>
                    </div>

                    {lead.email && (
                        <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-1.5">
                            <span className="text-slate-400 flex items-center gap-1"><span className="material-icons-outlined text-[14px]">email</span> Email</span>
                            <span className="font-medium text-slate-700 truncate max-w-[120px]" title={lead.email}>{lead.email}</span>
                        </div>
                    )}
                </div>

                {/* Attributes (Gender, Age, Hometown) */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 text-[10px] text-slate-500 border border-slate-100">
                        <span className="material-icons-outlined text-[12px]">person</span>
                        {lead.gioi_tinh || '?'} • {lead.tuoi ? `${lead.tuoi}t` : '?'} • {lead.que_quan || '??'}
                    </span>
                </div>

                {/* Note */}
                {lead.ghi_chu && (
                    <div className="mt-auto bg-slate-50 p-2 rounded border border-slate-100 text-xs text-slate-600 italic">
                        <span className="font-bold text-[10px] text-slate-400 uppercase block mb-0.5">Nhu cầu:</span>
                        <span className="line-clamp-3">{lead.ghi_chu}</span>
                    </div>
                )}
            </div>

            {/* Footer Actions - Compact */}
            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                {/* Status Changer */}
                <div className="relative group/status cursor-pointer">
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                        <span className="material-icons-outlined text-[14px]">sync_alt</span>
                        Đổi trạng thái
                    </div>
                    <select
                        value={lead.trang_thai}
                        onChange={(e) => onStatusChange(lead.id, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-1">
                    <a href={`tel:${lead.so_dien_thoai}`} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Gọi ngay">
                        <span className="material-icons-outlined text-[16px]">call</span>
                    </a>
                    <button onClick={() => onDelete()} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" title="Xóa">
                        <span className="material-icons-outlined text-[16px]">delete</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

function LeadRow({ lead, onStatusChange, onDelete }) {
    const STATUS_OPTIONS = ['Chờ tư vấn', 'Đã liên hệ', 'Đã chốt', 'Hủy']

    const formatDate = (dateString) => {
        if (!dateString) return ''
        return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Chờ tư vấn': return 'bg-amber-50 text-amber-600 border-amber-100 ring-1 ring-amber-200/50'
            case 'Đã liên hệ': return 'bg-blue-50 text-blue-600 border-blue-100 ring-1 ring-blue-200/50'
            case 'Đã chốt': return 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-1 ring-emerald-200/50'
            case 'Hủy': return 'bg-rose-50 text-rose-600 border-rose-100 ring-1 ring-rose-200/50'
            default: return 'bg-slate-50 text-slate-500 border-slate-100'
        }
    }

    return (
        <tr className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-6 py-3 align-top">
                <div>
                    <p className="font-bold text-slate-800 text-sm">{lead.ho_ten}</p>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        <span className="material-icons-outlined text-[10px]">schedule</span>
                        {formatDate(lead.created_at)}
                    </p>
                    <div className="text-sm text-slate-500 mt-1.5 flex items-center gap-1">
                        <span className="material-icons-outlined text-[12px] text-slate-400">person</span>
                        {lead.gioi_tinh || '?'} - {lead.tuoi || '?'}t - {lead.que_quan || '?'}
                    </div>
                </div>
            </td>
            <td className="px-6 py-3 align-top">
                <div className="space-y-1">
                    <span
                        className="block text-sm font-bold text-slate-700 font-mono hover:text-blue-600 transition-colors cursor-pointer"
                        onClick={() => window.open(`tel:${lead.so_dien_thoai}`)}
                    >
                        {lead.so_dien_thoai}
                    </span>
                    {lead.email && (
                        <span className="block text-sm text-slate-500 truncate max-w-[150px]" title={lead.email}>
                            {lead.email}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-6 py-3 align-top">
                <div className="max-w-[280px]">
                    {lead.ghi_chu ? (
                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic line-clamp-3 leading-relaxed">
                            {lead.ghi_chu}
                        </p>
                    ) : (
                        <span className="text-sm text-slate-400 italic">Không có ghi chú</span>
                    )}
                </div>
            </td>
            <td className="px-6 py-3 align-top">
                <div className="relative inline-block group/status">
                    <button className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusStyle(lead.trang_thai)} hover:shadow-sm transition-all bg-white`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                        {lead.trang_thai}
                        <span className="material-icons-outlined text-[12px] ml-0.5 opacity-50">expand_more</span>
                    </button>
                    <select
                        value={lead.trang_thai}
                        onChange={(e) => onStatusChange(lead.id, e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </td>
            <td className="px-6 py-3 align-top text-right">
                <div className="flex items-center justify-end gap-3">
                    <a href={`tel:${lead.so_dien_thoai}`} className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Gọi ngay">
                        <span className="material-icons-outlined text-[16px]">call</span>
                    </a>
                    <button onClick={() => onDelete()} className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Xóa">
                        <span className="material-icons-outlined text-[16px]">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    )
}
