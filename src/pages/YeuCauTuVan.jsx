import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
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
        birthYear: '',
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

        try {
            // Lưu vào bảng ho_so (hoặc bảng tu_van riêng nếu có)
            // Ở đây ta lưu vào ho_so với trạng thái sơ khai
            const { error } = await supabase.from('ho_so').insert([{
                ho_ten: formData.fullName,
                so_dien_thoai: formData.phone,
                nam_sinh: formData.birthYear, // Cần đảm bảo DB có trường này hoặc convert sang birth_date
                que_quan: formData.hometown,
                ghi_chu: `Đăng ký tư vấn đơn hàng: ${job ? job.ten_don_hang : 'Tổng quát'}`,
                trang_thai: 'Chờ tư vấn',
                nguon: 'Web - Yêu cầu tư vấn'
            }])

            if (error) throw error

            alert('Gửi yêu cầu thành công! Cán bộ tuyển dụng sẽ liên hệ lại sớm nhất.')
            navigate('/') // Quay về trang chủ
        } catch (error) {
            console.error('Lỗi gửi form:', error)
            alert('Có lỗi xảy ra, vui lòng thử lại hoặc gọi hotline.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-secondary-50 font-sans text-secondary-800 pb-20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

            {/* Header / Logo */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
                <Link to="/" className="inline-block">
                    <span className="text-4xl font-black text-primary-600 tracking-tight">XKLD<span className="text-accent-500">4.0</span></span>
                </Link>
                <h2 className="mt-6 text-3xl font-black text-secondary-900 leading-9">
                    Yêu Cầu Tư Vấn Miễn Phí
                </h2>
                <p className="mt-2 text-sm text-secondary-600 max-w">
                    Để lại thông tin để nhận tư vấn chi tiết về đơn hàng <br />
                    {job && <span className="font-bold text-primary-700 text-lg block mt-1">"{job.ten_don_hang}"</span>}
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-primary-900/10 sm:rounded-2xl sm:px-10 border border-secondary-100 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500"></div>

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        <div>
                            <label htmlFor="fullName" className="block text-sm font-bold text-secondary-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons-outlined text-secondary-400">person</span>
                                </div>
                                <input id="fullName" name="fullName" type="text" required
                                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-secondary-300 rounded-lg py-3"
                                    placeholder="Nguyễn Văn A"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-bold text-secondary-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons-outlined text-secondary-400">phone_iphone</span>
                                </div>
                                <input id="phone" name="phone" type="tel" required
                                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-secondary-300 rounded-lg py-3"
                                    placeholder="0912 345 678"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="birthYear" className="block text-sm font-bold text-secondary-700 mb-1">Năm sinh</label>
                                <input id="birthYear" name="birthYear" type="number"
                                    className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-lg py-3 px-4"
                                    placeholder="2000"
                                    value={formData.birthYear}
                                    onChange={e => setFormData({ ...formData, birthYear: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="hometown" className="block text-sm font-bold text-secondary-700 mb-1">Quê quán</label>
                                <input id="hometown" name="hometown" type="text"
                                    className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-lg py-3 px-4"
                                    placeholder="Hà Nội"
                                    value={formData.hometown}
                                    onChange={e => setFormData({ ...formData, hometown: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="note" className="block text-sm font-bold text-secondary-700 mb-1">Câu hỏi / Ghi chú</label>
                            <textarea id="note" name="note" rows="3"
                                className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-secondary-300 rounded-lg p-3"
                                placeholder="Tôi muốn hỏi về..."
                                value={formData.note}
                                onChange={e => setFormData({ ...formData, note: e.target.value })}
                            ></textarea>
                        </div>

                        <div>
                            <button type="submit" disabled={submitting}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Đang gửi...' : 'GỬI YÊU CẦU TƯ VẤN'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-secondary-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-secondary-500">Hoặc liên hệ trực tiếp</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <a href="tel:19001234" className="w-full inline-flex justify-center py-2 px-4 border border-secondary-300 rounded-lg shadow-sm bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 transition-colors">
                                <span className="material-icons-outlined mr-2 text-primary-600">call</span>
                                Hotline
                            </a>
                            <a href="#" className="w-full inline-flex justify-center py-2 px-4 border border-secondary-300 rounded-lg shadow-sm bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 transition-colors">
                                <span className="material-icons-outlined mr-2 text-blue-600">facebook</span>
                                Messenger
                            </a>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <Link to="/viec-lam" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                        <span aria-hidden="true">←</span> Quay lại danh sách việc làm
                    </Link>
                </div>
            </div>
        </div>
    )
}
