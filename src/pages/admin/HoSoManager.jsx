import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function HoSoManager() {
    const [profiles, setProfiles] = useState([])
    const [search, setSearch] = useState('')
    const [loadingList, setLoadingList] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        fetchProfiles()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchProfiles = async () => {
        setLoadingList(true)
        try {
            let query = supabase.from('ho_so').select('*').order('created_at', { ascending: false })
            if (search) {
                query = query.ilike('ho_ten', `%${search}%`)
            }
            const { data, error } = await query
            if (error) throw error
            setProfiles(data || [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingList(false)
        }
    }

    const seedFakeData = async () => {
        // ... (Giữ nguyên logic seed data cũ, rút gọn để focus vào cấu trúc)
        // Trong thực tế nên tách seed ra file util riêng, nhưng tạm thời để đây cho nhanh
        const defaultProfile = {
            ho_ten: '', ngay_sinh: '2000-01-01', gioi_tinh: 'Nam', hon_nhan: 'Độc thân',
            que_quan: '', dia_chi_thuong_tru: 'Hà Nội', so_dien_thoai: '', email: '',
            so_cccd: '001200000000', ngay_cap_cccd: '2020-01-01', noi_cap_cccd: 'Cục CS QLHC',
            so_ho_chieu: '', ngay_cap_ho_chieu: '2020-01-01', ngay_het_han_ho_chieu: '2030-01-01',
            ton_giao: 'Không', size_ao: 'M', size_giay: '40',
            anh_ho_so: '', anh_cccd_mat_truoc: '', anh_cccd_mat_sau: '',
            thong_tin_gia_dinh: [], nguoi_bao_lanh: 'Nguyễn Văn A', sdt_nguoi_bao_lanh: '0900000000',
            chieu_cao: 165, can_nang: 60, nhom_mau: 'O', thi_luc_trai: '10/10', thi_luc_phai: '10/10', tay_thuan: 'Phải',
            xam_hinh: false, mu_mau: false, hut_thuoc: false, uong_ruou: false,
            qua_trinh_hoc_tap: [], kinh_nghiem_lam_viec: [],
            trinh_do_tieng_nhat: 'Chưa biết', bang_lai_xe: 'Chưa có', diem_manh: '', diem_yeu: '',
            nganh_nghe_mong_muon: '', thoi_gian_du_kien: '3 năm', muc_dich_di_nhat: 'Kiếm tiền'
        }

        const fakeDataList = [
            { ho_ten: 'NGUYỄN VĂN MẠNH', ngay_sinh: '2000-05-15', gioi_tinh: 'Nam', so_dien_thoai: '0912345678', nganh_nghe_mong_muon: 'Xây dựng', anh_ho_so: 'https://randomuser.me/api/portraits/men/32.jpg', que_quan: 'Hà Nội' },
            { ho_ten: 'TRẦN THỊ LAN', ngay_sinh: '2002-08-20', gioi_tinh: 'Nữ', so_dien_thoai: '0987654321', nganh_nghe_mong_muon: 'Thực phẩm', anh_ho_so: 'https://randomuser.me/api/portraits/women/44.jpg', que_quan: 'Nam Định' },
            { ho_ten: 'LÊ VĂN HÙNG', ngay_sinh: '1999-12-10', gioi_tinh: 'Nam', so_dien_thoai: '0909090909', nganh_nghe_mong_muon: 'Cơ khí', anh_ho_so: 'https://randomuser.me/api/portraits/men/85.jpg', que_quan: 'Thanh Hóa' },
            { ho_ten: 'PHẠM THỊ HƯƠNG', ngay_sinh: '2001-03-25', gioi_tinh: 'Nữ', so_dien_thoai: '0933445566', nganh_nghe_mong_muon: 'May mặc', anh_ho_so: 'https://randomuser.me/api/portraits/women/68.jpg', que_quan: 'Nghệ An' },
            { ho_ten: 'HOÀNG VĂN NAM', ngay_sinh: '1998-11-05', gioi_tinh: 'Nam', so_dien_thoai: '0911223344', nganh_nghe_mong_muon: 'Nông nghiệp', anh_ho_so: 'https://randomuser.me/api/portraits/men/22.jpg', que_quan: 'Thái Bình' }
        ]

        try {
            const dataToInsert = fakeDataList.map(item => ({ ...defaultProfile, ...item }))
            const { error } = await supabase.from('ho_so').insert(dataToInsert)
            if (error) throw error
            alert('Đã thêm 5 hồ sơ mẫu thành công!')
            fetchProfiles()
        } catch (error) {
            console.error('Seed Error:', error)
            alert('Lỗi: ' + error.message)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
            {/* Header Toolbar */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white sticky top-0 z-10">
                <div>
                    <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                        <span className="material-icons-outlined text-primary-600">people</span>
                        Danh sách hồ sơ ({profiles.length})
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Quản lý tất cả ứng viên trong hệ thống</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Tìm theo tên..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchProfiles()}
                            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64 transition-all group-hover:border-primary-300"
                        />
                        <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400 group-hover:text-primary-500 transition-colors">search</span>
                    </div>

                    <button onClick={seedFakeData} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-gray-200">
                        <span className="material-icons-outlined text-lg">playlist_add</span>
                        + 5 HS Demo
                    </button>

                    <button onClick={() => navigate('/dang-ky')} className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-bold shadow-lg shadow-primary-200 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
                        <span className="material-icons-outlined">add_circle</span>
                        Thêm Mới
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider sticky top-0">
                        <tr>
                            <th className="px-6 py-4 font-bold border-b border-gray-200">Ứng viên</th>
                            <th className="px-6 py-4 font-bold border-b border-gray-200">Thông tin liên hệ</th>
                            <th className="px-6 py-4 font-bold border-b border-gray-200">Nguyện vọng</th>
                            <th className="px-6 py-4 font-bold border-b border-gray-200">Ngày ĐK</th>
                            <th className="px-6 py-4 font-bold border-b border-gray-200 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {loadingList ? (
                            <tr><td colSpan="5" className="p-10 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></td></tr>
                        ) : profiles.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-gray-400 flex flex-col items-center">
                                    <span className="material-icons-outlined text-4xl mb-2 text-gray-300">search_off</span>
                                    <span>Không tìm thấy hồ sơ nào phù hợp.</span>
                                </td>
                            </tr>
                        ) : profiles.map(p => (
                            <tr key={p.id} className="hover:bg-blue-50/50 transition-colors group cursor-default">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img src={p.anh_ho_so || `https://ui-avatars.com/api/?name=${p.ho_ten}&background=random`} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform" alt="" />
                                            {/* Status dot (example) */}
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 text-base">{p.ho_ten}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <span className="material-icons-outlined text-[10px]">wc</span> {p.gioi_tinh} • {new Date().getFullYear() - (p.ngay_sinh ? new Date(p.ngay_sinh).getFullYear() : 2000)} tuổi
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="text-gray-800 font-medium flex items-center gap-2">
                                        <span className="material-icons-outlined text-gray-400 text-sm">call</span>
                                        {p.so_dien_thoai || '---'}
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1 flex items-center gap-2">
                                        <span className="material-icons-outlined text-gray-400 text-sm">location_on</span>
                                        {p.que_quan || '---'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                        {p.nganh_nghe_mong_muon || 'Chưa chọn'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(p.created_at).toLocaleDateString('vi-VN')}
                                    <br /><span className="text-xs text-gray-400 ">{new Date(p.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => navigate(`/ho-so/${p.id}`)}
                                        className="text-primary-600 hover:text-white border border-primary-200 hover:bg-primary-600 focus:ring-2 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <span className="material-icons-outlined text-lg mr-1">visibility</span>
                                        Chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
