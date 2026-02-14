import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ChiTietHoSo() {
    const { id } = useParams()
    const [hoSo, setHoSo] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchChiTiet = async () => {
            try {
                const { data, error } = await supabase
                    .from('ho_so')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) throw error
                setHoSo(data)
            } catch (error) {
                console.error('Lỗi tải chi tiết:', error)
                alert('Lỗi tải dữ liệu hồ sơ!')
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
    if (!hoSo) return <div className="text-center p-10 text-red-500 font-bold">Không tìm thấy hồ sơ!</div>

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header & Navigation */}
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <Link to="/admin" className="text-primary-600 hover:text-primary-800 flex items-center gap-2 font-medium transition-colors">
                    ← Quay lại Dashboard
                </Link>

                <div className="flex gap-3">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium flex items-center gap-2 transition-colors"
                    >
                        <span className="material-icons-outlined text-sm">delete</span> Xóa hồ sơ
                    </button>
                    <Link
                        to={`/sua-ho-so/${id}`}
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-medium flex items-center gap-2 transition-colors"
                    >
                        <span className="material-icons-outlined text-sm">edit</span> Sửa hồ sơ
                    </Link>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <span className="material-icons-outlined text-sm">print</span> In hồ sơ
                    </button>
                </div>
            </div>

            {/* Main Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                {/* Cover & Avatar Header */}
                <div className="h-32 bg-gradient-to-r from-primary-400 to-accent-500"></div>
                <div className="px-6 relative flex flex-col sm:flex-row items-end -mt-12 mb-6">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg flex-shrink-0">
                        {hoSo.anh_ho_so ? (
                            <img src={hoSo.anh_ho_so} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold bg-gray-100">
                                {hoSo.ho_ten ? hoSo.ho_ten.charAt(0) : '?'}
                            </div>
                        )}
                    </div>
                    <div className="mt-4 sm:ml-6 sm:mb-2 flex-grow text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{hoSo.ho_ten}</h1>
                        <p className="text-gray-500">
                            {hoSo.gioi_tinh} • {hoSo.ngay_sinh ? new Date(hoSo.ngay_sinh).getFullYear() : 'N/A'} • {hoSo.que_quan || 'Chưa cập nhật'}
                        </p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="px-6 pb-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Section 1: Thông tin cá nhân */}
                    <div>
                        <h3 className="text-lg font-bold text-primary-700 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <span className="material-icons-outlined">person</span>
                            Thông Tin Cá Nhân
                        </h3>
                        <div className="space-y-3">
                            <InfoRow label="Ngày sinh" value={hoSo.ngay_sinh ? new Date(hoSo.ngay_sinh).toLocaleDateString('vi-VN') : ''} />
                            <InfoRow label="Giới tính" value={hoSo.gioi_tinh} />
                            <InfoRow label="Hôn nhân" value={hoSo.hon_nhan} />
                            <InfoRow label="Tôn giáo" value={hoSo.ton_giao} />
                            <InfoRow label="SĐT" value={hoSo.so_dien_thoai} />
                            <InfoRow label="Email" value={hoSo.email} />
                            <InfoRow label="Quê quán" value={hoSo.que_quan} />
                            <InfoRow label="Thường trú" value={hoSo.dia_chi_thuong_tru} />
                            <InfoRow label="Số CCCD" value={hoSo.so_cccd} />
                            <InfoRow label="Ngày cấp" value={hoSo.ngay_cap_cccd ? new Date(hoSo.ngay_cap_cccd).toLocaleDateString('vi-VN') : ''} />
                            <InfoRow label="Nơi cấp" value={hoSo.noi_cap_cccd} />
                            <InfoRow label="Hộ chiếu" value={hoSo.so_ho_chieu} />
                        </div>
                    </div>

                    {/* Section 2: Sức khỏe & Ngoại hình */}
                    <div>
                        <h3 className="text-lg font-bold text-primary-700 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <span className="material-icons-outlined">health_and_safety</span>
                            Sức Khỏe & Ngoại Hình
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-primary-50 p-3 rounded-lg text-center">
                                <span className="block text-gray-500 text-xs uppercase">Chiều cao</span>
                                <span className="text-xl font-bold text-primary-800">{hoSo.chieu_cao || 0} cm</span>
                            </div>
                            <div className="bg-primary-50 p-3 rounded-lg text-center">
                                <span className="block text-gray-500 text-xs uppercase">Cân nặng</span>
                                <span className="text-xl font-bold text-primary-800">{hoSo.can_nang || 0} kg</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <span className="block text-gray-500 text-xs uppercase">Size Áo</span>
                                <span className="text-lg font-bold text-gray-700">{hoSo.size_ao || '-'}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <span className="block text-gray-500 text-xs uppercase">Size Giày</span>
                                <span className="text-lg font-bold text-gray-700">{hoSo.size_giay || '-'}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <InfoRow label="Nhóm máu" value={hoSo.nhom_mau} highlight />
                            <InfoRow label="Thị lực (T/P)" value={`${hoSo.thi_luc_trai || '?'} / ${hoSo.thi_luc_phai || '?'}`} />
                            <InfoRow label="Tay thuận" value={hoSo.tay_thuan} />
                            <div className="flex gap-2 mt-2 flex-wrap pt-2">
                                {hoSo.mu_mau && <Badge type="warning">Mù màu</Badge>}
                                {hoSo.xam_hinh && <Badge type="warning">Xăm hình</Badge>}
                                {hoSo.hut_thuoc && <Badge type="neutral">Hút thuốc</Badge>}
                                {hoSo.uong_ruou && <Badge type="neutral">Uống rượu</Badge>}
                                {!hoSo.mu_mau && !hoSo.xam_hinh && !hoSo.hut_thuoc && !hoSo.uong_ruou &&
                                    <span className="text-sm text-green-600 italic">Không có thói quen xấu</span>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Full Width Details */}
                <div className="px-6 pb-8 space-y-8 border-t border-gray-100 pt-8">

                    {/* Gia đình & Bảo lãnh */}
                    <div>
                        <h3 className="text-lg font-bold text-primary-700 mb-4 flex items-center gap-2">
                            <span className="material-icons-outlined">family_restroom</span>
                            Gia Đình & Bảo Lãnh
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl mb-4">
                            <InfoRow label="Người bảo lãnh" value={hoSo.nguoi_bao_lanh} highlight />
                            <InfoRow label="SĐT Bảo lãnh" value={hoSo.sdt_nguoi_bao_lanh} highlight />
                        </div>
                        {Array.isArray(hoSo.thong_tin_gia_dinh) && hoSo.thong_tin_gia_dinh.length > 0 ? (
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 font-bold text-gray-700">
                                        <tr><th className="p-3">Họ tên</th><th className="p-3">Quan hệ</th><th className="p-3">Năm sinh</th><th className="p-3">Công việc</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {hoSo.thong_tin_gia_dinh.map((tv, idx) => (
                                            <tr key={idx}>
                                                <td className="p-3">{tv?.ho_ten}</td>
                                                <td className="p-3">{tv?.quan_he}</td>
                                                <td className="p-3">{tv?.nam_sinh}</td>
                                                <td className="p-3">{tv?.cong_viec}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="text-gray-400 italic text-sm pl-2">Chưa cập nhật thành viên gia đình.</p>}
                    </div>

                    {/* Nguyện vọng & Kỹ năng */}
                    <div>
                        <h3 className="text-lg font-bold text-primary-700 mb-4 flex items-center gap-2">
                            <span className="material-icons-outlined">work_history</span>
                            Nguyện Vọng & Kỹ Năng
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <div className="space-y-3">
                                <InfoRow label="Ngành nghề" value={hoSo.nganh_nghe_mong_muon} highlight />
                                <InfoRow label="Thời gian đi" value={hoSo.thoi_gian_du_kien} />
                                <InfoRow label="Mục đích" value={hoSo.muc_dich_di_nhat} />
                            </div>
                            <div className="space-y-3">
                                <InfoRow label="Tiếng Nhật" value={hoSo.trinh_do_tieng_nhat} highlight />
                                <InfoRow label="Bằng lái" value={hoSo.bang_lai_xe} />
                                <div className="text-sm"><span className="text-gray-500 block mb-1">Điểm mạnh:</span> <span className="font-medium bg-white px-2 py-1 rounded block border border-blue-100">{hoSo.diem_manh || '-'}</span></div>
                                <div className="text-sm"><span className="text-gray-500 block mb-1">Điểm yếu:</span> <span className="font-medium bg-white px-2 py-1 rounded block border border-blue-100">{hoSo.diem_yeu || '-'}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Quá trình học tập & Làm việc */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span className="material-icons-outlined text-primary-500">school</span> Học vấn</h4>
                            {Array.isArray(hoSo.qua_trinh_hoc_tap) && hoSo.qua_trinh_hoc_tap.length > 0 ? (
                                <ul className="space-y-3 text-sm">{hoSo.qua_trinh_hoc_tap.map((item, i) => (
                                    <li key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="font-bold text-primary-700">{item?.tu_nam} - {item?.den_nam}</div>
                                        <div className="font-medium text-gray-900 mt-1">{item?.ten_truong}</div>
                                        <div className="text-gray-500 text-xs mt-1">{item?.chuyen_nganh}</div>
                                    </li>
                                ))}</ul>
                            ) : <p className="text-gray-400 italic text-sm">Chưa cập nhật.</p>}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span className="material-icons-outlined text-primary-500">engineering</span> Kinh nghiệm</h4>
                            {Array.isArray(hoSo.kinh_nghiem_lam_viec) && hoSo.kinh_nghiem_lam_viec.length > 0 ? (
                                <ul className="space-y-3 text-sm">{hoSo.kinh_nghiem_lam_viec.map((item, i) => (
                                    <li key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="font-bold text-primary-700">{item?.tu_nam} - {item?.den_nam}</div>
                                        <div className="font-medium text-gray-900 mt-1">{item?.ten_cong_ty}</div>
                                        <div className="text-gray-500 text-xs mt-1">{item?.cong_viec}</div>
                                    </li>
                                ))}</ul>
                            ) : <p className="text-gray-400 italic text-sm">Chưa cập nhật.</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

// Helper Components
function InfoRow({ label, value, highlight = false }) {
    if (!value && value !== 0) return null
    return (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0 border-dashed items-center">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className={`text-sm font-medium text-right ${highlight ? 'text-primary-700' : 'text-gray-900'}`}>{value}</span>
        </div>
    )
}

function Badge({ children, type }) {
    const colors = {
        warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        neutral: 'bg-gray-100 text-gray-800 border border-gray-200',
    }
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[type] || colors.neutral}`}>
            {children}
        </span>
    )
}
