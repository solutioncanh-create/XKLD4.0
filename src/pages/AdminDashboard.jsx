import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [selectedMenu, setSelectedMenu] = useState('dashboard') // dashboard | hoso | donhang | thongbao
    const [stats, setStats] = useState({ totalActive: 0, newToday: 0, pending: 0, revenue: 0 })
    const [recentProfiles, setRecentProfiles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            // Lấy tổng số hồ sơ
            const { count: totalCount } = await supabase.from('ho_so').select('*', { count: 'exact', head: true })

            // Lấy hồ sơ mới hôm nay
            const today = new Date().toISOString().split('T')[0]
            const { count: newCount } = await supabase.from('ho_so').select('*', { count: 'exact', head: true }).gte('created_at', today)

            // Lấy hồ sơ gần đây
            const { data: recent } = await supabase.from('ho_so').select('*').order('created_at', { ascending: false }).limit(5)

            setStats({
                totalActive: totalCount || 0,
                newToday: newCount || 0,
                pending: 0, // Tạm thời để 0 hoặc query theo status nếu có
                revenue: 0
            })
            setRecentProfiles(recent || [])
        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const MenuItem = ({ id, icon, label, badge }) => (
        <div
            onClick={() => setSelectedMenu(id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1
                ${selectedMenu === id ? 'bg-primary-50 text-primary-700 font-bold shadow-sm border border-primary-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
        >
            <span className="material-icons-outlined text-xl">{icon}</span>
            <span className="flex-1">{label}</span>
            {badge && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{badge}</span>}
        </div>
    )

    const StatCard = ({ title, value, unit, icon, color }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wide">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                    {unit && <span className="text-sm text-gray-500">{unit}</span>}
                </div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${color}-50 text-${color}-600`}>
                <span className="material-icons-outlined text-2xl">{icon}</span>
            </div>
        </div>
    )

    const DonHangManager = () => {
        const [orders, setOrders] = useState([])
        const [loading, setLoading] = useState(true)
        const [isAdding, setIsAdding] = useState(false)
        const [newOrder, setNewOrder] = useState({
            ten_don_hang: '', nganh_nghe: 'Xây dựng', muc_luong: '',
            so_luong_tuyen: 1, dia_diem_lam_viec: '',
            thoi_han_nop_ho_so: '', ngay_tuyen_du_kien: '', trang_thai: 'Đang tuyển'
        })

        useEffect(() => { fetchOrders() }, [])

        const fetchOrders = async () => {
            try {
                const { data, error } = await supabase.from('don_hang').select('*').order('created_at', { ascending: false })
                if (error) throw error
                setOrders(data || [])
            } catch (error) {
                console.error('Lỗi tải đơn hàng:', error)
            } finally {
                setLoading(false)
            }
        }

        const handleAddOrder = async (e) => {
            e.preventDefault()
            try {
                const { error } = await supabase.from('don_hang').insert([newOrder])
                if (error) throw error
                alert('Thêm đơn hàng thành công!')
                setIsAdding(false)
                setNewOrder({ ten_don_hang: '', nganh_nghe: 'Xây dựng', muc_luong: '', so_luong_tuyen: 1, dia_diem_lam_viec: '', thoi_han_nop_ho_so: '', ngay_tuyen_du_kien: '', trang_thai: 'Đang tuyển' })
                fetchOrders()
            } catch (error) { alert('Lỗi tải lên: ' + error.message) }
        }

        const handleDelete = async (id) => {
            if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
                try {
                    const { error } = await supabase.from('don_hang').delete().eq('id', id)
                    if (error) throw error
                    fetchOrders()
                } catch (error) { alert('Lỗi xóa: ' + error.message) }
            }
        }

        return (
            <div className="space-y-6 animate-fade-in">
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h2>
                        <p className="text-gray-500 text-sm">Danh sách các đơn hàng thực tế từ hệ thống</p>
                    </div>
                    <button onClick={() => setIsAdding(!isAdding)} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-primary-700 flex items-center gap-2 transition-colors">
                        <span className="material-icons-outlined">add</span> {isAdding ? 'Hủy bỏ' : 'Thêm Đơn Mới'}
                    </button>
                </div>

                {/* Form thêm mới */}
                {isAdding && (
                    <div className="bg-white p-6 rounded-xl border border-primary-100 shadow-lg animate-fade-in-down mb-6">
                        <h3 className="font-bold text-lg mb-4 text-primary-700 border-b pb-2">Thêm Đơn Hàng Mới</h3>
                        <form onSubmit={handleAddOrder} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 block mb-1">Tên đơn hàng</label>
                                <input required className="w-full p-2 border border-gray-300 rounded focus:border-primary-500 outline-none" placeholder="VD: Kỹ sư xây dựng..." value={newOrder.ten_don_hang} onChange={e => setNewOrder({ ...newOrder, ten_don_hang: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Ngành nghề</label>
                                <select className="w-full p-2 border border-gray-300 rounded" value={newOrder.nganh_nghe} onChange={e => setNewOrder({ ...newOrder, nganh_nghe: e.target.value })}>
                                    {['Xây dựng', 'Thực phẩm', 'Cơ khí', 'May mặc', 'Nông nghiệp', 'Điều dưỡng'].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div><label className="text-xs font-bold text-gray-500 block mb-1">Mức lương</label><input required className="w-full p-2 border border-gray-300 rounded" placeholder="VD: 18 Man" value={newOrder.muc_luong} onChange={e => setNewOrder({ ...newOrder, muc_luong: e.target.value })} /></div>
                            <div><label className="text-xs font-bold text-gray-500 block mb-1">Số lượng</label><input type="number" min="1" className="w-full p-2 border border-gray-300 rounded" value={newOrder.so_luong_tuyen} onChange={e => setNewOrder({ ...newOrder, so_luong_tuyen: e.target.value })} /></div>
                            <div><label className="text-xs font-bold text-gray-500 block mb-1">Địa điểm làm việc</label><input required className="w-full p-2 border border-gray-300 rounded" placeholder="VD: Tokyo" value={newOrder.dia_diem_lam_viec} onChange={e => setNewOrder({ ...newOrder, dia_diem_lam_viec: e.target.value })} /></div>

                            <div className="bg-yellow-50 p-2 rounded border border-yellow-100">
                                <label className="text-xs font-bold text-yellow-800 block mb-1">Hạn nộp hồ sơ</label>
                                <input type="date" required className="w-full p-2 border border-yellow-300 rounded bg-white text-sm" value={newOrder.thoi_han_nop_ho_so} onChange={e => setNewOrder({ ...newOrder, thoi_han_nop_ho_so: e.target.value })} />
                            </div>
                            <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                <label className="text-xs font-bold text-blue-800 block mb-1">Ngày tuyển dự kiến</label>
                                <input type="date" className="w-full p-2 border border-blue-300 rounded bg-white text-sm" value={newOrder.ngay_tuyen_du_kien} onChange={e => setNewOrder({ ...newOrder, ngay_tuyen_du_kien: e.target.value })} />
                            </div>

                            <div className="flex items-end pt-1">
                                <button type="submit" className="w-full bg-primary-600 text-white font-bold py-2 rounded hover:bg-primary-700 shadow transition-colors h-10">Lưu Đơn Hàng</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Danh sách đơn hàng table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Tên đơn hàng</th>
                                    <th className="px-6 py-3 font-semibold">Lương / SL</th>
                                    <th className="px-6 py-3 font-semibold">Địa điểm</th>
                                    <th className="px-6 py-3 font-semibold">Thời gian</th>
                                    <th className="px-6 py-3 font-semibold">Trạng thái</th>
                                    <th className="px-6 py-3 font-semibold text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-8 text-center"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div></td></tr>
                                ) : orders.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">Chưa có đơn hàng nào trong hệ thống.</td></tr>
                                ) : orders.map(o => (
                                    <tr key={o.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{o.ten_don_hang}</div>
                                            <div className="text-xs text-blue-600 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">{o.nganh_nghe}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-700">{o.muc_luong}</div>
                                            <div className="text-xs text-gray-500">Cần tuyển: <span className="font-bold text-primary-600">{o.so_luong_tuyen}</span></div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">{o.dia_diem_lam_viec}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="text-red-600 font-medium text-xs">Hạn: {o.thoi_han_nop_ho_so ? new Date(o.thoi_han_nop_ho_so).toLocaleDateString('vi-VN') : '-'}</div>
                                            {o.ngay_tuyen_du_kien && <div className="text-blue-600 font-medium text-xs mt-1">Thi: {new Date(o.ngay_tuyen_du_kien).toLocaleDateString('vi-VN')}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${o.trang_thai === 'Đang tuyển' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{o.trang_thai}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(o.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors" title="Xóa">
                                                <span className="material-icons-outlined">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    const HoSoManager = () => {
        const [profiles, setProfiles] = useState([])
        const [search, setSearch] = useState('')
        const [loadingList, setLoadingList] = useState(false)

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

            console.log('Bắt đầu tạo mẫu...')
            const dataToInsert = fakeDataList.map(item => ({ ...defaultProfile, ...item }))

            try {
                const { error } = await supabase.from('ho_so').insert(dataToInsert)
                if (error) throw error

                alert('Đã thêm 5 hồ sơ mẫu thành công!')
                fetchProfiles()
            } catch (error) {
                console.error('Seed Error:', error)
                alert('Lỗi: ' + error.message + ' (Xem Console để biết thêm)')
            }
        }

        const handleDelete = async (id) => {
            if (!window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này không?')) return
            try {
                const { error } = await supabase.from('ho_so').delete().eq('id', id)
                if (error) throw error
                setProfiles(profiles.filter(p => p.id !== id))
            } catch (error) {
                alert('Lỗi xóa: ' + error.message)
            }
        }

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="font-bold text-lg text-gray-800">Danh sách hồ sơ ({profiles.length})</h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm theo tên..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && fetchProfiles()}
                                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                            />
                            <span className="material-icons-outlined absolute left-2.5 top-2 text-gray-400 text-lg">search</span>
                        </div>
                        <button onClick={fetchProfiles} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">Tìm kiếm</button>
                        <button onClick={seedFakeData} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium whitespace-nowrap" title="Tạo dữ liệu giả để test">
                            + 5 HS Ảo
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-3 font-semibold">Ứng viên</th>
                                <th className="px-6 py-3 font-semibold">Thông tin liên hệ</th>
                                <th className="px-6 py-3 font-semibold">Nguyện vọng</th>
                                <th className="px-6 py-3 font-semibold">Ngày ĐK</th>
                                <th className="px-6 py-3 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingList ? (
                                <tr><td colSpan="5" className="p-8 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></td></tr>
                            ) : profiles.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Không tìm thấy hồ sơ nào.</td></tr>
                            ) : profiles.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={p.anh_ho_so || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" />
                                            <div>
                                                <div className="font-bold text-gray-800">{p.ho_ten}</div>
                                                <div className="text-xs text-gray-500">{p.gioi_tinh} • {p.nam_sinh || 'Unknown'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="text-gray-800 font-medium">{p.so_dien_thoai}</div>
                                        <div className="text-gray-500 text-xs">{p.que_quan}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {p.nganh_nghe_mong_muon || 'Chưa chọn'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(p.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => navigate(`/ho-so/${p.id}`)} className="text-blue-600 hover:text-blue-800 font-bold text-sm border border-blue-200 px-3 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors">
                                            Xem Chi Tiết
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 font-bold text-sm border border-red-200 px-3 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors">
                                            Xóa
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

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* --- SIDEBAR --- */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <span className="text-2xl font-black text-primary-700 tracking-tighter">XKLD<span className="text-accent-500">ADMIN</span></span>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3">
                    <div className="mb-6">
                        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tổng quan</p>
                        <MenuItem id="dashboard" icon="dashboard" label="Dashboard" />
                        <MenuItem id="thongke" icon="insights" label="Thống kê & Báo cáo" />
                    </div>

                    <div className="mb-6">
                        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quản lý</p>
                        <MenuItem id="hoso" icon="people" label="Hồ sơ ứng viên" badge={stats.pending > 0 ? stats.pending : null} />
                        <MenuItem id="donhang" icon="work_outline" label="Đơn hàng" />

                    </div>

                    <div>
                        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hệ thống</p>
                        <MenuItem id="taikhoan" icon="manage_accounts" label="Tài khoản" />
                        <MenuItem id="cauhinh" icon="settings" label="Cài đặt" />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <img src="https://ui-avatars.com/api/?name=Admin&background=0d9488&color=fff" alt="Admin" className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="text-sm font-bold text-gray-800">Quản trị viên</p>
                            <p className="text-xs text-green-600 flex items-center gap-1">● Online</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-500"><span className="material-icons-outlined">menu</span></button>
                        <h2 className="text-xl font-bold text-gray-800 capitalize">{selectedMenu === 'dashboard' ? 'Tổng quan hệ thống' : selectedMenu}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <input type="text" placeholder="Tìm kiếm nhanh..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64 transition-all" />
                            <span className="material-icons-outlined absolute left-3 top-2 text-gray-400 text-lg">search</span>
                        </div>
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <span className="material-icons-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {loading ? (
                        <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
                    ) : selectedMenu === 'dashboard' ? (
                        <div className="space-y-6 animate-fade-in">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Tổng hồ sơ" value={stats.totalActive} unit="ứng viên" icon="people_alt" color="blue" />
                                <StatCard title="Hồ sơ mới" value={`+${stats.newToday}`} unit="hôm nay" icon="person_add" color="green" />
                                <StatCard title="Chờ duyệt" value={stats.pending} unit="hồ sơ" icon="pending_actions" color="yellow" />
                                <StatCard title="Doanh thu" value="1.2" unit="tỷ VNĐ" icon="payments" color="red" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Chart Placeholder */}
                                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-800 text-lg">Biểu đồ đăng ký tháng</h3>
                                        <select className="text-sm border-gray-300 rounded-md shadow-sm"><option>7 ngày qua</option><option>Tháng này</option></select>
                                    </div>
                                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300 text-gray-400 italic">
                                        [Biểu đồ thống kê sẽ hiển thị ở đây]
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-800 text-lg">Vừa đăng ký</h3>
                                        <Link to="/" className="text-sm text-primary-600 hover:underline">Xem tất cả</Link>
                                    </div>
                                    <div className="space-y-4">
                                        {recentProfiles.map(profile => (
                                            <div key={profile.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" onClick={() => navigate(`/ho-so/${profile.id}`)}>
                                                <img src={profile.anh_ho_so || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-800 truncate text-sm">{profile.ho_ten}</p>
                                                    <p className="text-xs text-gray-500 truncate">{profile.nganh_nghe_mong_muon || 'Chưa chọn ngành'} • {new Date(profile.created_at).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                                <span className="material-icons-outlined text-gray-400 text-sm">chevron_right</span>
                                            </div>
                                        ))}
                                        {recentProfiles.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu mới.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : selectedMenu === 'hoso' ? (
                        <HoSoManager />
                    ) : selectedMenu === 'donhang' ? (
                        <DonHangManager />
                    ) : (
                        <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center py-20">
                            <span className="material-icons-outlined text-6xl text-gray-300 mb-4">construction</span>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Chức năng đang xây dựng</h3>
                            <p className="text-gray-500">Vui lòng quay lại Dashboard hoặc chọn mục khác.</p>
                            <button onClick={() => setSelectedMenu('dashboard')} className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                                Quay về Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
