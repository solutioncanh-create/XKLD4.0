import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'


export default function OrderMatching() {
    const [orders, setOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [loadingOrders, setLoadingOrders] = useState(false)

    // States for selected order logic
    const [matchedCandidates, setMatchedCandidates] = useState([])
    const [availableCandidates, setAvailableCandidates] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('list') // 'list' | 'add'
    const [loadingDetails, setLoadingDetails] = useState(false)


    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        if (selectedOrder) {
            setMatchedCandidates([])
            setAvailableCandidates([])
            fetchMatchedCandidates()
            if (activeTab === 'add') fetchAvailableCandidates()
        }
    }, [selectedOrder, activeTab])

    const fetchOrders = async () => {
        setLoadingOrders(true)
        try {
            const { data, error } = await supabase
                .from('don_hang')
                .select('*')
                .order('created_at', { ascending: false })
            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            console.error('Lỗi tải đơn hàng:', error)
        } finally {
            setLoadingOrders(false)
        }
    }

    const fetchMatchedCandidates = async () => {
        if (!selectedOrder) return
        setLoadingDetails(true)
        try {
            // Fetch necessary fields including 'anh_ho_so'
            const { data, error } = await supabase
                .from('lien_ket_don_hang_ho_so')
                .select(`
                    id, sbd, created_at,
                    ho_so:ho_so_id ( id, ho_ten, ngay_sinh, que_quan, anh_ho_so, nganh_nghe_mong_muon, so_dien_thoai, hon_nhan, chieu_cao, can_nang, nhom_mau )
                `)
                .eq('don_hang_id', selectedOrder.id)
                .order('sbd', { ascending: true })

            if (error) throw error
            setMatchedCandidates(data || [])
        } catch (error) {
            console.error('Lỗi tải danh sách ghép:', error)
            alert('Lỗi tải danh sách ghép: ' + error.message)
        } finally {
            setLoadingDetails(false)
        }
    }

    const fetchAvailableCandidates = async () => {
        if (!selectedOrder) return
        setLoadingDetails(true)
        try {
            // Get matched IDs
            const { data: matchedData, error: matchedError } = await supabase
                .from('lien_ket_don_hang_ho_so')
                .select('ho_so_id')
                .eq('don_hang_id', selectedOrder.id)

            if (matchedError) throw matchedError
            const matchedIds = matchedData.map(m => m.ho_so_id)

            // Query candidates
            let query = supabase
                .from('ho_so')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100)

            if (searchTerm) {
                query = query.ilike('ho_ten', `%${searchTerm}%`)
            }

            const { data, error } = await query
            if (error) throw error

            // Filter out already matched
            const filtered = data.filter(c => !matchedIds.includes(c.id))
            setAvailableCandidates(filtered)
        } catch (error) {
            console.error('Lỗi tìm ứng viên:', error)
        } finally {
            setLoadingDetails(false)
        }
    }

    const handleAddCandidate = async (candidate) => {
        if (!selectedOrder) return
        try {
            // Auto SBD logic
            let nextSBD = 1
            if (matchedCandidates.length > 0) {
                const max = Math.max(...matchedCandidates.map(m => parseInt(m.sbd || 0)))
                nextSBD = max + 1
            }
            const sbdString = nextSBD.toString().padStart(3, '0')

            const { error } = await supabase.from('lien_ket_don_hang_ho_so').insert([{
                don_hang_id: selectedOrder.id,
                ho_so_id: candidate.id,
                sbd: sbdString
            }])

            if (error) throw error

            alert(`Đã thêm ứng viên ${candidate.ho_ten} thành công!`)

            await fetchMatchedCandidates()
            setAvailableCandidates(prev => prev.filter(c => c.id !== candidate.id))

        } catch (error) {
            alert('Lỗi thêm ứng viên: ' + error.message)
        }
    }

    const handleRemoveCandidate = async (linkId) => {
        if (!window.confirm('Xóa ứng viên này khỏi danh sách thi tuyển?')) return
        try {
            const { error } = await supabase.from('lien_ket_don_hang_ho_so').delete().eq('id', linkId)
            if (error) throw error
            await fetchMatchedCandidates()
            if (activeTab === 'add') fetchAvailableCandidates()
        } catch (error) {
            alert('Lỗi xóa: ' + error.message)
        }
    }



    return (
        <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 animate-fade-in overflow-hidden pb-4">
            {/* LEFT PANEL */}
            <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-secondary-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-secondary-100 bg-secondary-50">
                    <h2 className="font-bold text-lg text-primary-900 flex items-center gap-2">
                        <span className="material-icons-outlined text-primary-600">list_alt</span>
                        Chọn Đơn Hàng
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loadingOrders ? (
                        <div className="text-center py-8"><span className="animate-spin inline-block w-6 h-6 border-2 border-primary-600 rounded-full border-t-transparent"></span></div>
                    ) : orders.map(order => (
                        <div
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className={`p-4 rounded-lg cursor-pointer border transition-all hover:shadow-md
                                ${selectedOrder?.id === order.id ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500' : 'bg-white border-secondary-100 hover:border-primary-300'}
                            `}
                        >
                            <div className="font-bold text-gray-800 line-clamp-1">{order.ten_don_hang}</div>
                            <div className="flex justify-between items-center mt-2 text-sm">
                                <span className="text-gray-500">{order.dia_diem_lam_viec}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.trang_thai === 'Đang tuyển' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {order.trang_thai}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-secondary-100 flex flex-col overflow-hidden relative">
                {!selectedOrder ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                        <span className="material-icons-outlined text-6xl mb-4 text-gray-200">touch_app</span>
                        <p className="text-lg font-medium">Chọn một đơn hàng từ danh sách bên trái để bắt đầu ghép ứng viên.</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-black text-gray-800">{selectedOrder.ten_don_hang}</h3>
                                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><span className="material-icons-outlined text-sm">place</span> {selectedOrder.dia_diem_lam_viec}</span>
                                    <span className="flex items-center gap-1"><span className="material-icons-outlined text-sm">payments</span> {selectedOrder.muc_luong || selectedOrder.luong_co_ban} ¥</span>
                                    <span className="flex items-center gap-1"><span className="material-icons-outlined text-sm">group</span> Cần tuyển: {selectedOrder.so_luong_tuyen}</span>
                                </div>
                            </div>
                            <div>
                                <Link
                                    to={`/in-danh-sach-pv/${selectedOrder.id}`}
                                    target="_blank"
                                    className={`px-4 py-2 text-white rounded-lg font-bold shadow flex items-center gap-2 transition-colors
                                        ${matchedCandidates.length === 0 ? 'bg-gray-400 cursor-not-allowed pointer-events-none' : 'bg-blue-600 hover:bg-blue-700'}
                                    `}
                                >
                                    <span className="material-icons-outlined">print</span>
                                    In Danh Sách
                                </Link>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 bg-gray-50">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors border-b-2
                                    ${activeTab === 'list' ? 'border-primary-600 text-primary-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}
                                `}
                            >
                                DANH SÁCH PHỎNG VẤN ({matchedCandidates.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('add')}
                                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors border-b-2
                                    ${activeTab === 'add' ? 'border-primary-600 text-primary-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}
                                `}
                            >
                                Thêm Ứng Viên (+)
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 relative">
                            {loadingDetails && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center"><span className="animate-spin w-8 h-8 border-2 border-primary-600 rounded-full border-t-transparent"></span></div>}

                            {activeTab === 'list' && (
                                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                    <table className="w-full text-left table-auto">
                                        <thead className="bg-gray-100 text-gray-500 text-xs uppercase font-bold">
                                            <tr>
                                                <th className="px-4 py-3 border-b text-center w-16">SBD</th>
                                                <th className="px-4 py-3 border-b text-center w-20">Ảnh</th>
                                                <th className="px-4 py-3 border-b">Họ Tên</th>
                                                <th className="px-4 py-3 border-b text-center w-16">Tuổi</th>
                                                <th className="px-4 py-3 border-b">Quê Quán</th>

                                                <th className="px-4 py-3 border-b text-right w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {matchedCandidates.length === 0 ? (
                                                <tr><td colSpan="10" className="p-8 text-center text-gray-400">Chưa có ứng viên nào.</td></tr>
                                            ) : matchedCandidates.map(item => (
                                                <tr key={item.id} className="hover:bg-blue-50 group transition-colors">
                                                    <td className="px-4 py-3 font-mono font-bold text-primary-600 text-center align-middle">{item.sbd}</td>
                                                    <td className="px-4 py-3 text-center align-middle">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 mx-auto">
                                                            {item.ho_so?.anh_ho_so ? (
                                                                <img src={item.ho_so.anh_ho_so} alt={item.ho_so.ho_ten} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="material-icons-outlined text-gray-400 text-2xl mt-1.5 leading-none">person</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-gray-900 align-middle">{item.ho_so ? item.ho_so.ho_ten : <span className="text-red-400 italic">Dữ liệu lỗi</span>}</td>
                                                    <td className="px-4 py-3 text-gray-500 text-center font-bold align-middle">
                                                        {item.ho_so?.ngay_sinh ? (new Date().getFullYear() - new Date(item.ho_so.ngay_sinh).getFullYear()) : ''}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 align-middle">{item.ho_so?.que_quan}</td>

                                                    <td className="px-4 py-3 text-right align-middle">
                                                        <button onClick={() => handleRemoveCandidate(item.id)} className="text-red-300 hover:text-red-500 transition-colors p-1" title="Xóa khỏi danh sách">
                                                            <span className="material-icons-outlined text-lg">cancel</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'add' && (
                                <div className="flex flex-col h-full">
                                    <div className="mb-4 relative">
                                        <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400">search</span>
                                        <input
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                                            placeholder="Tìm kiếm ứng viên theo tên..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && fetchAvailableCandidates()}
                                        />
                                    </div>
                                    <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-y-auto shadow-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-100 text-gray-500 text-xs uppercase font-bold sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-4 py-3 border-b">Ứng Viên</th>
                                                    <th className="px-4 py-3 border-b">Thông Tin</th>
                                                    <th className="px-4 py-3 border-b text-right">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {availableCandidates.map(c => {
                                                    const tuoi = c.ngay_sinh ? (new Date().getFullYear() - new Date(c.ngay_sinh).getFullYear()) : '??'
                                                    return (
                                                        <tr key={c.id} className="hover:bg-green-50 transition-colors">
                                                            <td className="px-4 py-3 flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                                                                    {c.anh_ho_so ? (
                                                                        <img src={c.anh_ho_so} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="material-icons-outlined text-lg">person</span></div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-gray-800">{c.ho_ten}</div>
                                                                    <div className="text-xs text-gray-400">{tuoi} tuổi</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                <div>{c.que_quan}</div>
                                                                <div className="text-xs text-gray-400">{c.nganh_nghe_mong_muon || 'LĐPT'}</div>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <button
                                                                    onClick={() => handleAddCandidate(c)}
                                                                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded shadow hover:bg-green-700 transition-colors flex items-center gap-1 ml-auto"
                                                                >
                                                                    <span className="material-icons-outlined text-sm">add</span> Chọn
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
