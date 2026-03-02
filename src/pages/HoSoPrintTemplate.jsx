import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function HoSoPrintTemplate() {
    const { id } = useParams()
    const [hoSo, setHoSo] = useState(null)
    const [loading, setLoading] = useState(true)


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
                console.error('Lỗi tải hồ sơ in:', error)
                alert('Không thể tải dữ liệu để in!')
            } finally {
                setLoading(false)
            }
        }
        fetchChiTiet()
    }, [id])

    useEffect(() => {
        if (!loading && hoSo) {
            document.title = `HoSo_${hoSo.ho_ten || id}`
        }
    }, [loading, hoSo, id])

    if (loading) return <div className="text-center p-10">Đang chuẩn bị bản in...</div>
    if (!hoSo) return <div className="text-center p-10 text-red-500">Không tìm thấy dữ liệu!</div>

    return (

        <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white print:min-h-0 font-sans text-blue-900 leading-snug">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&display=swap');
                @media print {
                    @page {
                        size: A4;
                        margin: 0mm; /* Viền trắng do padding của div container */
                    }
                    body {
                        font-family: 'Roboto', sans-serif !important;
                        font-size: 10pt;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        color: #1e3a8a; /* blue-900 */
                    }
                    .print-container {
                        width: 210mm;
                        height: 297mm; /* Force A4 Height */
                        padding: 10mm !important;
                        margin: 0 auto;
                        overflow: hidden !important; /* Prevent page 2 */
                        zoom: 0.95; /* Slight scale down to fit */
                    }
                    /* Ensure body doesn't generate extra pages */
                    html, body { height: 100%; overflow: hidden; }
                        border: 1px solid #e5e7eb;
                    }
                    @media screen {
                        body {
                            min-width: 220mm; /* Force desktop width on mobile */
                            overflow-x: auto;
                        }
                        .print-container {
                            border: 1px solid #e5e7eb;
                            width: 210mm !important;
                            min-width: 210mm !important;
                        }
                    }
                    /* Override tailwind text sizes for fixed print sizes */
                    .text-xs { font-size: 9pt !important; }
                    .text-sm { font-size: 10pt !important; }
                    .text-base { font-size: 11pt !important; }
                    .text-lg { font-size: 12pt !important; }
                    .text-xl { font-size: 14pt !important; }
                    .text-2xl { font-size: 18pt !important; }
                }
            `}</style>

            {/* Toolbar - Ẩn khi in */}
            <div className="fixed top-4 right-4 print:hidden flex gap-2">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-sans font-bold flex items-center gap-2 text-sm"
                >
                    <span className="material-icons-outlined text-base">print</span> In Ngay
                </button>
            </div>

            {/* A4 Page Container */}
            <div className="print-container max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:w-full print:max-w-none p-[15mm] print:p-[15mm] min-h-[297mm]">

                {/* --- HEADER --- */}
                <div className="flex justify-between items-start mb-2 border-b-2 border-blue-900 pb-2">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold uppercase mb-1">Phiếu Thông Tin Ứng Viên</h1>
                        <p className="text-xs font-semibold italic text-gray-600">JAPAN LABOR SUPPLY APPLICATION FORM</p>
                        <div className="mt-3 flex flex-col gap-2 text-xs">
                            <p className="text-gray-500"><strong>Ngày lập:</strong> {new Date().toLocaleDateString('vi-VN')}</p>

                        </div>
                    </div>
                    <div className="w-[2.4cm] h-[3.2cm] border border-blue-300 overflow-hidden flex items-center justify-center bg-blue-50 ml-4 relative">
                        {hoSo.anh_ho_so ? (
                            <img src={hoSo.anh_ho_so} className="w-full h-full object-cover absolute inset-0" alt="Avatar" />
                        ) : (
                            <span className="text-xs text-center text-gray-400 z-10">Ảnh 3x4</span>
                        )}
                    </div>
                </div>

                {/* --- I. THÔNG TIN CÁ NHÂN --- */}
                <div className="mb-4">
                    <SectionTitle>I. Thông tin cá nhân</SectionTitle>
                    <table className="w-full border-collapse border border-blue-300 text-xs">
                        <tbody>
                            <tr>
                                <td className="border border-blue-300 p-1 font-bold w-32 bg-blue-50">Họ và tên</td>
                                <td className="border border-blue-300 p-1 uppercase font-bold text-base" colSpan="3">{hoSo.ho_ten}</td>
                            </tr>
                            <tr>
                                <td className="border border-blue-300 p-1 font-bold bg-blue-50">Ngày sinh</td>
                                <td className="border border-blue-300 p-1">{hoSo.ngay_sinh ? new Date(hoSo.ngay_sinh).toLocaleDateString('vi-VN') : ''}</td>
                                <td className="border border-blue-300 p-1 font-bold bg-blue-50 w-20">Giới tính</td>
                                <td className="border border-blue-300 p-1">{hoSo.gioi_tinh}</td>
                            </tr>
                            <tr>
                                <td className="border border-blue-300 p-1 font-bold bg-blue-50">Quê quán</td>
                                <td className="border border-blue-300 p-1" colSpan="3">{hoSo.que_quan}</td>
                            </tr>

                            <tr>
                                <td className="border border-blue-300 p-1 font-bold bg-blue-50">Tôn giáo</td>
                                <td className="border border-blue-300 p-1">{hoSo.ton_giao}</td>
                                <td className="border border-blue-300 p-1 font-bold bg-blue-50">Hôn nhân</td>
                                <td className="border border-blue-300 p-1">{hoSo.hon_nhan}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* --- II. SỨC KHỎE --- */}
                <div className="mb-4">
                    <SectionTitle>II. Sức khỏe & Thể chất</SectionTitle>
                    <table className="w-full border-collapse border border-blue-300 text-xs text-center">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="border border-blue-300 p-1">Chiều cao</th>
                                <th className="border border-blue-300 p-1">Cân nặng</th>
                                <th className="border border-blue-300 p-1">Nhóm máu</th>
                                <th className="border border-blue-300 p-1">Thị lực (T/P)</th>
                                <th className="border border-blue-300 p-1">Tay thuận</th>
                                <th className="border border-blue-300 p-1">Mù màu</th>
                                <th className="border border-blue-300 p-1">Hút thuốc</th>
                                <th className="border border-blue-300 p-1">Uống rượu</th>
                                <th className="border border-blue-300 p-1">Xăm hình</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-blue-300 p-1 font-bold">{hoSo.chieu_cao} cm</td>
                                <td className="border border-blue-300 p-1 font-bold">{hoSo.can_nang} kg</td>
                                <td className="border border-blue-300 p-1">{hoSo.nhom_mau}</td>
                                <td className="border border-blue-300 p-1">{hoSo.thi_luc_trai}/{hoSo.thi_luc_phai}</td>
                                <td className="border border-blue-300 p-1">{hoSo.tay_thuan}</td>
                                <td className="border border-blue-300 p-1">{formatYesNo(hoSo.mu_mau)}</td>
                                <td className="border border-blue-300 p-1">{formatYesNo(hoSo.hut_thuoc)}</td>
                                <td className="border border-blue-300 p-1">{formatYesNo(hoSo.uong_ruou)}</td>
                                <td className="border border-blue-300 p-1">{formatYesNo(hoSo.xam_hinh)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* --- III. KỸ NĂNG & NGUYỆN VỌNG (Previously IV) --- */}
                <div className="mb-4">
                    <SectionTitle>III. Kỹ năng & Nguyện vọng</SectionTitle>
                    <div className="border border-blue-300 p-2 text-xs flex flex-col gap-1.5">
                        <div className="grid grid-cols-2 gap-4">
                            <p><strong>Ngành nghề mong muốn:</strong> {hoSo.nganh_nghe_mong_muon}</p>
                            <p><strong>Trình độ Tiếng Nhật:</strong> {hoSo.trinh_do_tieng_nhat}</p>
                        </div>
                        <div className="border-t border-dashed border-gray-300 my-1"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <p><strong>Điểm mạnh:</strong> {hoSo.diem_manh || '...'}</p>
                            <p><strong>Điểm yếu:</strong> {hoSo.diem_yeu || '...'}</p>
                        </div>
                        <div className="border-t border-dashed border-gray-300 my-1"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <p><strong>Bằng lái xe:</strong> {hoSo.bang_lai_xe || 'Không'}</p>
                            <p><strong>Mục đích đi Nhật:</strong> {hoSo.muc_dich_di_nhat || '...'}</p>
                        </div>
                    </div>
                </div>

                {/* --- IV. GIA ĐÌNH (Previously III) --- */}
                <div className="mb-4">
                    <SectionTitle>IV. Thành viên gia đình</SectionTitle>
                    <table className="w-full border-collapse border border-blue-300 text-xs mb-2">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="border border-blue-300 p-1 w-32">Quan hệ</th>
                                <th className="border border-blue-300 p-1">Họ và tên</th>
                                <th className="border border-blue-300 p-1 w-24">Năm sinh</th>
                                <th className="border border-blue-300 p-1 w-40">Công việc</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(hoSo.thong_tin_gia_dinh) && hoSo.thong_tin_gia_dinh.length > 0 ? (
                                hoSo.thong_tin_gia_dinh.map((gd, i) => (
                                    <tr key={i}>
                                        <td className="border border-blue-300 p-1 text-center font-bold">{gd?.quan_he}</td>
                                        <td className="border border-blue-300 p-1 uppercase">{gd?.ho_ten}</td>
                                        <td className="border border-blue-300 p-1 text-center">{gd?.nam_sinh}</td>
                                        <td className="border border-blue-300 p-1">{gd?.nghe_nghiep || gd?.cong_viec}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="border border-blue-300 p-1 text-center text-gray-400 italic">Trống</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- V. HỌC VẤN --- */}
                <div className="mb-4">
                    <SectionTitle>V. Kinh nghiệm học tập</SectionTitle>
                    <table className="w-full border-collapse border border-blue-300 text-xs">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="border border-blue-300 p-1 w-32">Thời gian</th>
                                <th className="border border-blue-300 p-1">Trường học / Đơn vị đào tạo</th>
                                <th className="border border-blue-300 p-1 w-40">Bằng cấp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(hoSo.qua_trinh_hoc_tap) && hoSo.qua_trinh_hoc_tap.length > 0 ? (
                                hoSo.qua_trinh_hoc_tap.map((h, i) => (
                                    <tr key={i}>
                                        <td className="border border-blue-300 p-1 text-center font-bold">{formatTimeRange(h?.thoi_gian)}</td>
                                        <td className="border border-blue-300 p-1 uppercase">{h?.ten_truong}</td>
                                        <td className="border border-blue-300 p-1 text-center">{h?.bang_cap}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3" className="border border-blue-300 p-1 text-center text-gray-400 italic">Trống</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- VI. KINH NGHIỆM LÀM VIỆC --- */}
                <div className="mb-4">
                    <SectionTitle>VI. Kinh nghiệm làm việc</SectionTitle>
                    <table className="w-full border-collapse border border-blue-300 text-xs">
                        <thead>
                            <tr className="bg-blue-50">
                                <th className="border border-blue-300 p-1 w-32">Thời gian</th>
                                <th className="border border-blue-300 p-1">Tên công ty / Nơi làm việc</th>
                                <th className="border border-blue-300 p-1 w-40">Công việc</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(hoSo.kinh_nghiem_lam_viec) && hoSo.kinh_nghiem_lam_viec.length > 0 ? (
                                hoSo.kinh_nghiem_lam_viec.map((k, i) => (
                                    <tr key={i}>
                                        <td className="border border-blue-300 p-1 text-center font-bold">{formatTimeRange(k?.thoi_gian)}</td>
                                        <td className="border border-blue-300 p-1 uppercase">{k?.cong_ty}</td>
                                        <td className="border border-blue-300 p-1 text-center">{k?.cong_viec}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3" className="border border-blue-300 p-1 text-center text-gray-400 italic">Trống</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- FOOTER SIGNATURE --- */}
                <div className="mt-2 flex justify-end pr-8">
                    <div className="text-center">
                        <p className="italic text-xs mb-0">............., ngày ..... tháng ..... năm 20.....</p>
                        <p className="font-bold uppercase text-xs">Người làm đơn</p>
                        <p className="text-[10px] italic mb-6">(Ký và ghi rõ họ tên)</p>
                        <p className="font-bold uppercase text-xs">{hoSo.ho_ten}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- HELPER COMPONENTS ---
function SectionTitle({ children }) {
    return <h2 className="uppercase font-bold text-xs bg-blue-100 px-2 py-1 mb-2 border border-blue-900 border-l-4 border-l-blue-900 text-blue-900">{children}</h2>
}

function formatTimeRange(rangeString) {
    if (!rangeString) return '---';
    if (!rangeString.includes(' - ')) return rangeString;
    const [start, end] = rangeString.split(' - ');
    const formatDate = (dStr) => {
        if (!dStr) return '?';
        try {
            const d = new Date(dStr);
            if (isNaN(d.getTime())) return dStr;
            return `${d.getMonth() + 1}/${d.getFullYear()}`;
        } catch { return dStr; }
    };
    return `${formatDate(start)} - ${formatDate(end)}`;
}

function formatYesNo(val) {
    if (val === true || val === 'Có') return 'Có';
    if (val === false || val === 'Không') return 'Không';
    return val || 'Không';
}
