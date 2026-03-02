import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'
import HoSoRow from './HoSoRow'

export default function HoSoManager() {
    const [profiles, setProfiles] = useState([])
    const [loadingList, setLoadingList] = useState(false)
    const [activeTab, setActiveTab] = useState('Mới đăng ký')
    const navigate = useNavigate()

    // Match Modal
    const [showMatchModal, setShowMatchModal] = useState(false)
    const [selectedProfile, setSelectedProfile] = useState(null)
    const [activeOrders, setActiveOrders] = useState([])
    const [loadingOrders, setLoadingOrders] = useState(false)
    const [allOrders, setAllOrders] = useState([])

    useEffect(() => { fetchProfiles(); fetchAllOrders() }, [])

    const fetchAllOrders = async () => {
        try {
            const { data } = await supabase.from('don_hang').select('id, ten_don_hang').order('ten_don_hang', { ascending: true })
            setAllOrders(data || [])
        } catch (e) { console.error(e) }
    }

    const fetchProfiles = async () => {
        setLoadingList(true)
        try {
            const { data, error } = await supabase.from('ho_so').select('*, nickname').order('created_at', { ascending: false })
            if (error) throw error
            setProfiles(data || [])
        } catch (error) { console.error(error) }
        finally { setLoadingList(false) }
    }

    const openMatchModal = async (profile) => {
        setSelectedProfile(profile); setShowMatchModal(true); setLoadingOrders(true)
        try {
            const { data, error } = await supabase.from('don_hang').select('*').eq('trang_thai', 'Đang tuyển').order('created_at', { ascending: false })
            if (error) throw error
            setActiveOrders(data || [])
        } catch (error) { alert('Lỗi tải danh sách đơn hàng: ' + error.message) }
        finally { setLoadingOrders(false) }
    }

    const handleMatchOrder = async (order) => {
        if (!selectedProfile) return
        if (!confirm(`Xác nhận ghép ứng viên ${selectedProfile.ho_ten} vào đơn hàng ${order.ten_don_hang}?`)) return
        try {
            const { data: existingLinks } = await supabase.from('lien_ket_don_hang_ho_so').select('sbd').eq('don_hang_id', order.id)
            let nextSBD = 1
            if (existingLinks && existingLinks.length > 0) {
                const max = Math.max(...existingLinks.map(l => parseInt(l.sbd) || 0))
                nextSBD = max + 1
            }
            const sbdString = nextSBD.toString().padStart(3, '0')
            const { error: linkError } = await supabase.from('lien_ket_don_hang_ho_so').insert({ don_hang_id: order.id, ho_so_id: selectedProfile.id, sbd: sbdString })
            if (linkError) {
                if (linkError.code === '23505') { alert('Ứng viên này đã được ghép vào đơn hàng này rồi!'); return }
                throw linkError
            }
            const { error: updateError } = await supabase.from('ho_so').update({ trang_thai: 'Chờ phỏng vấn' }).eq('id', selectedProfile.id)
            if (updateError) throw updateError
            alert(`Ghép đơn thành công! SBD: ${sbdString}`)
            setProfiles(prev => prev.map(p => p.id === selectedProfile.id ? { ...p, trang_thai: 'Chờ phỏng vấn' } : p))
            setShowMatchModal(false)
        } catch (error) { console.error(error); alert('Lỗi ghép đơn: ' + error.message) }
    }

    const getNormalizedStatus = (status) => {
        if (status === 'Đợi đơn' || status === 'Chờ tư vấn') return 'Đã tư vấn'
        if (status === 'Đỗ đơn') return 'Đã trúng tuyển'
        if (status === 'Rút đơn') return 'Hủy hồ sơ'
        return status || 'Mới đăng ký'
    }

    const STATUS_ORDER = ['Mới đăng ký', 'Đã tư vấn', 'Chờ phỏng vấn', 'Đã trúng tuyển', 'Đã xuất cảnh', 'Hủy hồ sơ']
    const filteredByTab = profiles.filter(p => getNormalizedStatus(p.trang_thai) === activeTab)
    const tabCount = (status) => profiles.filter(p => getNormalizedStatus(p.trang_thai) === status).length

    const updateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase.from('ho_so').update({ trang_thai: newStatus }).eq('id', id)
            if (error) throw error
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, trang_thai: newStatus } : p))
        } catch (error) { alert('Lỗi cập nhật trạng thái: ' + error.message) }
    }

    const updateJob = async (id, newJob) => {
        try {
            const { error } = await supabase.from('ho_so').update({ nganh_nghe_mong_muon: newJob }).eq('id', id)
            if (error) throw error
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, nganh_nghe_mong_muon: newJob } : p))
        } catch (error) { alert('Lỗi cập nhật ngành nghề: ' + error.message) }
    }

    const handleSmartAction = async (profile) => {
        const status = getNormalizedStatus(profile.trang_thai)
        switch (status) {
            case 'Mới đăng ký':
                if (window.confirm(`Xác nhận đã tư vấn xong cho ứng viên ${profile.ho_ten}?`)) await updateStatus(profile.id, 'Đã tư vấn')
                break
            case 'Đã tư vấn': openMatchModal(profile); break
            case 'Chờ phỏng vấn':
                if (window.confirm(`Xác nhận ứng viên ${profile.ho_ten} đã trúng tuyển?`)) await updateStatus(profile.id, 'Đã trúng tuyển')
                break
            case 'Đã trúng tuyển':
                if (window.confirm(`Xác nhận ứng viên ${profile.ho_ten} đã xuất cảnh?`)) await updateStatus(profile.id, 'Đã xuất cảnh')
                break
            default: break
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa hồ sơ này?')) return
        try {
            const { error } = await supabase.from('ho_so').delete().eq('id', id)
            if (error) throw error
            setProfiles(profiles.filter(p => p.id !== id))
        } catch (error) { alert('Lỗi xóa: ' + error.message) }
    }

    const updateCompany = async (id, companyName) => {
        try {
            const { error } = await supabase.from('ho_so').update({ cong_ty_trung_tuyen: companyName }).eq('id', id)
            if (error) throw error
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, cong_ty_trung_tuyen: companyName } : p))
        } catch (error) { alert('Lỗi cập nhật công ty: ' + error.message) }
    }

    const TAB_CONFIG = {
        'Mới đăng ký': { color: '#059669', bg: '#d1fae5', border: '#6ee7b7', icon: 'fiber_new' },
        'Đã tư vấn': { color: '#d97706', bg: '#fef3c7', border: '#fcd34d', icon: 'support_agent' },
        'Chờ phỏng vấn': { color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd', icon: 'pending' },
        'Đã trúng tuyển': { color: '#db2777', bg: '#fce7f3', border: '#f9a8d4', icon: 'check_circle' },
        'Đã xuất cảnh': { color: '#2563eb', bg: '#dbeafe', border: '#93c5fd', icon: 'flight_takeoff' },
        'Hủy hồ sơ': { color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', icon: 'cancel' },
    }
    const cfg = TAB_CONFIG[activeTab] || TAB_CONFIG['Mới đăng ký']

    return (
        <div className="admin-page" style={{ paddingTop: '0' }}>

            {/* ── Tab bar ── */}
            <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '2px solid #e2e8f0', background: '#ffffff', overflowX: 'auto', paddingTop: '0.6rem', marginBottom: '1.25rem' }} className="no-scrollbar">
                {/* Add button */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.85rem 0.6rem', borderRight: '1px solid #f1f5f9', marginRight: '0.25rem', flexShrink: 0 }}>
                    <button
                        onClick={() => navigate('/admin/ho-so/them-moi')}
                        className="admin-btn-primary"
                        style={{ height: '32px', fontSize: '0.73rem', padding: '0 0.75rem' }}>
                        <span className="material-icons-outlined" style={{ fontSize: '15px' }}>add</span>
                        Thêm mới
                    </button>
                </div>
                {/* Status tabs */}
                {STATUS_ORDER.map(status => {
                    const tcfg = TAB_CONFIG[status]; const count = tabCount(status); const isActive = activeTab === status
                    return (
                        <button key={status} onClick={() => setActiveTab(status)} style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem 0.65rem',
                            border: 'none', borderBottom: isActive ? `2.5px solid ${tcfg.color}` : '2.5px solid transparent',
                            background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.77rem',
                            fontWeight: isActive ? '800' : '600', color: isActive ? tcfg.color : '#94a3b8',
                            whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0, marginBottom: '-2px',
                        }}>
                            <span className="material-icons-outlined" style={{ fontSize: '14px' }}>{tcfg.icon}</span>
                            {status}
                            <span style={{
                                minWidth: '18px', height: '18px', padding: '0 5px', borderRadius: '20px',
                                fontSize: '0.6rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                background: isActive ? tcfg.bg : '#f1f5f9', color: isActive ? tcfg.color : '#94a3b8',
                                border: `1px solid ${isActive ? tcfg.border : '#e2e8f0'}`, transition: 'all 0.15s',
                            }}>{count}</span>
                        </button>
                    )
                })}
            </div>

            {/* ── Tab content ── */}
            {loadingList ? (
                <div className="admin-spinner-wrap"><div className="admin-spinner" /></div>
            ) : filteredByTab.length === 0 ? (
                <div className="admin-panel admin-empty" style={{ minHeight: '260px' }}>
                    <span className="material-icons-outlined" style={{ fontSize: '2.5rem', color: cfg.border }}>{cfg.icon}</span>
                    <p style={{ fontWeight: '600', color: '#64748b' }}>
                        Chưa có hồ sơ nào ở trạng thái <strong style={{ color: cfg.color }}>{activeTab}</strong>
                    </p>
                    <button onClick={() => navigate('/admin/ho-so/them-moi')} className="admin-btn-primary" style={{ marginTop: '0.75rem', height: '34px', fontSize: '0.75rem' }}>
                        <span className="material-icons-outlined" style={{ fontSize: '15px' }}>add</span>
                        Thêm hồ sơ mới
                    </button>
                </div>
            ) : (
                <>
                    {/* Mobile cards */}
                    <div className="md:hidden grid grid-cols-1 gap-3">
                        {filteredByTab.map(p => (
                            <HoSoCard key={p.id} profile={p} onMatch={() => openMatchModal(p)} onDelete={handleDelete} onSmartAction={handleSmartAction} navigate={navigate} />
                        ))}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block admin-panel">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1.1rem', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="material-icons-outlined" style={{ fontSize: '16px', color: cfg.color }}>{cfg.icon}</span>
                                <span style={{ fontWeight: '800', fontSize: '0.78rem', color: cfg.color }}>{activeTab}</span>
                                <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: '0.62rem', fontWeight: '800', padding: '0.15rem 0.55rem', borderRadius: '20px' }}>{filteredByTab.length} hồ sơ</span>
                            </div>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '36px', paddingLeft: '1.1rem' }}>#</th>
                                    <th>Ứng Viên</th>
                                    <th>Thông Tin</th>
                                    <th>Nguyện Vọng</th>
                                    {activeTab === 'Đã xuất cảnh' && <th>Công Ty Trúng Tuyển</th>}
                                    {activeTab === 'Mới đăng ký' && <th>Cập Nhật Trạng Thái</th>}
                                    {activeTab !== 'Đã xuất cảnh' && activeTab !== 'Mới đăng ký' && <th style={{ textAlign: 'center' }}>Ghép Đơn</th>}
                                    <th style={{ textAlign: 'right' }}>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredByTab.map((p, idx) => (
                                    <HoSoRow
                                        key={p.id} profile={p} index={idx + 1}
                                        colMode={activeTab === 'Đã xuất cảnh' ? 'company' : activeTab === 'Mới đăng ký' ? 'status' : 'match'}
                                        orders={allOrders} onCompanyChange={updateCompany}
                                        onMatch={() => openMatchModal(p)} onDelete={handleDelete}
                                        onSmartAction={handleSmartAction} navigate={navigate}
                                        onStatusChange={updateStatus} onJobChange={updateJob}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ── Match Modal ── */}
            {showMatchModal && (
                <div className="admin-modal-overlay" onClick={() => setShowMatchModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div>
                                <p className="admin-modal-title">Ghép Đơn Hàng</p>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Chọn đơn hàng cho <strong style={{ color: '#059669' }}>{selectedProfile?.ho_ten}</strong></p>
                            </div>
                            <button onClick={() => setShowMatchModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: '4px' }}>
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            {loadingOrders ? (
                                <div className="admin-spinner-wrap"><div className="admin-spinner" /></div>
                            ) : activeOrders.length === 0 ? (
                                <div className="admin-empty">
                                    <span className="material-icons-outlined" style={{ fontSize: '2rem' }}>work_off</span>
                                    <p>Không có đơn hàng nào đang tuyển.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {activeOrders.map(order => (
                                        <div key={order.id} onClick={() => handleMatchOrder(order)}
                                            style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem 1rem', cursor: 'pointer', transition: 'all 0.15s' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#f0fdf4' }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                                                <h4 style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>{order.ten_don_hang}</h4>
                                                <span className="admin-badge" style={{ color: '#059669', background: '#d1fae5', borderColor: '#a7f3d0' }}>Tuyển ({order.so_luong_tuyen})</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                                                <span><span className="material-icons-outlined" style={{ fontSize: '13px', verticalAlign: 'middle' }}>place</span> {order.dia_diem_lam_viec}</span>
                                                <span><span className="material-icons-outlined" style={{ fontSize: '13px', verticalAlign: 'middle' }}>payments</span> {order.muc_luong}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function HoSoCard({ profile, navigate }) {
    const avatarUrl = profile.anh_ho_so || (profile.gioi_tinh === 'Nữ'
        ? `https://avatar.iran.liara.run/public/girl?username=${profile.ho_ten}`
        : `https://avatar.iran.liara.run/public/boy?username=${profile.ho_ten}`)
    const age = profile.ngay_sinh ? (new Date().getFullYear() - new Date(profile.ngay_sinh).getFullYear()) : '?'

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="relative shrink-0 cursor-pointer" onClick={() => navigate(`/ho-so/${profile.id}`)}>
                        <img src={avatarUrl} alt={profile.ho_ten} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${profile.gioi_tinh === 'Nữ' ? 'bg-pink-400' : 'bg-blue-500'}`}></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-1 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/ho-so/${profile.id}`)}>{profile.ho_ten}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span>{age}t</span>
                            {profile.que_quan && (<><span>•</span><span className="truncate max-w-[100px]">{profile.que_quan}</span></>)}
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-2 mb-4 pl-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="material-icons-outlined text-gray-400 text-[16px]">work_outline</span>
                    <span className="font-medium text-gray-800">{profile.nganh_nghe_mong_muon || 'Chưa chọn ngành'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="material-icons-outlined text-gray-400 text-[16px]">phone</span>
                    <a href={`tel:${profile.so_dien_thoai}`} className="font-mono hover:text-blue-600">{profile.so_dien_thoai}</a>
                </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
                <a href={`tel:${profile.so_dien_thoai}`} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors bg-gray-50 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                    <span className="material-icons-outlined text-[16px]">call</span>Gọi điện
                </a>
                <button onClick={() => navigate(`/ho-so/${profile.id}`)} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                    <span className="material-icons-outlined text-[16px]">visibility</span>Xem
                </button>
            </div>
        </div>
    )
}
