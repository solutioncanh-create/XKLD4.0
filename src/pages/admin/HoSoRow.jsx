import { Link } from 'react-router-dom'

export default function HoSoRow({ profile, index, colMode = 'match', orders = [], onCompanyChange, onMatch, navigate, onStatusChange, onJobChange }) {
    const JOB_CATEGORIES = ['Xây dựng', 'Thực phẩm', 'Cơ khí', 'May mặc', 'Nông nghiệp', 'Điều dưỡng', 'Vệ sinh tòa nhà', 'Khách sạn', 'IT/Kỹ sư', 'Khác']

    const avatarUrl = profile.anh_ho_so || (profile.gioi_tinh === 'Nữ'
        ? `https://avatar.iran.liara.run/public/girl?username=${profile.ho_ten}`
        : `https://avatar.iran.liara.run/public/boy?username=${profile.ho_ten}`)

    const age = profile.ngay_sinh ? (new Date().getFullYear() - new Date(profile.ngay_sinh).getFullYear()) : '?'

    return (
        <tr className="border-b border-gray-100 hover:bg-slate-50/60 transition-colors">
            {/* 0. Index */}
            <td style={{ paddingLeft: '1.1rem', color: '#cbd5e1', fontWeight: '700', fontSize: '0.72rem', width: '36px' }}>
                {index}
            </td>

            {/* 1. Avatar + Name */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="relative shrink-0 cursor-pointer" onClick={() => navigate(`/ho-so/${profile.id}`)}>
                        <img src={avatarUrl} alt={profile.ho_ten} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${profile.gioi_tinh === 'Nữ' ? 'bg-pink-400' : 'bg-blue-500'}`}></span>
                    </div>
                    <div>
                        <Link to={`/ho-so/${profile.id}`} className="font-bold text-gray-900 text-sm hover:text-emerald-600 block line-clamp-1">{profile.ho_ten}</Link>
                        <div className="text-xs text-gray-400 mt-0.5 flex flex-col gap-0.5 font-medium">
                            {profile.nickname && <span className="italic">({profile.nickname})</span>}
                            <span>{profile.tinh_trang_hon_nhan || profile.hon_nhan || '—'}</span>
                        </div>
                    </div>
                </div>
            </td>

            {/* 2. Info */}
            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{age} tuổi</span>
                    <span className="text-xs text-gray-400 truncate max-w-[160px]">{profile.que_quan || '—'}</span>
                </div>
            </td>

            {/* 3. Job (Editable dropdown) */}
            <td className="px-4 py-3">
                <div className="relative inline-flex items-center">
                    <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer text-sm text-gray-700 font-medium min-w-[130px]">
                        <span className="truncate block">{profile.nganh_nghe_mong_muon || 'Chọn ngành'}</span>
                        <span className="material-icons-outlined text-[18px] text-gray-400 shrink-0">expand_more</span>
                    </div>
                    <select
                        value={profile.nganh_nghe_mong_muon || ''}
                        onChange={(e) => onJobChange && onJobChange(profile.id, e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                        <option value="">Chưa chọn</option>
                        {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </td>

            {/* 4. Dynamic column based on colMode */}
            {colMode === 'match' && (
                <td className="px-4 py-3 text-center">
                    <button
                        onClick={() => onMatch(profile)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 font-bold text-xs transition-colors border border-emerald-100"
                        title="Ghép đơn hàng"
                    >
                        <span className="material-icons-outlined text-base">group_add</span>
                        Ghép
                    </button>
                </td>
            )}
            {colMode === 'status' && (
                <td className="px-4 py-3">
                    {(() => {
                        const STATUS_LIST = [
                            { value: 'Mới đăng ký', color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd' },
                            { value: 'Đã tư vấn', color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd' },
                            { value: 'Chờ phỏng vấn', color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
                            { value: 'Đã trúng tuyển', color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
                            { value: 'Đã xuất cảnh', color: '#0f172a', bg: '#f1f5f9', border: '#cbd5e1' },
                            { value: 'Hủy hồ sơ', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                        ]
                        const cur = STATUS_LIST.find(s => s.value === profile.trang_thai) || STATUS_LIST[0]
                        return (
                            <div className="relative inline-flex items-center">
                                <div
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all min-w-[140px]"
                                    style={{ background: cur.bg, borderColor: cur.border, color: cur.color }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
                                    <span className="flex-1 truncate">{cur.value}</span>
                                    <span className="material-icons-outlined shrink-0" style={{ fontSize: '14px', opacity: 0.5 }}>expand_more</span>
                                </div>
                                <select
                                    value={profile.trang_thai || ''}
                                    onChange={e => onStatusChange && onStatusChange(profile.id, e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                >
                                    {STATUS_LIST.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
                                </select>
                            </div>
                        )
                    })()}
                </td>
            )}
            {colMode === 'company' && (
                <td className="px-4 py-3">
                    <div className="relative inline-flex items-center">
                        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer text-xs font-semibold min-w-[180px]"
                            style={{
                                background: profile.cong_ty_trung_tuyen ? '#eff6ff' : '#f8fafc',
                                borderColor: profile.cong_ty_trung_tuyen ? '#bfdbfe' : '#e2e8f0',
                                color: profile.cong_ty_trung_tuyen ? '#1d4ed8' : '#94a3b8',
                            }}
                        >
                            <span className="material-icons-outlined" style={{ fontSize: '14px', flexShrink: 0 }}>business</span>
                            <span className="truncate flex-1">{profile.cong_ty_trung_tuyen || 'Chọn công ty...'}</span>
                            <span className="material-icons-outlined text-gray-400 shrink-0" style={{ fontSize: '16px' }}>expand_more</span>
                        </div>
                        <select
                            value={profile.cong_ty_trung_tuyen || ''}
                            onChange={e => onCompanyChange && onCompanyChange(profile.id, e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                            <option value="">— Chưa chọn —</option>
                            {orders.map(o => <option key={o.id} value={o.ten_don_hang}>{o.ten_don_hang}</option>)}
                        </select>
                    </div>
                </td>
            )}

            {/* 5. Actions */}
            <td className="px-4 py-3 text-right whitespace-nowrap">
                <button
                    onClick={() => navigate(`/ho-so/${profile.id}`)}
                    className="inline-flex items-center gap-1 text-gray-400 hover:text-blue-600 font-bold text-xs bg-gray-50 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors border border-gray-100 hover:border-blue-100"
                    title="Xem chi tiết"
                >
                    <span className="material-icons-outlined text-base">visibility</span>
                    Chi tiết
                </button>
            </td>
        </tr>
    )
}
