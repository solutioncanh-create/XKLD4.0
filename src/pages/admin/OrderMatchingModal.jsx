import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Font Roboto Base64 (Subset minimal or full) - Using a standard font workaround for Vietnamese
// For now, we will rely on standard font and see if we can use a CDN approach or just basic ASCII mapped.
// BETTER APPROACH: Use a helper function that adds the font.
// Since adding a 1MB base64 string here is bad practice, we will try to fetch the font at runtime or use standard font (which might break Vietnamese).
// Let's try fetching font from a public URL (Google Fonts or CDN) and adding it to VFS.

export default function OrderMatchingModal({ order, onClose }) {
    const [activeTab, setActiveTab] = useState('list') // 'list' | 'add'
    const [matchedCandidates, setMatchedCandidates] = useState([])
    const [availableCandidates, setAvailableCandidates] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (order) {
            fetchMatchedCandidates()
            if (activeTab === 'add') fetchAvailableCandidates()
        }
    }, [order, activeTab])

    const fetchMatchedCandidates = async () => {
        setLoading(true)
        try {
            // Join lien_ket -> ho_so
            const { data, error } = await supabase
                .from('lien_ket_don_hang_ho_so')
                .select(`
                    id, sbd, created_at,
                    ho_so ( id, ho_ten, nam_sinh, que_quan, anh_ho_so, chuyen_mon, so_dien_thoai )
                `)
                .eq('don_hang_id', order.id)
                .order('sbd', { ascending: true })

            if (error) throw error
            setMatchedCandidates(data || [])
        } catch (error) {
            console.error('Lỗi tải danh sách ghép:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchAvailableCandidates = async () => {
        setLoading(true)
        try {
            // Lấy danh sách hồ sơ CHƯA có trong đơn hàng này (cần loại trừ ID đã có)
            // Supabase không hỗ trợ NOT IN trực tiếp với subquery phức tạp dễ dàng, 
            // nên ta lấy hết (limit) rồi filter client-side hoặc dùng logic đơn giản.
            // Cách tốt nhất: Lấy Top 50 hồ sơ mới nhất rồi filter.

            // 1. Lấy ID đã matched
            const matchedIds = matchedCandidates.map(m => m.ho_so.id)

            // 2. Query hồ sơ (đang rảnh hoặc phù hợp)
            let query = supabase.from('ho_so').select('*').order('created_at', { ascending: false }).limit(100)

            if (searchTerm) {
                query = query.ilike('ho_ten', `%${searchTerm}%`)
            }

            const { data, error } = await query
            if (error) throw error

            // 3. Filter client-side để loại bỏ người đã có trong đơn này
            const filtered = data.filter(c => !matchedIds.includes(c.id))
            setAvailableCandidates(filtered)

        } catch (error) {
            console.error('Lỗi tìm ứng viên:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddCandidate = async (candidate) => {
        try {
            // 1. Tự động tính SBD tiếp theo
            // Logic: Lấy max SBD hiện tại + 1. SBD dạng '001'.
            let nextSBD = 1
            if (matchedCandidates.length > 0) {
                // Lấy số lớn nhất (giả sử SBD luôn là số)
                const max = Math.max(...matchedCandidates.map(m => parseInt(m.sbd || 0)))
                nextSBD = max + 1
            }
            const sbdString = nextSBD.toString().padStart(3, '0')

            // 2. Insert vào bảng link
            const { error } = await supabase.from('lien_ket_don_hang_ho_so').insert([{
                don_hang_id: order.id,
                ho_so_id: candidate.id,
                sbd: sbdString
            }])

            if (error) throw error

            // 3. Update UI
            alert(`Đã thêm ${candidate.ho_ten} - SBD: ${sbdString}`)
            fetchMatchedCandidates() // Refresh list đã ghép
            // Remove from available list locally
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
            fetchMatchedCandidates()
        } catch (error) {
            alert('Lỗi xóa: ' + error.message)
        }
    }

    // --- PDF EXPORT LOGIC ---
    const handlePrintExamList = async () => {
        const doc = new jsPDF()

        // Thêm font tiếng Việt (Cần xử lý font, tạm thời dùng text không dấu hoặc mặc định)
        // Workaround: Dùng hàm removeAccents để in text không dấu cho an toàn nếu không có font
        // Hoặc load font từ CDN (phức tạp). Ở đây ta dùng removeAccents cho đơn giản ban đầu.

        const removeAccents = (str) => {
            return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D") : ""
        }

        // Header
        doc.setFontSize(18)
        doc.text("DANH SACH THI TUYEN", 105, 20, { align: "center" })

        doc.setFontSize(12)
        doc.text(`Don hang: ${removeAccents(order.ten_don_hang)}`, 14, 30)
        doc.text(`Ngay thi: ${order.ngay_tuyen_du_kien || '...'}`, 14, 36)
        doc.text(`Dia diem: ${removeAccents(order.dia_diem_lam_viec)}`, 14, 42)

        // Table
        const tableColumn = ["SBD", "HO TEN", "NAM SINH", "QUE QUAN", "SDT", "GHI CHU"]
        const tableRows = []

        matchedCandidates.forEach(item => {
            const candidate = item.ho_so
            const row = [
                item.sbd,
                removeAccents(candidate.ho_ten).toUpperCase(),
                candidate.nam_sinh,
                removeAccents(candidate.que_quan),
                candidate.so_dien_thoai,
                "" // Ghi chú trống để giám thị điền
            ]
            tableRows.push(row)
        })

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] }, // Primary Green
        })

        doc.save(`Danh_Sach_Thi_Tuyel_${order.id}.pdf`)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="material-icons-outlined text-primary-600">assignment_ind</span>
                            Ghép Đơn & Danh Sách Thi Tuyển
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Đơn hàng: <span className="font-bold text-primary-700">{order.ten_don_hang}</span> (ID: {order.id})</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors border-b-2
                            ${activeTab === 'list' ? 'border-primary-600 text-primary-700 bg-primary-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        Danh Sách Đã Ghép ({matchedCandidates.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors border-b-2
                            ${activeTab === 'add' ? 'border-primary-600 text-primary-700 bg-primary-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        Thêm Ứng Viên (+)
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden p-6 bg-gray-50/30">
                    {loading && <div className="text-center py-4"><span className="animate-spin inline-block w-6 h-6 border-2 border-primary-600 rounded-full border-t-transparent"></span></div>}

                    {!loading && activeTab === 'list' && (
                        <div className="h-full flex flex-col">
                            {/* Toolbar */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-500">
                                    Tổng cộng: <span className="font-bold text-gray-800">{matchedCandidates.length}</span> ứng viên
                                </div>
                                <button
                                    onClick={handlePrintExamList}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-red-700 flex items-center gap-2 transition-all"
                                >
                                    <span className="material-icons-outlined">picture_as_pdf</span>
                                    Xuất Danh Sách Thi Tuyển
                                </button>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-gray-100">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-100 text-gray-500 text-xs uppercase sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 font-bold border-b">SBD</th>
                                            <th className="px-4 py-3 font-bold border-b">Họ Tên</th>
                                            <th className="px-4 py-3 font-bold border-b">Năm sinh</th>
                                            <th className="px-4 py-3 font-bold border-b">Quê quán</th>
                                            <th className="px-4 py-3 font-bold border-b text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {matchedCandidates.length === 0 ? (
                                            <tr><td colSpan="5" className="p-8 text-center text-gray-400">Chưa có ứng viên nào trong danh sách.</td></tr>
                                        ) : matchedCandidates.map((item) => (
                                            <tr key={item.id} className="hover:bg-blue-50 transition-colors group">
                                                <td className="px-4 py-3">
                                                    <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded font-mono font-bold">{item.sbd}</span>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-gray-800">{item.ho_so.ho_ten}</td>
                                                <td className="px-4 py-3 text-gray-600">{item.ho_so.nam_sinh}</td>
                                                <td className="px-4 py-3 text-gray-600">{item.ho_so.que_quan}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleRemoveCandidate(item.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors" title="Xóa khỏi danh sách">
                                                        <span className="material-icons-outlined text-lg">remove_circle_outline</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {!loading && activeTab === 'add' && (
                        <div className="h-full flex flex-col">
                            {/* Search */}
                            <div className="mb-4 relative">
                                <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400">search</span>
                                <input
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Tìm kiếm ứng viên theo tên..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && fetchAvailableCandidates()}
                                />
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-gray-100">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-100 text-gray-500 text-xs uppercase sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 font-bold border-b">Ứng viên</th>
                                            <th className="px-4 py-3 font-bold border-b">Thông tin</th>
                                            <th className="px-4 py-3 font-bold border-b text-right">Chọn</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {availableCandidates.map((c) => (
                                            <tr key={c.id} className="hover:bg-green-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-gray-800">{c.ho_ten}</div>
                                                    <div className="text-xs text-gray-400">{new Date().getFullYear() - c.nam_sinh} tuổi</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    <div>{c.que_quan}</div>
                                                    <div className="text-xs text-gray-400">{c.chuyen_mon || 'LĐPT'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleAddCandidate(c)} className="bg-green-600 text-white px-3 py-1.5 rounded shadow-sm hover:bg-green-700 transition-colors text-sm font-bold flex items-center gap-1 ml-auto">
                                                        <span className="material-icons-outlined text-sm">add</span> Thêm
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
