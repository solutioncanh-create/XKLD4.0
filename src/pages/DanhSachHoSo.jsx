import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

export default function DanhSachHoSo() {
    const [hoSoList, setHoSoList] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchHoSo()
    }, [])

    const fetchHoSo = async () => {
        try {
            const { data, error } = await supabase
                .from('ho_so')
                .select(`
                    id,
                    ho_ten,
                    ngay_sinh,
                    gioi_tinh,
                    so_dien_thoai,
                    nganh_nghe_mong_muon,
                    trang_thai,
                    created_at
                `)
                .order('id', { ascending: false })

            if (error) throw error
            setHoSoList(data)
        } catch (error) {
            alert('Lỗi tải danh sách: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredList = hoSoList.filter(hoso =>
        hoso.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (hoso.so_dien_thoai && hoso.so_dien_thoai.includes(searchTerm))
    )

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
            try {
                const { error } = await supabase.from('ho_so').delete().eq('id', id)
                if (error) throw error
                fetchHoSo()
            } catch (error) {
                alert('Lỗi xóa: ' + error.message)
            }
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Danh Sách Ứng Viên</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Tổng hợp toàn bộ hồ sơ đăng ký xuất khẩu lao động.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex gap-4">
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc SĐT..."
                        className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Link
                        to="/dang-ky"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Thêm Hồ Sơ Mới
                    </Link>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Họ Tên</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Giới Tính</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SĐT</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ngành Nghề</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Trạng Thái</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Thao tác</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-sm text-gray-500">Đang tải dữ liệu...</td>
                                        </tr>
                                    ) : filteredList.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-sm text-gray-500">
                                                {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có hồ sơ nào.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredList.map((hoso) => (
                                            <tr key={hoso.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{hoso.ho_ten}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{hoso.gioi_tinh}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{hoso.so_dien_thoai}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{hoso.nganh_nghe_mong_muon}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${hoso.trang_thai === 'Mới đăng ký' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {hoso.trang_thai}
                                                    </span>
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-3">
                                                    <Link
                                                        to={`/ho-so/${hoso.id}`}
                                                        className="text-primary-600 hover:text-primary-900 font-semibold"
                                                    >
                                                        Chi tiết
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(hoso.id)}
                                                        className="text-red-600 hover:text-red-900 hover:bg-red-50 px-2 py-1 rounded"
                                                    >
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
