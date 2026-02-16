import { Link } from 'react-router-dom'

export default function HoSoRow({ profile, onMatch, onDelete, onSmartAction, navigate }) {
    const statusConfig = {
        'Mới đăng ký': { color: 'bg-green-50 text-green-700 ring-green-500', icon: 'new_releases' },
        'Đã tư vấn': { color: 'bg-yellow-50 text-yellow-700 ring-yellow-500', icon: 'support_agent' },
        'Đợi đơn': { color: 'bg-yellow-50 text-yellow-700 ring-yellow-500', icon: 'hourglass_empty' },
        'Chờ tư vấn': { color: 'bg-yellow-50 text-yellow-700 ring-yellow-500', icon: 'hourglass_top' },
        'Chờ phỏng vấn': { color: 'bg-purple-50 text-purple-700 ring-purple-500', icon: 'contact_page' },
        'Đã trúng tuyển': { color: 'bg-rose-50 text-rose-700 ring-rose-500', icon: 'celebration' },
        'Đỗ đơn': { color: 'bg-rose-50 text-rose-700 ring-rose-500', icon: 'celebration' },
        'Đã xuất cảnh': { color: 'bg-blue-50 text-blue-700 ring-blue-500', icon: 'flight_takeoff' },
        'Hủy hồ sơ': { color: 'bg-gray-100 text-gray-600 ring-gray-400', icon: 'cancel' },
        'Rút đơn': { color: 'bg-gray-100 text-gray-600 ring-gray-400', icon: 'cancel' }
    }

    const config = statusConfig[profile.trang_thai] || { color: 'bg-gray-50 text-gray-600 ring-gray-400', icon: 'info' }

    const avatarUrl = profile.anh_ho_so || (profile.gioi_tinh === 'Nữ'
        ? `https://avatar.iran.liara.run/public/girl?username=${profile.ho_ten}`
        : `https://avatar.iran.liara.run/public/boy?username=${profile.ho_ten}`)

    const age = profile.ngay_sinh ? (new Date().getFullYear() - new Date(profile.ngay_sinh).getFullYear()) : '?'

    // Smart Action Logic
    const getSmartAction = () => {
        const status = profile.trang_thai || ''
        if (status === 'Mới đăng ký') return { label: 'Đã Tư Vấn', icon: 'check', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' }
        if (status === 'Đã tư vấn' || status === 'Đợi đơn') return { label: 'Ghép Đơn', icon: 'fact_check', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' }
        if (status === 'Chờ phỏng vấn') return { label: 'Báo Đỗ', icon: 'emoji_events', color: 'bg-rose-100 text-rose-700 hover:bg-rose-200' }
        if (status === 'Đã trúng tuyển' || status === 'Đỗ đơn') return { label: 'Xuất Cảnh', icon: 'flight_takeoff', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' }
        return null
    }

    const smartAction = getSmartAction()

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
            {/* 1. Avatar + Name */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="relative shrink-0 cursor-pointer" onClick={() => navigate(`/ho-so/${profile.id}`)}>
                        <img src={avatarUrl} alt={profile.ho_ten} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${profile.gioi_tinh === 'Nữ' ? 'bg-pink-400' : 'bg-blue-500'}`}></span>
                    </div>
                    <div>
                        <Link to={`/ho-so/${profile.id}`} className="font-bold text-gray-900 text-sm hover:text-primary-600 block line-clamp-1">{profile.ho_ten}</Link>
                        {profile.nickname && <span className="text-xs text-gray-400 italic">({profile.nickname})</span>}
                    </div>
                </div>
            </td>

            {/* 2. Info */}
            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{age} tuổi</span>
                    <span className="text-xs text-gray-400">{profile.que_quan}</span>
                </div>
            </td>

            {/* 3. Job */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-sm text-gray-700 max-w-[150px]" title={profile.nganh_nghe_mong_muon}>
                    <span className="material-icons-outlined text-gray-400 text-sm">engineering</span>
                    <span className="truncate">{profile.nganh_nghe_mong_muon || 'Chưa chọn'}</span>
                </div>
            </td>

            {/* 4. Status */}
            <td className="px-4 py-3">
                <div className={`inline-flex items-center gap-1.5 text-xs font-bold ${config.color.split(' ').find(c => c.startsWith('text-')) || 'text-gray-600'}`} title="Trạng thái hiện tại">
                    <span className="material-icons-outlined text-sm leading-none">{config.icon}</span>
                    <span className="whitespace-nowrap">{profile.trang_thai || 'Mới'}</span>
                </div>
            </td>

            {/* 5. Actions */}
            <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate(`/ho-so/${profile.id}`)}
                        className="flex items-center gap-1 text-gray-400 hover:text-blue-600 font-bold text-xs bg-gray-50 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors"
                        title="Xem chi tiết"
                    >
                        <span className="material-icons-outlined text-base">visibility</span>
                        Chi tiết
                    </button>

                </div>
            </td>
        </tr>
    )
}
