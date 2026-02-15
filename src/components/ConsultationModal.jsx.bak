import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ConsultationModal({ onClose, job }) {
    const [formData, setFormData] = useState({ name: '', age: '', hometown: '', phone: '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Lưu vào bảng ho_so
            // Lưu vào bảng yeu_cau_tu_van
            const { error } = await supabase.from('yeu_cau_tu_van').insert([{
                ho_ten: formData.name,
                so_dien_thoai: formData.phone,
                tuoi: parseInt(formData.age || 0),
                que_quan: formData.hometown,
                ghi_chu: job ? `Quan tâm đơn: ${job.ten_don_hang}` : 'Tư vấn chung',
                trang_thai: 'Chờ tư vấn'
            }])

            if (error) throw error

            alert(`Cảm ơn ${formData.name}! Chúng tôi đã nhận được thông tin.`)
            onClose()
        } catch (error) {
            console.error('Lỗi gửi form:', error)
            alert('Có lỗi xảy ra, vui lòng thử lại sau.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in relative transform transition-all border border-secondary-100">
                <button onClick={onClose} className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 z-10 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary-100">
                    <span className="material-icons-outlined text-lg">close</span>
                </button>

                <div className="p-8 pb-0 text-center">
                    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                        <span className="material-icons-outlined text-3xl">mark_email_read</span>
                    </div>
                    <h3 className="text-2xl font-bold text-secondary-900 mb-2">Đăng Ký Tư Vấn</h3>
                    <p className="text-secondary-500 text-sm">Nhận thông tin đơn hàng và lộ trình chi tiết.</p>

                    {job && (
                        <div className="mt-4 bg-primary-50 p-3 rounded-lg border border-primary-100">
                            <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-1">Đơn hàng quan tâm</p>
                            <p className="font-bold text-primary-800 line-clamp-1">{job.ten_don_hang}</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-4">
                    <div className="space-y-4">
                        <div className="relative group">
                            <span className="material-icons-outlined absolute left-3 top-3 text-secondary-400 text-xl group-focus-within:text-primary-500 transition-colors">person</span>
                            <input required className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800 placeholder-secondary-400" placeholder="Họ và tên" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <span className="material-icons-outlined absolute left-3 top-3 text-secondary-400 text-xl group-focus-within:text-primary-500 transition-colors">cake</span>
                                <input type="number" required className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800 placeholder-secondary-400" placeholder="Tuổi" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                            </div>
                            <div className="relative group">
                                <span className="material-icons-outlined absolute left-3 top-3 text-secondary-400 text-xl group-focus-within:text-primary-500 transition-colors">home</span>
                                <input required className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800 placeholder-secondary-400" placeholder="Quê quán" value={formData.hometown} onChange={e => setFormData({ ...formData, hometown: e.target.value })} />
                            </div>
                        </div>

                        <div className="relative group">
                            <span className="material-icons-outlined absolute left-3 top-3 text-secondary-400 text-xl group-focus-within:text-primary-500 transition-colors">phone_iphone</span>
                            <input required type="tel" className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-medium text-secondary-800 placeholder-secondary-400" placeholder="Số điện thoại" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-primary-700 text-white font-bold py-3.5 rounded-lg hover:bg-primary-800 shadow-lg shadow-primary-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4">
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <span className="material-icons-outlined">send</span>}
                        <span>Gửi Yêu Cầu Tư Vấn</span>
                    </button>

                    <p className="text-xs text-secondary-400 text-center flex items-center justify-center gap-1">
                        <span className="material-icons-outlined text-sm">lock</span>
                        Bảo mật thông tin 100%
                    </p>
                </form>
            </div>
        </div>
    )
}
