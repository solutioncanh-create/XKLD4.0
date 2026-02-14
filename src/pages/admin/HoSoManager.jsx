import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function HoSoManager() {
    const [profiles, setProfiles] = useState([])
    const [search, setSearch] = useState('')
    const [loadingList, setLoadingList] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        fetchProfiles()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchProfiles = async () => {
        setLoadingList(true)
        try {
            let query = supabase.from('ho_so').select('*').order('created_at', { ascending: false })
            if (search) {
                query = query.ilike('ho_ten', `%${search}%`)
            }
            const { data, error } = await query
            if (error) throw error
            setProfiles(data || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingList(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
            {/* Header Toolbar */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white sticky top-0 z-10">
                <div>
                    <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                        <span className="material-icons-outlined text-primary-600">people</span>
                        Danh sách hồ sơ ({profiles.length})
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Quản lý tất cả ứng viên trong hệ thống</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Tìm theo tên..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchProfiles()}
                            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64 transition-all group-hover:border-primary-300"
                        />
                        <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400 group-hover:text-primary-500 transition-colors">search</span>
                    </div>

                    <button onClick={() => navigate('/dang-ky')} className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-bold shadow-lg shadow-primary-200 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
                        <span className="material-icons-outlined">add_circle</span>
                        Thêm Mới
                    </button>
                </div>
            </div>

            {/* Table */}
            < div className="overflow-x-auto min-h-[400px]" >
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider sticky top-0">
                        <tr>
                            <th className="px-6 py-4 font-bold border-b border-gray-200">Ứng viên</th>
                            <th className="px-6 py-4 font-bold border-b border-gray-200">Thông tin liên hệ</th>
                            <th className="px-6 py-4 font-bold border-b border-gray-200">Nguyện vọng</th>
                            <th className="px-6 py-4 font-bold border-b border-gray-200">Ngày ĐK</th>
                            <th className="px-6 py-4 font-bold border-b border-gray-200 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {loadingList ? (
                            <tr><td colSpan="5" className="p-10 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></td></tr>
                        ) : profiles.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-gray-400 flex flex-col items-center">
                                    <span className="material-icons-outlined text-4xl mb-2 text-gray-300">search_off</span>
                                    <span>Không tìm thấy hồ sơ nào phù hợp.</span>
                                </td>
                            </tr>
                        ) : profiles.map(p => (
                            <tr key={p.id} className="hover:bg-blue-50/50 transition-colors group cursor-default">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img src={p.anh_ho_so || (p.gioi_tinh === 'Nữ' ? `https://avatar.iran.liara.run/public/girl?username=${p.ho_ten}` : `https://avatar.iran.liara.run/public/boy?username=${p.ho_ten}`)} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform" alt="" />
                                            {/* Status dot (example) */}
                                            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${p.gioi_tinh === 'Nữ' ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 text-base">{p.ho_ten}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <span className="material-icons-outlined text-[10px]">wc</span> {p.gioi_tinh} • {new Date().getFullYear() - (p.ngay_sinh ? new Date(p.ngay_sinh).getFullYear() : 2000)} tuổi
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="text-gray-800 font-medium flex items-center gap-2">
                                        <span className="material-icons-outlined text-gray-400 text-sm">call</span>
                                        {p.so_dien_thoai || '---'}
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1 flex items-center gap-2">
                                        <span className="material-icons-outlined text-gray-400 text-sm">location_on</span>
                                        {p.que_quan || '---'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                        {p.nganh_nghe_mong_muon || 'Chưa chọn'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(p.created_at).toLocaleDateString('vi-VN')}
                                    <br /><span className="text-xs text-gray-400 ">{new Date(p.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => navigate(`/ho-so/${p.id}`)}
                                        className="text-primary-600 hover:text-white border border-primary-200 hover:bg-primary-600 focus:ring-2 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <span className="material-icons-outlined text-lg mr-1">visibility</span>
                                        Chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div >
        </div >
    )
}
