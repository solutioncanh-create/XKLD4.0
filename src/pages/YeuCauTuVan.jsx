import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function YeuCauTuVan() {
    const [searchParams] = useSearchParams()
    const donHangId = searchParams.get('don_hang')
    const navigate = useNavigate()

    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(donHangId ? true : false)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        birthYear: '',
        gender: 'Nam',
        hometown: '',
        note: ''
    })

    useEffect(() => {
        if (donHangId) {
            fetchJobInfo()
        }
    }, [donHangId])

    const fetchJobInfo = async () => {
        try {
            const { data, error } = await supabase
                .from('don_hang')
                .select('*')
                .eq('id', donHangId)
                .single()

            if (error) throw error
            setJob(data)
        } catch (error) {
            console.error('Error fetching job:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        if (!formData.phone || formData.phone.length < 10) {
            alert('Vui lòng nhập số điện thoại hợp lệ!')
            setSubmitting(false)
            return
        }
        if (!formData.email) {
            alert('Vui lòng nhập Email!')
            setSubmitting(false)
            return
        }

        try {
            const currentYear = new Date().getFullYear()
            const age = formData.birthYear ? (currentYear - parseInt(formData.birthYear)) : null

            const noteContent = `[Giới tính: ${formData.gender}] [Email: ${formData.email || 'Không có'}] ${job ? `Quan tâm đơn: ${job.ten_don_hang}` : ''} - ${formData.note || ''}`

            const { error } = await supabase.from('yeu_cau_tu_van').insert([{
                ho_ten: formData.fullName,
                so_dien_thoai: formData.phone,
                email: formData.email,
                tuoi: age,
                gioi_tinh: formData.gender,
                que_quan: formData.hometown,
                ghi_chu: noteContent,
                trang_thai: 'Chờ tư vấn'
            }])

            if (error) throw error

            alert('Kích hoạt hồ sơ thành công! Hệ thống AI đang phân tích và chuyên viên sẽ liên hệ sớm.')
            navigate('/')
        } catch (error) {
            console.error('Lỗi gửi form:', error)
            alert('Có lỗi xảy ra: ' + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-secondary-50 flex flex-col font-sans text-secondary-900">
            {/* Navbar */}
            <header className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link to="/" className="flex-shrink-0 flex items-center group">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center mr-2 shadow-lg shadow-primary-200 group-hover:scale-105 transition-transform">
                            <span className="material-icons-outlined text-white text-2xl">public</span>
                        </div>
                        <span className="text-2xl font-black text-secondary-800 group-hover:text-primary-600 transition-colors">
                            XKLD <span className="inline-block bg-gradient-to-r from-yellow-400 to-red-600 text-transparent bg-clip-text pb-1 pr-1">4.0</span>
                        </span>
                    </Link>
                    <Link to="/" className="text-sm font-bold text-secondary-500 hover:text-primary-700 flex items-center gap-2 transition-colors">
                        <span className="material-icons-outlined text-lg">arrow_back</span> Trang chủ
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full py-8 md:py-12 px-4 gap-8">

                {/* Left Content (Rewrite) */}
                <div className="flex-1 flex flex-col justify-center animate-fade-in-up">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold mb-6 tracking-wide uppercase border border-primary-100 shadow-sm">
                            <span className="material-icons-outlined text-base animate-pulse">auto_awesome</span>
                            Tiên phong ứng dụng AI trong XKLD
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold text-secondary-900 mb-6 leading-tight tracking-tight">
                            Công Nghệ Dẫn Lối <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-primary-500">Tối Ưu Hóa Tương Lai</span>
                        </h1>

                        <p className="text-lg text-secondary-600 mb-8 leading-relaxed text-justify">
                            Nền tảng <strong>XKLD 4.0</strong> ứng dụng Trí tuệ nhân tạo để tự động hóa quy trình, loại bỏ trung gian và minh bạch tài chính. Chúng tôi giúp bạn tiếp cận thị trường Nhật Bản với <strong>chi phí thấp nhất</strong> và <strong>tốc độ xử lý nhanh nhất</strong>.
                            {job && (
                                <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-xl flex items-start gap-3">
                                    <span className="material-icons-outlined text-primary-600 mt-0.5">check_circle</span>
                                    <div>
                                        <span className="text-sm text-primary-600 block font-bold uppercase tracking-wider mb-1">Đơn hàng đã chọn:</span>
                                        <span className="text-lg font-bold text-primary-900 leading-tight">{job.ten_don_hang}</span>
                                    </div>
                                </div>
                            )}
                        </p>

                        <div className="space-y-5">
                            {[
                                { icon: 'psychology', title: 'AI Matching Thông Minh', desc: 'Phân tích dữ liệu lớn để chọn lọc đơn hàng có tỷ lệ đỗ cao nhất cho bạn.' },
                                { icon: 'savings', title: 'Chi Phí Cực Thấp', desc: 'Số hóa 100% quy trình giúp cắt giảm tối đa phí quản lý và môi giới.' },
                                { icon: 'rocket_launch', title: 'Tốc Độ Vượt Trội', desc: 'Xử lý hồ sơ tự động, rút ngắn 30% thời gian chờ đợi xuất cảnh.' },
                                { icon: 'verified_user', title: 'Minh Bạch Tuyệt Đối', desc: 'Theo dõi tiến độ hồ sơ và dòng tiền trực tuyến trên App 24/7.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start group p-3 rounded-xl hover:bg-secondary-50 transition-colors -mx-3">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white shadow-sm border border-secondary-200 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform group-hover:border-primary-200">
                                        <span className="material-icons-outlined text-2xl">{item.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-secondary-900 text-lg group-hover:text-primary-700 transition-colors">{item.title}</h3>
                                        <p className="text-sm text-secondary-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Form */}
                <div className="flex-1 flex items-center justify-center md:justify-end animate-fade-in-up delay-100">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-primary-900/10 border border-secondary-100 overflow-hidden relative">
                        {/* Decorative Gradient Line */}
                        <div className="h-1.5 bg-gradient-to-r from-primary-600 to-accent-500 w-full absolute top-0 left-0"></div>

                        <div className="p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-black text-secondary-900 mb-2 flex items-center gap-2">
                                    <span className="material-icons-outlined text-primary-600 text-3xl">support_agent</span>
                                    Yêu cầu tư vấn Online
                                </h2>
                                <p className="text-sm text-secondary-500">Nhập thông tin để hệ thống phân tích cơ hội ngay lập tức.</p>
                            </div>

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-xs font-bold text-secondary-700 mb-1 uppercase tracking-wider">Họ và tên <span className="text-red-500">*</span></label>
                                    <input type="text" required
                                        className="w-full px-4 py-3 rounded-lg bg-secondary-50 border border-secondary-200 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder-secondary-400"
                                        placeholder="NGUYEN VAN A"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-secondary-700 mb-1 uppercase tracking-wider">Số điện thoại <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="material-icons-outlined absolute left-3 top-3 text-secondary-400">phone_iphone</span>
                                        <input type="tel" required
                                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-secondary-50 border border-secondary-200 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder-secondary-400"
                                            placeholder="09xx..."
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-secondary-700 mb-1 uppercase tracking-wider">Email <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="material-icons-outlined absolute left-3 top-3 text-secondary-400">email</span>
                                        <input type="email" required
                                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-secondary-50 border border-secondary-200 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder-secondary-400"
                                            placeholder="example@gmail.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-secondary-700 mb-1 uppercase tracking-wider">Năm sinh</label>
                                        <input type="number" min="1980" max="2010"
                                            className="w-full px-4 py-3 rounded-lg bg-secondary-50 border border-secondary-200 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium"
                                            placeholder="2000"
                                            value={formData.birthYear}
                                            onChange={e => setFormData({ ...formData, birthYear: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-secondary-700 mb-1 uppercase tracking-wider">Giới tính</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-lg bg-secondary-50 border border-secondary-200 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium"
                                            value={formData.gender}
                                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-secondary-700 mb-1 uppercase tracking-wider">Quê quán</label>
                                    <input type="text"
                                        className="w-full px-4 py-3 rounded-lg bg-secondary-50 border border-secondary-200 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder-secondary-400"
                                        placeholder="Tỉnh/Thành phố"
                                        value={formData.hometown}
                                        onChange={e => setFormData({ ...formData, hometown: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-secondary-700 mb-1 uppercase tracking-wider">Ghi chú (Nếu có)</label>
                                    <textarea rows="2"
                                        className="w-full px-4 py-3 rounded-lg bg-secondary-50 border border-secondary-200 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none font-medium placeholder-secondary-400"
                                        placeholder="Ví dụ: Mong muốn đi đơn Nông nghiệp..."
                                        value={formData.note}
                                        onChange={e => setFormData({ ...formData, note: e.target.value })}
                                    ></textarea>
                                </div>

                                <button type="submit" disabled={submitting}
                                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            Gửi yêu cầu <span className="material-icons-outlined">send</span>
                                        </>
                                    )}
                                </button>

                            </form>

                            <div className="mt-6 text-center border-t border-secondary-100 pt-4">
                                <p className="text-sm text-secondary-500 mb-2">
                                    Bạn muốn nộp hồ sơ chi tiết ngay? <br />
                                    <Link to="/dang-ky" className="text-primary-600 font-bold hover:underline">Điền form đầy đủ tại đây &rarr;</Link>
                                </p>
                                <p className="text-[10px] text-secondary-400 flex items-center justify-center gap-1">
                                    <span className="material-icons-outlined text-xs">lock</span>
                                    Hệ thống bảo mật dữ liệu theo tiêu chuẩn quốc tế.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Simple */}
            <footer className="bg-white border-t border-secondary-200 py-8 text-center">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-secondary-500 text-sm font-medium">&copy; {new Date().getFullYear()} XKLD 4.0 - Nền tảng tuyển dụng XKLĐ Công nghệ cao.</p>
                </div>
            </footer>
        </div>
    )
}
