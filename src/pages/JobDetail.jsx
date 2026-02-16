import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function JobDetail() {
    const { id } = useParams()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({})

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
            setFormData(data || {})
            setLoading(false)
        }
        fetchJobDetail()
    }, [id])

    const handleSave = async () => {
        if (!confirm('Bạn có chắc muốn lưu thay đổi?')) return
        try {
            // Filter out fields that are not in the 'don_hang' table schema based on previous errors
            // eslint-disable-next-line no-unused-vars
            const { tuoi_tu, tuoi_den, yeu_cau_gioi_tinh, ...safeData } = formData

            const { error } = await supabase
                .from('don_hang')
                .update(safeData)
                .eq('id', id)

            if (error) throw error
            setJob(formData) // Update local state with all data (even if not saved to DB, to keep UI consistent until refresh)
            setIsEditing(false)
            alert('Cập nhật thành công!')
        } catch (error) {
            alert('Lỗi: ' + error.message)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

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

                        {/* Status Badge & Edit Button */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all border backdrop-blur-md ${isEditing
                                    ? 'bg-green-500 hover:bg-green-600 border-green-400 text-white'
                                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                                    }`}
                            >
                                <span className="material-icons-outlined text-base">{isEditing ? 'save' : 'edit'}</span>
                                <span>{isEditing ? 'Lưu' : 'Sửa'}</span>
                            </button>

                            {isEditing && (
                                <button
                                    onClick={() => {
                                        setIsEditing(false)
                                        setFormData(job)
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all border border-white/10 backdrop-blur-md"
                                >
                                    <span className="material-icons-outlined text-base">close</span>
                                    <span>Hủy</span>
                                </button>
                            )}

                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 backdrop-blur-md ${job.trang_thai === 'Đang tuyển' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                <span className={`w-2 h-2 rounded-full ${job.trang_thai === 'Đang tuyển' ? 'bg-green-500' : job.trang_thai === 'Đã đóng' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                {isEditing ? (
                                    <select
                                        name="trang_thai"
                                        value={formData.trang_thai}
                                        onChange={handleChange}
                                        className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer"
                                    >
                                        <option value="Mới đăng" className="text-gray-800">Mới đăng</option>
                                        <option value="Đang tuyển" className="text-gray-800">Đang tuyển</option>
                                        <option value="Sắp hết hạn" className="text-gray-800">Sắp hết hạn</option>
                                        <option value="Đã đóng" className="text-gray-800">Đã đóng</option>
                                    </select>
                                ) : (
                                    <span className="text-sm font-bold text-white">{job.trang_thai}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                        <div className="w-full md:w-2/3">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-500 text-white mb-3 shadow-lg shadow-accent-500/30">
                                {isEditing ? <input name="nganh_nghe" value={formData.nganh_nghe || ''} onChange={handleChange} className="bg-transparent border-b border-white outline-none w-24 text-white placeholder-white/50" placeholder="Ngành nghề" /> : job.nganh_nghe}
                            </span>

                            {isEditing ? (
                                <input
                                    name="ten_don_hang"
                                    value={formData.ten_don_hang || ''}
                                    onChange={handleChange}
                                    className="block w-full text-3xl md:text-4xl font-black mb-4 leading-tight bg-transparent border-b border-white/30 text-white placeholder-white/50 outline-none focus:border-white"
                                    placeholder="Tên đơn hàng"
                                />
                            ) : (
                                <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{job.ten_don_hang}</h1>
                            )}

                            <div className="flex flex-wrap gap-6 text-sm text-primary-100">
                                <div className="flex items-center gap-2">
                                    <span className="material-icons-outlined text-lg">place</span>
                                    {isEditing ? <input name="dia_diem_lam_viec" value={formData.dia_diem_lam_viec || ''} onChange={handleChange} className="bg-transparent border-b border-primary-400 outline-none text-white w-40" /> : job.dia_diem_lam_viec}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-icons-outlined text-lg">schedule</span>
                                    Hạn nộp: {isEditing ? <input type="date" name="thoi_han_nop_ho_so" value={formData.thoi_han_nop_ho_so || ''} onChange={handleChange} className="bg-transparent border-b border-primary-400 outline-none text-white" /> : (job.thoi_han_nop_ho_so ? new Date(job.thoi_han_nop_ho_so).toLocaleDateString('vi-VN') : 'Không giới hạn')}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center min-w-[200px]">
                            <p className="text-xs font-bold text-primary-200 uppercase tracking-wider mb-1">Mức Lương Cơ Bản</p>
                            <p className="text-3xl font-black text-accent-400">
                                {isEditing ? (
                                    <div className="flex items-center justify-center gap-1">
                                        <input
                                            name="muc_luong"
                                            type="number"
                                            value={formData.muc_luong || ''}
                                            onChange={handleChange}
                                            className="bg-transparent border-b border-accent-400 outline-none text-accent-400 w-32 text-center"
                                            placeholder="Tiền yên"
                                        />
                                        <span className="text-lg">¥</span>
                                    </div>
                                ) : (
                                    job.muc_luong ? job.muc_luong + (String(job.muc_luong).match(/\D/) ? '' : ' ¥') : (job.luong_co_ban ? new Intl.NumberFormat('vi-VN').format(job.luong_co_ban) + ' ¥' : 'Thỏa thuận')
                                )}
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

                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <EditItem label="Số lượng tuyển" name="so_luong_tuyen" value={formData.so_luong_tuyen} onChange={handleChange} type="number" />
                                    <EditItem label="Giới tính" name="yeu_cau_gioi_tinh" value={formData.yeu_cau_gioi_tinh} onChange={handleChange} placeholder="Nam/Nữ" />
                                    <EditItem label="Tuổi từ" name="tuoi_tu" value={formData.tuoi_tu} onChange={handleChange} type="number" />
                                    <EditItem label="Tuổi đến" name="tuoi_den" value={formData.tuoi_den} onChange={handleChange} type="number" />
                                    {/* Add other fields as needed if they exist in DB */}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <DetailItem icon="group" label="Số lượng tuyển" value={`${job.so_luong_tuyen || 0} ${job.yeu_cau_gioi_tinh || '(Nam/Nữ)'}`} />
                                    <DetailItem icon="cake" label="Độ tuổi" value={`${job.tuoi_tu || 18} - ${job.tuoi_den || 35} tuổi`} />
                                    <DetailItem icon="school" label="Trình độ" value="Tốt nghiệp THPT trở lên" />
                                    <DetailItem icon="height" label="Chiều cao" value="Nam > 160cm, Nữ > 150cm" />
                                    <DetailItem icon="visibility" label="Thị lực" value="Tốt (8/10 trở lên)" />
                                    <DetailItem icon="translate" label="Tiếng Nhật" value="N5 trở lên (được đào tạo)" />
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-secondary-900 mb-2">Mô tả công việc</h4>
                                    {isEditing ? (
                                        <textarea
                                            name="mo_ta_cong_viec"
                                            value={formData.mo_ta_cong_viec || ''}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg h-40 focus:ring-2 focus:ring-primary-500 outline-none"
                                            placeholder="Nhập mô tả công việc..."
                                        />
                                    ) : (
                                        <p className="text-secondary-600 leading-relaxed text-justify whitespace-pre-line">
                                            {job.mo_ta_cong_viec || 'Đang cập nhật chi tiết công việc...'}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-secondary-900 mb-2">Quyền lợi & Chế độ</h4>
                                    {isEditing ? (
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                            Phần này đang sử dụng nội dung tĩnh, chưa hỗ trợ chỉnh sửa trực tiếp.
                                        </div>
                                    ) : (
                                        <ul className="list-disc list-inside text-secondary-600 space-y-1 ml-2">
                                            <li>Lương cơ bản hấp dẫn, chưa tính làm thêm.</li>
                                            <li>Được đóng bảo hiểm theo luật lao động Nhật Bản.</li>
                                            <li>Hỗ trợ nhà ở, đi lại (tùy xí nghiệp).</li>
                                            <li>Cơ hội gia hạn Visa kỹ năng đặc định (Tokutei) lên đến 5 năm.</li>
                                        </ul>
                                    )}

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
                                <Link to={`/yeu-cau-tu-van?don_hang=${job.id}`} className="block w-full bg-primary-600 text-white font-bold py-4 rounded-xl text-center hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all mb-4 transform hover:-translate-y-1">
                                    ĐĂNG KÝ TƯ VẤN NGAY
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

function EditItem({ label, name, value, onChange, type = "text", placeholder }) {
    return (
        <div className="bg-gray-50 p-2 rounded border border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">{label}</p>
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                className="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-primary-500"
                placeholder={placeholder}
            />
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
