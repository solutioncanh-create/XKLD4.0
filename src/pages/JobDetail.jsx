import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function JobDetail() {
    const { id } = useParams()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchJobDetail = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('don_hang')
                .select('*')
                .eq('id', id)
                .single()

            if (error) console.error('Error:', error)
            setJob(data)
            setLoading(false)
        }
        fetchJobDetail()
    }, [id])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    )

    if (!job) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-secondary-50 p-6 text-center">
            <h2 className="text-2xl font-bold text-secondary-800 mb-2">Không tìm thấy đơn hàng</h2>
            <Link to="/viec-lam" className="text-primary-600 hover:text-primary-800 font-medium">Quay lại danh sách</Link>
        </div>
    )

    return (
        <div className="min-h-screen bg-secondary-50 font-sans text-secondary-800 pb-20">
            {/* HERDER BANNER */}
            <div className="bg-primary-900 text-white relative py-12">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[50%] -right-[10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl"></div>
                </div>
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <Link to="/viec-lam" className="inline-flex items-center text-primary-200 hover:text-white text-sm font-medium transition-colors">
                            <span className="material-icons-outlined text-base mr-1">arrow_back</span>
                            Quay lại danh sách
                        </Link>

                        {/* Status Badge (Read Only) */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 backdrop-blur-md ${job.trang_thai === 'Đang tuyển' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            <span className={`w-2 h-2 rounded-full ${job.trang_thai === 'Đang tuyển' ? 'bg-green-500' : job.trang_thai === 'Đã đóng' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                            <span className="text-sm font-bold text-white">{job.trang_thai}</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-500 text-white mb-3 shadow-lg shadow-accent-500/30">
                                {job.nganh_nghe}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{job.ten_don_hang}</h1>
                            <div className="flex flex-wrap gap-6 text-sm text-primary-100">
                                <div className="flex items-center gap-2">
                                    <span className="material-icons-outlined text-lg">place</span>
                                    {job.dia_diem_lam_viec}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-icons-outlined text-lg">schedule</span>
                                    Hạn nộp: {job.thoi_han_nop_ho_so ? new Date(job.thoi_han_nop_ho_so).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center min-w-[200px]">
                            <p className="text-xs font-bold text-primary-200 uppercase tracking-wider mb-1">Mức Lương Cơ Bản</p>
                            <p className="text-3xl font-black text-accent-400">
                                {job.muc_luong ? job.muc_luong + (String(job.muc_luong).match(/\D/) ? '' : ' ¥') : (job.luong_co_ban ? new Intl.NumberFormat('vi-VN').format(job.luong_co_ban) + ' ¥' : 'Thỏa thuận')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: DETAILS */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Highlights */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-secondary-100">
                            <h3 className="section-title text-xl font-bold text-primary-900 mb-6 flex items-center gap-2 border-b border-secondary-100 pb-3">
                                <span className="material-icons-outlined text-primary-600">info</span>
                                Thông Tin Chi Tiết
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <DetailItem icon="group" label="Số lượng tuyển" value={`${job.so_luong_tuyen} Nam/Nữ`} />
                                <DetailItem icon="cake" label="Độ tuổi" value={`${job.tuoi_tu || 18} - ${job.tuoi_den || 35} tuổi`} />
                                <DetailItem icon="school" label="Trình độ" value="Tốt nghiệp THPT trở lên" />
                                <DetailItem icon="height" label="Chiều cao" value="Nam > 160cm, Nữ > 150cm" />
                                <DetailItem icon="visibility" label="Thị lực" value="Tốt (8/10 trở lên)" />
                                <DetailItem icon="translate" label="Tiếng Nhật" value="N5 trở lên (được đào tạo)" />
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-secondary-900 mb-2">Mô tả công việc</h4>
                                    <p className="text-secondary-600 leading-relaxed text-justify whitespace-pre-line">
                                        {job.mo_ta_cong_viec || 'Đang cập nhật chi tiết công việc...'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-secondary-900 mb-2">Quyền lợi & Chế độ</h4>
                                    <ul className="list-disc list-inside text-secondary-600 space-y-1 ml-2">
                                        <li>Lương cơ bản hấp dẫn, chưa tính làm thêm.</li>
                                        <li>Được đóng bảo hiểm theo luật lao động Nhật Bản.</li>
                                        <li>Hỗ trợ nhà ở, đi lại (tùy xí nghiệp).</li>
                                        <li>Cơ hội gia hạn Visa kỹ năng đặc định (Tokutei) lên đến 5 năm.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: ACTION */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-primary-900/5 border border-primary-100 sticky top-24">
                            <h3 className="text-lg font-bold text-primary-900 mb-4 text-center">Đăng Ký Ứng Tuyển</h3>
                            <p className="text-sm text-secondary-500 text-center mb-6">Điền thông tin để được tư vấn miễn phí về đơn hàng này.</p>

                            {job.trang_thai === 'Đang tuyển' ? (
                                <Link to={`/dang-ky?don_hang=${job.id}`} className="block w-full bg-primary-600 text-white font-bold py-4 rounded-xl text-center hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all mb-4 transform hover:-translate-y-1">
                                    NỘP HỒ SƠ NGAY
                                </Link>
                            ) : (
                                <button disabled className="block w-full bg-secondary-200 text-secondary-500 font-bold py-4 rounded-xl text-center cursor-not-allowed mb-4">
                                    ĐƠN HÀNG ĐÃ ĐÓNG
                                </button>
                            )}

                            <button className="block w-full bg-white text-primary-700 font-bold py-4 rounded-xl text-center border border-primary-200 hover:bg-primary-50 transition-all">
                                <span className="material-icons-outlined align-middle mr-2">phone_in_talk</span>
                                Gọi Tư Vấn: 1900 1234
                            </button>

                            <div className="mt-6 pt-6 border-t border-secondary-100">
                                <p className="text-xs text-secondary-400 text-center mb-2">Chia sẻ đơn hàng này</p>
                                <div className="flex justify-center gap-4">
                                    <SocialButton icon="facebook" />
                                    <SocialButton icon="email" />
                                    <SocialButton icon="link" />
                                </div>
                            </div>
                        </div>

                        {/* Similar Jobs (Placeholder) */}
                        <div className="bg-primary-900 rounded-2xl p-6 text-white text-center">
                            <span className="material-icons-outlined text-4xl mb-2 text-accent-400">star</span>
                            <h4 className="font-bold text-lg mb-2">Cam Kết Của Chúng Tôi</h4>
                            <ul className="text-sm text-primary-100 space-y-2 text-left mt-4 ml-2 list-disc list-inside">
                                <li>Phí xuất cảnh minh bạch.</li>
                                <li>Không phát sinh chi phí ẩn.</li>
                                <li>Hỗ trợ vay vốn ngân hàng.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DetailItem({ icon, label, value }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary-50 border border-secondary-100">
            <div className="w-10 h-10 rounded-full bg-white text-primary-600 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-icons-outlined text-xl">{icon}</span>
            </div>
            <div>
                <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="font-bold text-secondary-900">{value}</p>
            </div>
        </div>
    )
}

function SocialButton({ icon }) {
    return (
        <button className="w-10 h-10 rounded-full bg-secondary-100 text-secondary-500 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
            <span className="material-icons-outlined text-lg">{icon}</span>
        </button>
    )
}
