import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { hasPermission, Permissions } from '../utils/auth'

export default function ChiTietHoSo() {
    const { id } = useParams()
    const [hoSo, setHoSo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const [nguonInput, setNguonInput] = useState('')

    useEffect(() => {
        if (hoSo) setNguonInput(hoSo.nguon || '')
    }, [hoSo])

    const handleSaveNguon = async () => {
        if (!hoSo || nguonInput === hoSo.nguon) return
        try {
            const { error } = await supabase
                .from('ho_so')
                .update({ nguon: nguonInput.toUpperCase() })
                .eq('id', id)

            if (error) throw error
            setHoSo({ ...hoSo, nguon: nguonInput.toUpperCase() })
        } catch (error) {
            console.error('Error updating Nguon:', error)
            alert('Lỗi cập nhật Nguồn: ' + error.message)
        }
    }

    useEffect(() => {
        const fetchChiTiet = async () => {
            try {
                if (!id) throw new Error('ID hồ sơ không hợp lệ')

                const { data, error } = await supabase
                    .from('ho_so')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) throw error
                setHoSo(data)
            } catch (error) {
                console.error('Lỗi tải chi tiết:', error)
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        fetchChiTiet()
    }, [id])

    const handleDelete = async () => {
        if (window.confirm('CẢNH BÁO: Hành động này không thể hoàn tác.\nBạn có chắc chắn muốn xóa hồ sơ này?')) {
            try {
                const { error } = await supabase.from('ho_so').delete().eq('id', id)
                if (error) throw error
                alert('Đã xóa hồ sơ thành công!')
                navigate('/admin')
            } catch (error) {
                alert('Lỗi xóa hồ sơ: ' + error.message)
            }
        }
    }

    if (loading) return <div className="text-center p-10 text-primary-600 font-medium">Đang tải dữ liệu...</div>
    if (error) return <div className="text-center p-10 text-red-500 font-bold">Lỗi: {error}</div>
    if (!hoSo) return <div className="text-center p-10 text-red-500 font-bold">Không tìm thấy hồ sơ!</div>



    const canPrint = hasPermission(Permissions.PRINT_EXPORT)

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 mt-[10px]">
            {/* Header & Navigation */}
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up">
                <Link to="/admin/ho-so" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all group">
                    <span className="group-hover:-translate-x-1 transition-transform material-icons-outlined text-sm">arrow_back</span> Lưu lại và về home
                </Link>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                    <button
                        onClick={handleDelete}
                        className="px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center gap-2 transition-colors text-sm shadow-sm"
                    >
                        <span className="material-icons-outlined text-base">delete</span> Xóa
                    </button>
                    <Link
                        to={`/sua-ho-so/${id}`}
                        className="px-3 py-2 bg-white border border-yellow-200 text-yellow-600 rounded-lg hover:bg-yellow-50 font-medium flex items-center gap-2 transition-colors text-sm shadow-sm"
                    >
                        <span className="material-icons-outlined text-base">edit</span> Sửa
                    </Link>
                    {canPrint && (
                        <button
                            onClick={() => window.open(`/in-ho-so/${id}`, '_blank')}
                            className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all text-sm"
                        >
                            <span className="material-icons-outlined text-base">print</span> In HS
                        </button>
                    )}
                    {canPrint && (
                        <button
                            onClick={() => window.open(`/in-ho-so-jp/${id}`, '_blank')}
                            className="px-3 py-2 bg-white border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 font-medium flex items-center gap-2 shadow-sm transition-colors text-sm"
                        >
                            <span className="material-icons-outlined text-base">language</span> In Tiếng Nhật
                        </button>
                    )}
                </div>
            </div>

            {/* Main Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in">

                {/* Cover & Avatar Header */}
                <div className="h-[100px] bg-gradient-to-r from-primary-600 to-primary-800 relative">
                    <div className="absolute inset-0 bg-pattern opacity-10"></div>

                    {/* Center Controls */}
                    <div className="absolute top-4 left-0 right-0 hidden md:flex justify-center items-center gap-3 px-4 pointer-events-none">
                        <div className="flex items-center gap-6 pointer-events-auto bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 shadow-lg min-w-[500px] justify-center">

                            {/* 1. Job Select */}
                            <div className="relative group flex-1">
                                <select
                                    value={hoSo.nganh_nghe_mong_muon || ''}
                                    onChange={async (e) => {
                                        const val = e.target.value;
                                        try {
                                            await supabase.from('ho_so').update({ nganh_nghe_mong_muon: val }).eq('id', id);
                                            setHoSo({ ...hoSo, nganh_nghe_mong_muon: val });
                                        } catch (err) { alert('Lỗi: ' + err.message) }
                                    }}
                                    className="w-full bg-white/10 text-white text-xs font-bold outline-none cursor-pointer appearance-none pl-4 pr-10 py-2 rounded-lg hover:bg-white/20 transition-colors [&>option]:text-gray-900 border border-transparent focus:border-white/30 truncate text-center min-w-[160px]"
                                >
                                    <option value="">-- Ngành nghề --</option>
                                    {[
                                        'Thực phẩm', 'Thủy sản', 'Cơ khí', 'Xây dựng', 'May mặc',
                                        'Nông nghiệp', 'Đóng gói', 'Vệ sinh tòa nhà', 'Hộ lý', 'Kỹ sư', 'Khác'
                                    ].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <span className="material-icons-outlined text-white text-[10px] absolute right-3 top-2.5 pointer-events-none">expand_more</span>
                            </div>

                            <div className="w-px h-6 bg-white/20"></div>

                            {/* 2. Status Select */}
                            <div className="relative group flex-1">
                                <select
                                    value={hoSo.trang_thai || ''}
                                    onChange={async (e) => {
                                        const val = e.target.value;
                                        try {
                                            await supabase.from('ho_so').update({ trang_thai: val }).eq('id', id);
                                            setHoSo({ ...hoSo, trang_thai: val });
                                        } catch (err) { alert('Lỗi: ' + err.message) }
                                    }}
                                    className="w-full bg-white/10 text-white text-xs font-bold outline-none cursor-pointer appearance-none pl-4 pr-10 py-2 rounded-lg hover:bg-white/20 transition-colors [&>option]:text-gray-900 border border-transparent focus:border-white/30 text-center"
                                >
                                    {[
                                        'Mới đăng ký', 'Đã tư vấn', 'Đợi đơn', 'Chờ phỏng vấn',
                                        'Đỗ đơn', 'Đã trúng tuyển', 'Đã xuất cảnh', 'Hủy hồ sơ', 'Rút đơn'
                                    ].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <span className="material-icons-outlined text-white text-[10px] absolute right-3 top-2.5 pointer-events-none">expand_more</span>
                            </div>

                            <div className="w-px h-6 bg-white/20"></div>

                            {/* 3. Nguồn */}
                            <div className="bg-white/10 px-5 py-1.5 rounded-lg flex items-center gap-3 hover:bg-white/20 transition-colors">
                                <span className="text-white font-mono text-xs opacity-90 whitespace-nowrap font-bold">Nguồn:</span>
                                <input
                                    value={nguonInput}
                                    onChange={(e) => setNguonInput(e.target.value.toUpperCase())}
                                    onBlur={handleSaveNguon}
                                    onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                    className="bg-transparent text-white font-bold font-mono outline-none w-20 text-center placeholder-white/50 border-b border-white/30 focus:border-white transition-colors uppercase text-sm"
                                    placeholder="###"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-8 relative flex flex-col sm:flex-row items-end -mt-10 mb-8">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-2xl flex-shrink-0 relative group">
                        {hoSo.anh_ho_so ? (
                            <img src={hoSo.anh_ho_so} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold bg-gray-100">
                                {hoSo.ho_ten ? hoSo.ho_ten.charAt(0) : '?'}
                            </div>
                        )}
                    </div>
                    <div className="mt-4 sm:ml-6 sm:mb-2 flex-grow text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            {hoSo.ho_ten}
                            {hoSo.nickname && <span className="text-lg font-normal text-gray-500 ml-2">({hoSo.nickname})</span>}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1"><span className="material-icons-outlined text-base">cake</span> {hoSo.ngay_sinh ? new Date(hoSo.ngay_sinh).getFullYear() : 'N/A'}</span>
                            <span className="flex items-center gap-1"><span className="material-icons-outlined text-base">wc</span> {hoSo.gioi_tinh}</span>
                            <span className="flex items-center gap-1"><span className="material-icons-outlined text-base">place</span> {hoSo.que_quan || '---'}</span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="px-8 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Section 1: Thông tin cá nhân */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b-2 border-primary-100 pb-2">
                            <span className="material-icons-outlined text-primary-600 bg-primary-50 p-1 rounded">person</span>
                            Thông Tin Cá Nhân
                        </h3>
                        <div className="bg-gray-50/50 rounded-xl p-6 space-y-4 border border-gray-100">
                            <InfoRow label="Ngày sinh" value={hoSo.ngay_sinh ? new Date(hoSo.ngay_sinh).toLocaleDateString('vi-VN') : ''} />
                            <InfoRow label="Giới tính" value={hoSo.gioi_tinh} />
                            <InfoRow label="Hôn nhân" value={hoSo.hon_nhan} />
                            <InfoRow label="Tôn giáo" value={hoSo.ton_giao} />
                            <InfoRow label="SĐT" value={hoSo.so_dien_thoai} highlight />
                            <InfoRow label="Email" value={hoSo.email} />
                            <InfoRow label="Quê quán" value={hoSo.que_quan} />
                            <InfoRow label="Thường trú" value={hoSo.dia_chi_thuong_tru} />
                            <div className="pt-4 mt-2 border-t border-gray-100 border-dashed">
                                <InfoRow label="Số CCCD" value={hoSo.so_cccd} />
                                <InfoRow label="Ngày cấp" value={hoSo.ngay_cap_cccd ? new Date(hoSo.ngay_cap_cccd).toLocaleDateString('vi-VN') : ''} />
                                <InfoRow label="Nơi cấp" value={hoSo.noi_cap_cccd} />
                            </div>
                            <InfoRow label="Hộ chiếu" value={hoSo.so_ho_chieu} highlight />
                        </div>
                    </div>

                    {/* Section 2: Sức khỏe & Ngoại hình */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b-2 border-primary-100 pb-2">
                            <span className="material-icons-outlined text-primary-600 bg-primary-50 p-1 rounded">health_and_safety</span>
                            Sức Khỏe & Ngoại Hình
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-primary-50 to-white p-4 rounded-xl text-center border border-primary-100 shadow-sm">
                                <span className="block text-primary-400 text-xs uppercase font-bold tracking-wider mb-1">Chiều cao</span>
                                <span className="text-2xl font-black text-primary-700">{hoSo.chieu_cao || 0} <span className="text-base font-normal text-gray-400">cm</span></span>
                            </div>
                            <div className="bg-gradient-to-br from-primary-50 to-white p-4 rounded-xl text-center border border-primary-100 shadow-sm">
                                <span className="block text-primary-400 text-xs uppercase font-bold tracking-wider mb-1">Cân nặng</span>
                                <span className="text-2xl font-black text-primary-700">{hoSo.can_nang || 0} <span className="text-base font-normal text-gray-400">kg</span></span>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 rounded-xl p-6 space-y-4 border border-gray-100">
                            <div className="grid grid-cols-2 gap-6 mb-4 pb-4 border-b border-gray-100 border-dashed">
                                <InfoRow label="Size Áo" value={hoSo.size_ao} />
                                <InfoRow label="Size Giày" value={hoSo.size_giay} />
                            </div>

                            <InfoRow label="Nhóm máu" value={hoSo.nhom_mau} highlight />
                            <InfoRow label="Thị lực (T/P)" value={`${hoSo.thi_luc_trai || '?'} / ${hoSo.thi_luc_phai || '?'}`} />
                            <InfoRow label="Tay thuận" value={hoSo.tay_thuan} />

                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2">
                                <StatusBadge label="Mù màu" value={hoSo.mu_mau} />
                                <StatusBadge label="Xăm hình" value={hoSo.xam_hinh} />
                                <StatusBadge label="Hút thuốc" value={hoSo.hut_thuoc} />
                                <StatusBadge label="Uống rượu" value={hoSo.uong_ruou} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Width Sections */}
                <div className="px-8 pb-10 space-y-10 border-t border-gray-100 pt-10">

                    {/* Nguyện vọng & Kỹ năng */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b-2 border-primary-100 pb-2">
                                <span className="material-icons-outlined text-primary-600 bg-primary-50 p-1 rounded">work_outline</span>
                                Nguyện Vọng
                            </h3>
                            <div className="bg-primary-50/30 p-6 rounded-xl border border-primary-100 space-y-4">
                                <InfoRow label="Ngành nghề" value={hoSo.nganh_nghe_mong_muon} highlight />
                                <InfoRow label="Thời gian đi" value={hoSo.thoi_gian_du_kien} />
                                <InfoRow label="Mục đích" value={hoSo.muc_dich_di_nhat} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b-2 border-primary-100 pb-2">
                                <span className="material-icons-outlined text-primary-600 bg-primary-50 p-1 rounded">psychology</span>
                                Kỹ Năng & Điểm Mạnh
                            </h3>
                            <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                                <InfoRow label="Tiếng Nhật" value={hoSo.trinh_do_tieng_nhat} highlight />
                                <InfoRow label="Bằng lái" value={hoSo.bang_lai_xe} />
                                <div className="space-y-2 pt-2">
                                    <div>
                                        <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Điểm mạnh</span>
                                        <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded border border-gray-100 text-sm">{hoSo.diem_manh || '---'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Điểm yếu</span>
                                        <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded border border-gray-100 text-sm">{hoSo.diem_yeu || '---'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gia đình & Bảo lãnh */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b-2 border-primary-100 pb-2">
                            <span className="material-icons-outlined text-primary-600 bg-primary-50 p-1 rounded">family_restroom</span>
                            Gia Đình & Bảo Lãnh
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 flex items-center justify-between">
                                <span className="text-gray-500 text-sm font-medium">Người bảo lãnh</span>
                                <span className="font-bold text-gray-900">{hoSo.nguoi_bao_lanh || '---'}</span>
                            </div>
                            <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 flex items-center justify-between">
                                <span className="text-gray-500 text-sm font-medium">SĐT Liên hệ</span>
                                <span className="font-bold text-gray-900">{hoSo.sdt_nguoi_bao_lanh || '---'}</span>
                            </div>
                        </div>

                        {Array.isArray(hoSo.thong_tin_gia_dinh) && hoSo.thong_tin_gia_dinh.length > 0 ? (
                            <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-primary-50 text-primary-800 font-bold">
                                        <tr><th className="p-4">Họ tên</th><th className="p-4">Quan hệ</th><th className="p-4">Năm sinh</th><th className="p-4">Công việc</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {hoSo.thong_tin_gia_dinh.map((tv, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-medium">{tv?.ho_ten}</td>
                                                <td className="p-4 text-gray-500"><span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">{tv?.quan_he}</span></td>
                                                <td className="p-4 text-gray-500">{tv?.nam_sinh}</td>
                                                <td className="p-4 text-gray-500">{tv?.nghe_nghiep || tv?.cong_viec}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100 text-gray-400 italic">Chưa cập nhật thông tin gia đình</div>}
                    </div>

                    {/* Quá trình học tập & Làm việc dạng Bảng */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Học vấn */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b-2 border-primary-100 pb-2">
                                <span className="material-icons-outlined text-primary-600 bg-primary-50 p-1 rounded">school</span>
                                Học Vấn
                            </h3>
                            {Array.isArray(hoSo.qua_trinh_hoc_tap) && hoSo.qua_trinh_hoc_tap.length > 0 ? (
                                <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-primary-50 text-primary-800 font-bold uppercase text-xs">
                                            <tr>
                                                <th className="p-3 w-32">Thời gian</th>
                                                <th className="p-3">Trường / Ngành</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {hoSo.qua_trinh_hoc_tap.map((item, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-primary-600 whitespace-nowrap align-top text-xs">
                                                        {formatTimeRange(item?.thoi_gian)}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-gray-800">{item?.ten_truong}</div>
                                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                            <span className="material-icons-outlined text-[10px]">verified</span>
                                                            {item?.bang_cap || item?.chuyen_nganh || '---'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100 text-gray-400 italic">Chưa cập nhật học vấn</div>}
                        </div>

                        {/* Kinh nghiệm */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b-2 border-primary-100 pb-2">
                                <span className="material-icons-outlined text-primary-600 bg-primary-50 p-1 rounded">engineering</span>
                                Kinh Nghiệm
                            </h3>
                            {Array.isArray(hoSo.kinh_nghiem_lam_viec) && hoSo.kinh_nghiem_lam_viec.length > 0 ? (
                                <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-primary-50 text-primary-800 font-bold uppercase text-xs">
                                            <tr>
                                                <th className="p-3 w-32">Thời gian</th>
                                                <th className="p-3">Công ty / CV</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {hoSo.kinh_nghiem_lam_viec.map((item, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-primary-600 whitespace-nowrap align-top text-xs">
                                                        {formatTimeRange(item?.thoi_gian)}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-gray-800">{item?.cong_ty}</div>
                                                        <div className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded inline-block">
                                                            {item?.cong_viec}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100 text-gray-400 italic">Chưa cập nhật kinh nghiệm</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ label, value }) {
    if (!value && value !== false) return null;

    let colorClass = 'bg-gray-100 text-gray-600';
    if (value === 'Không' || value === false) colorClass = 'bg-green-50 text-green-700 border border-green-100';
    else if (value) colorClass = 'bg-orange-50 text-orange-700 border border-orange-100';

    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">{label}</span>
            <span className={`px-2 py-0.5 rounded font-medium text-xs ${colorClass}`}>{value === true ? 'Có' : (value === false ? 'Không' : value)}</span>
        </div>
    )
}

function formatTimeRange(rangeString) {
    if (!rangeString) return '---';

    // Nếu chuỗi đã ở dạng "MM/YYYY - MM/YYYY" hoặc chỉ là "MM/YYYY", trả về luôn (vì form Đăng Ký lưu text này)
    if (rangeString.includes('/') && !rangeString.includes('-') && rangeString.length < 10) return rangeString; // Single month/year

    // Xử lý chuỗi range
    const parts = rangeString.includes(' - ') ? rangeString.split(' - ') : [rangeString, ''];
    const start = parts[0];
    const end = parts[1];

    const formatDate = (str) => {
        if (!str || str === '/') return '?';
        // Nếu đã là MM/YYYY
        if (str.includes('/') && str.length <= 7) return str;
        // Nếu là YYYY-MM-DD
        try {
            const d = new Date(str);
            if (isNaN(d.getTime())) return str;
            return `${d.getMonth() + 1}/${d.getFullYear()}`;
        } catch { return str; }
    };

    if (!end || end === '/') return formatDate(start);
    return `${formatDate(start)} - ${formatDate(end)}`;
}

function InfoRow({ label, value, highlight = false }) {
    if (!value && value !== 0) return null
    return (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0 border-dashed items-center">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className={`text-sm font-medium text-right ${highlight ? 'text-primary-700' : 'text-gray-900'}`}>{value}</span>
        </div>
    )
}
