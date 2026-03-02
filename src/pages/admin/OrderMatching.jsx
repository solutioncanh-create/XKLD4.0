import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { hasPermission, Permissions } from '../../utils/auth'


export default function OrderMatching() {
    const [orders, setOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [loadingOrders, setLoadingOrders] = useState(false)

    const [matchedCandidates, setMatchedCandidates] = useState([])
    const [availableCandidates, setAvailableCandidates] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('list') // 'list' | 'add'
    const [loadingDetails, setLoadingDetails] = useState(false)

    const fetchOrders = useCallback(async () => {
        setLoadingOrders(true)
        try {
            const { data, error } = await supabase
                .from('don_hang')
                .select('*')
                .order('created_at', { ascending: false })
            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            console.error('Lỗi tải đơn hàng:', error)
        } finally {
            setLoadingOrders(false)
        }
    }, [])

    useEffect(() => { fetchOrders() }, [fetchOrders])

    const fetchMatchedCandidates = useCallback(async () => {
        if (!selectedOrder) return
        setLoadingDetails(true)
        try {
            const { data, error } = await supabase
                .from('lien_ket_don_hang_ho_so')
                .select(`
                    id, sbd, created_at,
                    ho_so:ho_so_id ( id, ho_ten, ngay_sinh, que_quan, anh_ho_so, nganh_nghe_mong_muon, so_dien_thoai )
                `)
                .eq('don_hang_id', selectedOrder.id)
                .order('sbd', { ascending: true })
            if (error) throw error
            setMatchedCandidates(data || [])
        } catch (error) {
            console.error('Lỗi tải danh sách ghép:', error)
            alert('Lỗi tải danh sách ghép: ' + error.message)
        } finally {
            setLoadingDetails(false)
        }
    }, [selectedOrder])

    const fetchAvailableCandidates = useCallback(async () => {
        if (!selectedOrder) return
        setLoadingDetails(true)
        try {
            const { data: matchedData, error: matchedError } = await supabase
                .from('lien_ket_don_hang_ho_so')
                .select('ho_so_id')
                .eq('don_hang_id', selectedOrder.id)
            if (matchedError) throw matchedError
            const matchedIds = matchedData.map(m => m.ho_so_id)

            // Only show candidates waiting for interview
            let query = supabase
                .from('ho_so')
                .select('*')
                .eq('trang_thai', 'Chờ phỏng vấn')
                .order('created_at', { ascending: false })
                .limit(100)

            if (searchTerm) query = query.ilike('ho_ten', `%${searchTerm}%`)

            const { data, error } = await query
            if (error) throw error

            setAvailableCandidates(data.filter(c => !matchedIds.includes(c.id)))
        } catch (error) {
            console.error('Lỗi tìm ứng viên:', error)
        } finally {
            setLoadingDetails(false)
        }
    }, [selectedOrder, searchTerm])

    useEffect(() => {
        if (selectedOrder) {
            setMatchedCandidates([])
            setAvailableCandidates([])
            fetchMatchedCandidates()
            if (activeTab === 'add') fetchAvailableCandidates()
        }
    }, [selectedOrder, activeTab, fetchMatchedCandidates, fetchAvailableCandidates])

    const handleAddCandidate = async (candidate) => {
        if (!selectedOrder) return
        try {
            let nextSBD = 1
            if (matchedCandidates.length > 0) {
                const max = Math.max(...matchedCandidates.map(m => parseInt(m.sbd || 0)))
                nextSBD = max + 1
            }
            const sbdString = nextSBD.toString().padStart(3, '0')

            const { error } = await supabase.from('lien_ket_don_hang_ho_so').insert([{
                don_hang_id: selectedOrder.id,
                ho_so_id: candidate.id,
                sbd: sbdString
            }])
            if (error) throw error

            await fetchMatchedCandidates()
            setAvailableCandidates(prev => prev.filter(c => c.id !== candidate.id))
        } catch (error) {
            alert('Lỗi thêm ứng viên: ' + error.message)
        }
    }

    const handleRemoveCandidate = async (linkId) => {
        if (!window.confirm('Xóa ứng viên này khỏi danh sách thi tuyển?')) return
        try {
            const { error } = await supabase.from('lien_ket_don_hang_ho_so').delete().eq('id', linkId)
            if (error) throw error
            await fetchMatchedCandidates()
            if (activeTab === 'add') fetchAvailableCandidates()
        } catch (error) {
            alert('Lỗi xóa: ' + error.message)
        }
    }

    const age = (ngaySinh) => ngaySinh ? (new Date().getFullYear() - new Date(ngaySinh).getFullYear()) : '—'

    return (
        <div className="admin-page" style={{ padding: '0.75rem 1.25rem 2rem' }}>
            <div style={{ display: 'flex', gap: '0.85rem', height: 'calc(100vh - 72px)' }}>

                {/* ── LEFT: Order list ── */}
                <div className="admin-panel" style={{ width: '255px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ padding: '0.6rem 0.9rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="material-icons-outlined" style={{ fontSize: '14px', color: '#059669' }}>list_alt</span>
                        <span style={{ fontWeight: '800', fontSize: '0.72rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1 }}>Đơn Hàng</span>
                        <span style={{ background: '#d1fae5', color: '#059669', fontSize: '0.6rem', fontWeight: '800', padding: '0.1rem 0.4rem', borderRadius: '20px', border: '1px solid #6ee7b7' }}>{orders.length}</span>
                    </div>
                    {/* List */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.35rem' }} className="no-scrollbar">
                        {loadingOrders ? (
                            <div className="admin-spinner-wrap"><div className="admin-spinner" /></div>
                        ) : orders.map(order => {
                            const isActive = selectedOrder?.id === order.id
                            return (
                                <div key={order.id} onClick={() => setSelectedOrder(order)}
                                    style={{
                                        padding: '0.5rem 0.65rem', borderRadius: '8px', cursor: 'pointer',
                                        border: isActive ? '1.5px solid #10b981' : '1.5px solid transparent',
                                        background: isActive ? '#f0fdf4' : 'transparent',
                                        marginBottom: '0.2rem', transition: 'all 0.12s',
                                    }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <div style={{ fontWeight: '700', fontSize: '0.76rem', color: isActive ? '#065f46' : '#0f172a', lineHeight: 1.3, marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.ten_don_hang}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.3rem' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{order.dia_diem_lam_viec}</span>
                                        <span style={{
                                            fontSize: '0.56rem', fontWeight: '800', padding: '0.1rem 0.35rem', borderRadius: '20px', flexShrink: 0,
                                            color: order.trang_thai === 'Đang tuyển' ? '#059669' : '#64748b',
                                            background: order.trang_thai === 'Đang tuyển' ? '#d1fae5' : '#f1f5f9',
                                        }}>{order.trang_thai}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ── RIGHT: Detail ── */}
                <div className="admin-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                    {!selectedOrder ? (
                        <div className="admin-empty" style={{ flex: 1 }}>
                            <span className="material-icons-outlined" style={{ fontSize: '2.5rem', color: '#e2e8f0' }}>touch_app</span>
                            <p style={{ fontWeight: '600', color: '#94a3b8', fontSize: '0.82rem' }}>Chọn một đơn hàng để bắt đầu ghép ứng viên</p>
                        </div>
                    ) : (<>
                        {/* Compact header */}
                        <div style={{ padding: '0.55rem 1rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: '800', fontSize: '0.86rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedOrder.ten_don_hang}</div>
                                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.12rem', fontSize: '0.68rem', color: '#64748b' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><span className="material-icons-outlined" style={{ fontSize: '11px' }}>place</span>{selectedOrder.dia_diem_lam_viec}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><span className="material-icons-outlined" style={{ fontSize: '11px' }}>payments</span>{parseInt(selectedOrder.muc_luong || 0).toLocaleString()}¥</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><span className="material-icons-outlined" style={{ fontSize: '11px' }}>group</span>Tuyển: {selectedOrder.so_luong_tuyen}</span>
                                </div>
                            </div>
                            {hasPermission(Permissions.PRINT_EXPORT) && (
                                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                    {[
                                        { to: `/print-candidate-list/${selectedOrder.id}`, icon: 'list_alt', label: 'In DS', activeColor: '#2563eb', activeBg: '#eff6ff', activeBorder: '#bfdbfe' },
                                        { to: `/batch-print-profiles/${selectedOrder.id}`, icon: 'folder_shared', label: 'In HS (JP)', activeColor: '#059669', activeBg: '#f0fdf4', activeBorder: '#6ee7b7' },
                                    ].map(btn => (
                                        <Link key={btn.to} to={btn.to} target="_blank" style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                            padding: '0.3rem 0.65rem', borderRadius: '7px', fontSize: '0.7rem', fontWeight: '700',
                                            textDecoration: 'none', transition: 'all 0.12s',
                                            background: matchedCandidates.length === 0 ? '#f1f5f9' : btn.activeBg,
                                            color: matchedCandidates.length === 0 ? '#cbd5e1' : btn.activeColor,
                                            border: `1px solid ${matchedCandidates.length === 0 ? '#e2e8f0' : btn.activeBorder}`,
                                            pointerEvents: matchedCandidates.length === 0 ? 'none' : 'auto',
                                        }}>
                                            <span className="material-icons-outlined" style={{ fontSize: '13px' }}>{btn.icon}</span>{btn.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9' }}>
                            {[
                                { key: 'list', label: 'Danh sách phỏng vấn', icon: 'format_list_bulleted', count: matchedCandidates.length },
                                { key: 'add', label: 'Thêm ứng viên', icon: 'person_add' },
                            ].map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                    padding: '0.5rem 1rem 0.55rem', border: 'none', background: 'none',
                                    fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer',
                                    borderBottom: activeTab === tab.key ? '2px solid #059669' : '2px solid transparent',
                                    color: activeTab === tab.key ? '#059669' : '#94a3b8',
                                    marginBottom: '-2px', transition: 'color 0.12s',
                                }}>
                                    <span className="material-icons-outlined" style={{ fontSize: '14px' }}>{tab.icon}</span>
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span style={{
                                            background: activeTab === tab.key ? '#d1fae5' : '#f1f5f9',
                                            color: activeTab === tab.key ? '#059669' : '#94a3b8',
                                            fontSize: '0.6rem', fontWeight: '800', padding: '0.1rem 0.4rem',
                                            borderRadius: '20px', border: `1px solid ${activeTab === tab.key ? '#6ee7b7' : '#e2e8f0'}`,
                                        }}>{tab.count}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.65rem', background: '#f8fafc', position: 'relative' }} className="no-scrollbar">
                            {loadingDetails && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="admin-spinner" />
                                </div>
                            )}

                            {/* Tab: Danh sách phỏng vấn */}
                            {activeTab === 'list' && (
                                <div className="admin-panel">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'center', width: '48px' }}>SBD</th>
                                                <th style={{ width: '36px' }}></th>
                                                <th>Họ Tên</th>
                                                <th style={{ textAlign: 'center', width: '55px' }}>Tuổi</th>
                                                <th>Quê Quán</th>
                                                <th style={{ width: '40px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {matchedCandidates.length === 0 ? (
                                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#cbd5e1', fontSize: '0.8rem' }}>Chưa có ứng viên nào.</td></tr>
                                            ) : matchedCandidates.map(item => (
                                                <tr key={item.id}>
                                                    <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: '800', color: '#059669', fontSize: '0.82rem' }}>{item.sbd}</td>
                                                    <td style={{ padding: '0.4rem 0.4rem' }}>
                                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {item.ho_so?.anh_ho_so
                                                                ? <img src={item.ho_so.anh_ho_so} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                : <span className="material-icons-outlined" style={{ fontSize: '16px', color: '#cbd5e1' }}>person</span>
                                                            }
                                                        </div>
                                                    </td>
                                                    <td style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.82rem' }}>
                                                        {item.ho_so ? item.ho_so.ho_ten : <span style={{ color: '#f87171', fontStyle: 'italic' }}>Dữ liệu lỗi</span>}
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '0.8rem', color: '#64748b' }}>{age(item.ho_so?.ngay_sinh)}</td>
                                                    <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.ho_so?.que_quan || '—'}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button onClick={() => handleRemoveCandidate(item.id)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: '3px', borderRadius: '5px', display: 'flex', alignItems: 'center' }}
                                                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                                            onMouseLeave={e => e.currentTarget.style.color = '#fca5a5'}
                                                            title="Xóa khỏi danh sách"
                                                        >
                                                            <span className="material-icons-outlined" style={{ fontSize: '16px' }}>cancel</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Tab: Thêm ứng viên */}
                            {activeTab === 'add' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <span className="material-icons-outlined" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: '#cbd5e1' }}>search</span>
                                        <input
                                            style={{ width: '100%', paddingLeft: '2.1rem', paddingRight: '1rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'inherit', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
                                            placeholder="Tìm ứng viên theo tên... (Enter để tìm)"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && fetchAvailableCandidates()}
                                            onFocus={e => e.target.style.borderColor = '#10b981'}
                                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                    <div className="admin-panel">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '34px' }}></th>
                                                    <th>Họ Tên</th>
                                                    <th>Quê quán / Ngành</th>
                                                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {availableCandidates.length === 0 ? (
                                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: '#cbd5e1', fontSize: '0.8rem' }}>Không có ứng viên nào ở trạng thái Chờ phỏng vấn.</td></tr>
                                                ) : availableCandidates.map(c => (
                                                    <tr key={c.id}>
                                                        <td style={{ padding: '0.4rem 0.4rem' }}>
                                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {c.anh_ho_so
                                                                    ? <img src={c.anh_ho_so} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                    : <span className="material-icons-outlined" style={{ fontSize: '16px', color: '#cbd5e1' }}>person</span>
                                                                }
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#0f172a' }}>{c.ho_ten}</div>
                                                            <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>{age(c.ngay_sinh)} tuổi</div>
                                                        </td>
                                                        <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                            <div>{c.que_quan || '—'}</div>
                                                            <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>{c.nganh_nghe_mong_muon || 'LĐPT'}</div>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button onClick={() => handleAddCandidate(c)} className="admin-btn-primary" style={{ height: '28px', fontSize: '0.7rem', padding: '0 0.6rem' }}>
                                                                <span className="material-icons-outlined" style={{ fontSize: '13px' }}>add</span>Chọn
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>)}
                </div>
            </div>
        </div>
    )
}
