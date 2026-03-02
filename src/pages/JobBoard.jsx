import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function JobBoard() {
    const navigate = useNavigate()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ nganh_nghe: '', dia_diem: '' })

    const fetchJobs = useCallback(async () => {
        setLoading(true)
        try {
            // Lấy cả đơn Đang tuyển và Sắp hết hạn
            let query = supabase.from('don_hang').select('*')
                .in('trang_thai', ['Đang tuyển', 'Sắp hết hạn'])
                .order('created_at', { ascending: false })

            if (filters.nganh_nghe) query = query.eq('nganh_nghe', filters.nganh_nghe)
            if (filters.dia_diem) query = query.ilike('dia_diem_lam_viec', `%${filters.dia_diem}%`)

            const { data, error } = await query
            if (error) throw error
            setJobs(data)
        } catch (error) {
            console.error('Error fetching jobs:', error)
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => {
        fetchJobs()
    }, [fetchJobs])

    const industries = ['Cơ khí', 'Xây dựng', 'Nông nghiệp', 'Chế biến thực phẩm', 'May mặc', 'Điện tử']

    const handleJobClick = (job) => {
        navigate(`/yeu-cau-tu-van?don_hang=${job.id}`)
    }

    return (
        <div className="min-h-screen bg-secondary-50 font-sans text-secondary-800 pb-20">
            {/* PAGE HERO */}
            <div className="bg-primary-900 text-white py-12 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[50%] -right-[10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[0%] left-[0%] w-[300px] h-[300px] bg-accent-500/10 rounded-full blur-3xl"></div>
                </div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Cơ Hội Việc Làm Nhật Bản</h1>
                    <p className="text-primary-200 text-lg font-light">Tìm kiếm công việc phù hợp với mức lương hấp dẫn và chế độ đãi ngộ tốt.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* SIDEBAR FILTERS */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-100 sticky top-24">
                            <h3 className="text-lg font-bold text-primary-900 mb-5 flex items-center gap-2">
                                <span className="material-icons-outlined text-primary-600">filter_list</span>
                                Bộ Lọc Tìm Kiếm
                            </h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2 ml-1">Ngành nghề</label>
                                    <div className="relative">
                                        <select
                                            className="w-full pl-3 pr-10 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all appearance-none font-medium text-secondary-700 cursor-pointer hover:border-primary-200"
                                            value={filters.nganh_nghe}
                                            onChange={e => setFilters({ ...filters, nganh_nghe: e.target.value })}
                                        >
                                            <option value="">Tất cả ngành nghề</option>
                                            {industries.map(ind => (
                                                <option key={ind} value={ind}>{ind}</option>
                                            ))}
                                        </select>
                                        <span className="material-icons-outlined absolute right-3 top-3 text-secondary-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2 ml-1">Địa điểm</label>
                                    <div className="relative group">
                                        <span className="material-icons-outlined absolute left-3 top-3 text-secondary-400 group-focus-within:text-primary-500 transition-colors">place</span>
                                        <input
                                            type="text"
                                            placeholder="Nhập tỉnh thành (VD: Tokyo)"
                                            className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-secondary-700 placeholder-secondary-400"
                                            value={filters.dia_diem}
                                            onChange={e => setFilters({ ...filters, dia_diem: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all active:translate-y-0.5 flex items-center justify-center gap-2">
                                    <span className="material-icons-outlined">search</span>
                                    Tìm Kiếm
                                </button>

                                <button
                                    onClick={() => setFilters({ nganh_nghe: '', dia_diem: '' })}
                                    className="w-full bg-white text-secondary-500 font-bold py-3 rounded-xl border border-secondary-200 hover:bg-secondary-50 hover:text-secondary-700 transition-all text-sm"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        </div>

                        {/* Banner Quang cao (Placeholder) */}
                        <div className="bg-gradient-to-br from-accent-500 to-orange-400 rounded-2xl p-6 text-white text-center shadow-lg hidden lg:block">
                            <span className="material-icons-outlined text-4xl mb-2">stars</span>
                            <h4 className="font-bold text-xl mb-2">Đăng Ký Trực Tuyến</h4>
                            <p className="text-sm opacity-90 mb-4">Nộp hồ sơ ngay để được ưu tiên phỏng vấn sớm nhất!</p>
                            <button onClick={() => navigate('/yeu-cau-tu-van')} className="inline-block bg-white text-accent-600 font-bold px-6 py-2 rounded-lg shadow-md hover:bg-orange-50 transition-colors text-sm">
                                Đăng Ký Ngay
                            </button>
                        </div>
                    </div>

                    {/* JOB LIST */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-primary-900">
                                {loading ? 'Đang tải...' : `Tìm thấy ${jobs.length} đơn hàng`}
                            </h2>
                            <div className="text-sm text-secondary-500 hidden sm:block">
                                Hiển thị theo: <span className="font-bold text-secondary-700 text-xs bg-white px-2 py-1 rounded border border-secondary-200 ml-1">Mới nhất</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-secondary-100 animate-pulse h-64"></div>
                                ))}
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-secondary-200 border-dashed">
                                <div className="w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-secondary-300">
                                    <span className="material-icons-outlined text-4xl">search_off</span>
                                </div>
                                <h3 className="text-lg font-bold text-secondary-400">Không tìm thấy đơn hàng phù hợp</h3>
                                <p className="text-secondary-400 text-sm mt-1">Vui lòng thử lại với từ khóa khác.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {jobs.map(job => (
                                    <JobCard key={job.id} job={job} onClick={() => handleJobClick(job)} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL */}

        </div>
    )
}

function JobCard({ job, onClick }) {
    // Format Salary
    const formatSalary = (job) => {
        if (job.muc_luong) return job.muc_luong + (String(job.muc_luong).match(/\D/) ? '' : ' ¥') // Nếu có chữ thì thôi, nếu chỉ số thì thêm Yên
        if (job.luong_co_ban) return new Intl.NumberFormat('vi-VN').format(job.luong_co_ban) + ' ¥'
        return 'Thỏa thuận'
    }

    const industriesIcon = {
        'Cơ khí': 'build',
        'Xây dựng': 'foundation',
        'Nông nghiệp': 'agriculture',
        'Chế biến thực phẩm': 'restaurant',
        'May mặc': 'checkroom',
        'Điện tử': 'memory'
    }

    // Modal Trigger
    return (
        <div onClick={onClick} className="cursor-pointer bg-white rounded-2xl p-0 shadow-sm hover:shadow-xl hover:shadow-primary-900/5 border border-secondary-100 hover:border-primary-200 transition-all duration-300 group flex flex-col overflow-hidden h-full relative">

            {/* Badge cho đơn hàng Sắp hết hạn */}
            {job.trang_thai === 'Sắp hết hạn' && (
                <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full border border-yellow-200 z-10 shadow-sm">
                    Sắp hết hạn
                </div>
            )}

            <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${job.nganh_nghe ? 'bg-primary-600' : 'bg-gray-400'}`}>
                            <span className="material-icons-outlined text-2xl">
                                {industriesIcon[job.nganh_nghe] || 'work'}
                            </span>
                        </div>
                        <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-100 mb-1">
                                {job.nganh_nghe || 'Khác'}
                            </span>
                            <h3 className="text-lg font-bold text-primary-900 line-clamp-1 group-hover:text-primary-600 transition-colors" title={job.ten_don_hang}>
                                {job.ten_don_hang}
                            </h3>
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); /* Bookmark */ }} className="text-secondary-300 hover:text-accent-500 transition-colors z-10 relative">
                        <span className="material-icons-outlined">bookmark_border</span>
                    </button>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-secondary-600">
                        <span className="material-icons-outlined text-lg mr-2 text-primary-400">payments</span>
                        <span className="font-semibold text-primary-700 text-base">{formatSalary(job)}</span>
                        <span className="text-xs text-secondary-400 ml-1">/tháng</span>
                    </div>
                    <div className="flex items-center text-sm text-secondary-600">
                        <span className="material-icons-outlined text-lg mr-2 text-secondary-400">place</span>
                        <span className="font-medium">{job.dia_diem_lam_viec}</span>
                    </div>
                    <div className="flex items-center text-sm text-secondary-600">
                        <span className="material-icons-outlined text-lg mr-2 text-secondary-400">group</span>
                        <span>Tuyển: <span className="font-bold text-secondary-800">{job.so_luong_tuyen}</span> người</span>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-100 flex items-center justify-between group-hover:bg-primary-50/50 transition-colors mt-auto">
                <div className="flex items-center gap-1 text-xs text-secondary-500 font-medium w-full justify-center">
                    <span className="material-icons-outlined text-sm text-red-500">event_busy</span>
                    <span>Hạn nộp: {job.thoi_han_nop_ho_so ? new Date(job.thoi_han_nop_ho_so).toLocaleDateString('vi-VN') : 'Không giới hạn'}</span>
                </div>
            </div>
        </div>
    )
}
