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
        if (!confirm('Bạn có chắc muốn xóa yêu cầu này?')) return
        try {
            const { error } = await supabase.from('yeu_cau_tu_van').delete().eq('id', id)
            if (error) throw error
            setLeads(leads.filter(lead => lead.id !== id))
        } catch (error) {
            alert('Lỗi xóa: ' + error.message)
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
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            {/* Header Stats - Hidden on Mobile */}
            <div className="hidden md:flex overflow-x-auto gap-3 pb-2 mb-4 px-4 pt-4 no-scrollbar snap-x">
                <div className="min-w-[140px] snap-center"><StatCard label="Tổng yêu cầu" count={stats.total} icon="list_alt" color="bg-blue-500" /></div>
                <div className="min-w-[140px] snap-center"><StatCard label="Chờ tư vấn" count={stats.new} icon="notifications_active" color="bg-yellow-500" /></div>
                <div className="min-w-[140px] snap-center"><StatCard label="Đã liên hệ" count={stats.contacted} icon="phone_in_talk" color="bg-purple-500" /></div>
                <div className="min-w-[140px] snap-center"><StatCard label="Đã chốt đơn" count={stats.done} icon="check_circle" color="bg-green-500" /></div>
            </div>

            {/* Toolbar - Natural Scroll */}
            <div className="bg-gray-50 px-3 pt-3 md:px-4 mb-4">
                {/* Search Bar & Action Buttons */}
                <div className="flex gap-2 items-center mb-3">
                    {/* Client Search - Visible on Mobile */}
                    <div className="flex relative flex-1">
                        <span className="material-icons-outlined absolute left-3 top-3 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Tìm tên, SĐT, email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-base font-medium focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button onClick={fetchLeads} className="hidden md:flex w-10 h-10 items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 active:scale-95 transition-all shadow-sm ml-auto">
                        <span className="material-icons-outlined">refresh</span>
                    </button>
                </div>

                {/* Filter Buttons - Horizontal Scroll */}
                <div className="flex overflow-x-auto pb-2 gap-2 md:flex-wrap md:overflow-visible no-scrollbar mask-gradient-right mb-2">
                    {['All', ...STATUS_OPTIONS].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`shrink-0 h-[44px] px-3.5 rounded-xl text-sm font-bold transition-all border shadow-sm whitespace-nowrap ${filterStatus === status
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {status === 'All' ? 'Tất cả' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area - Natural Scroll */}
            <div className="px-3 md:px-4 no-scrollbar">
                {/* Grid Content */}
                {loading ? (
                    <div className="flex justify-center py-10"><span className="animate-spin w-8 h-8 border-2 border-primary-600 rounded-full border-t-transparent"></span></div>
                ) : (filteredLeads.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        <span className="material-icons-outlined text-4xl mb-2 text-gray-300">search_off</span>
                        <p>Không tìm thấy yêu cầu nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredLeads.map(lead => (
                            <LeadCard
                                key={lead.id}
                                lead={lead}
                                onStatusChange={handleStatusChange}
                                onDelete={() => deleteLead(lead.id)}
                            />
                        ))}
                    </div>
                ))}
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
    const statusColors = {
        'Chờ tư vấn': 'bg-yellow-500',
        'Đã liên hệ': 'bg-purple-500',
        'Đã chốt': 'bg-green-500',
        'Hủy': 'bg-red-500'
    }

    const currentStatusColor = statusColors[lead.trang_thai] || 'bg-gray-400'
    const STATUS_OPTIONS = ['Chờ tư vấn', 'Đã liên hệ', 'Đã chốt', 'Hủy']

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden transition-all active:scale-[0.99] hover:shadow-md h-full">
            {/* Status Bar */}
            <div className={`h-1.5 w-full ${currentStatusColor}`}></div>

            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight mb-0.5" title={lead.ho_ten}>{lead.ho_ten}</h3>
                        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            <span className="material-icons-outlined text-[10px]">schedule</span>
                            {new Date(lead.created_at).toLocaleString('vi-VN')}
                        </span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white whitespace-nowrap ${currentStatusColor}`}>
                        {lead.trang_thai}
                    </span>
                </div>

                <div className="space-y-3 flex-1">
                    {/* Phone Block */}
                    <div className="bg-blue-50 rounded-lg p-2.5 flex items-center justify-between group cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => window.open(`tel:${lead.so_dien_thoai}`)}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                <span className="material-icons-outlined text-sm">phone_in_talk</span>
                            </div>
                            <div>
                                <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">Số điện thoại</p>
                                <p className="font-mono font-black text-blue-700 text-sm tracking-tight">{lead.so_dien_thoai}</p>
                            </div>
                        </div>
                        <span className="material-icons-outlined text-blue-300 group-active:text-blue-600">call</span>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        {lead.email && (
                            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100 max-w-full">
                                <span className="material-icons-outlined text-[12px] text-gray-400">email</span>
                                <span className="truncate">{lead.email}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            <span className="material-icons-outlined text-[12px] text-gray-400">person_outline</span>
                            <span>{lead.gioi_tinh || '?'} • {lead.tuoi ? `${lead.tuoi}t` : '?'} • {lead.que_quan || '??'}</span>
                        </div>
                    </div>

                    {lead.ghi_chu && (
                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-2">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="material-icons-outlined text-[10px] text-gray-400">sticky_note_2</span>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Nội dung quan tâm</p>
                            </div>
                            <p className="text-gray-700 text-xs line-clamp-3 leading-relaxed break-words">
                                {lead.ghi_chu}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="grid grid-cols-3 border-t border-slate-100 divide-x divide-slate-100 bg-slate-50/50">
                <a href={`tel:${lead.so_dien_thoai}`} className="flex flex-col items-center justify-center gap-1 h-[50px] hover:bg-white transition-colors group">
                    <span className="material-icons-outlined text-emerald-500 text-xl group-hover:scale-110 transition-transform">call</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Gọi</span>
                </a>

                <div className="relative group flex flex-col items-center justify-center gap-1 h-[50px] hover:bg-white transition-colors cursor-pointer">
                    <span className="material-icons-outlined text-purple-500 text-xl group-hover:text-emerald-600 group-hover:scale-110 transition-transform">change_circle</span>
                    <span className="text-[10px] font-bold text-purple-600 uppercase group-hover:text-emerald-600">Trạng thái</span>
                    <select
                        value={lead.trang_thai}
                        onChange={(e) => onStatusChange(lead.id, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <button onClick={() => onDelete(lead.id)} className="flex flex-col items-center justify-center gap-1 h-[50px] hover:bg-white transition-colors group">
                    <span className="material-icons-outlined text-rose-400 text-xl group-hover:scale-110 transition-transform">delete</span>
                    <span className="text-[10px] font-bold text-rose-500 uppercase">Xóa</span>
                </button>
            </div>
        </div>
    )
}
