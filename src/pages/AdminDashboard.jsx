import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import {
    Users, Briefcase, UserPlus, TrendingUp, TrendingDown,
    ArrowRight, Activity, Clock, ChevronRight, Zap,
    BarChart2, CheckCircle, Globe, GitMerge
} from 'lucide-react'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({ total: 0, newToday: 0, pendingInterview: 0, passed: 0, orders: 0, activeOrders: 0 })
    const [recentProfiles, setRecentProfiles] = useState([])
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchDashboardData() }, [])

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            const today = new Date().toISOString().split('T')[0]
            const [
                { count: totalCount },
                { count: newCount },
                { count: interviewCount },
                { count: passedCount },
                { count: ordersCount },
                { count: activeOrdersCount },
                { data: recent },
                { data: recentOrd }
            ] = await Promise.all([
                supabase.from('ho_so').select('*', { count: 'exact', head: true }),
                supabase.from('ho_so').select('*', { count: 'exact', head: true }).gte('created_at', today),
                supabase.from('ho_so').select('*', { count: 'exact', head: true }).eq('trang_thai', 'Chờ phỏng vấn'),
                supabase.from('ho_so').select('*', { count: 'exact', head: true }).in('trang_thai', ['Đã trúng tuyển', 'Đỗ đơn']),
                supabase.from('don_hang').select('*', { count: 'exact', head: true }),
                supabase.from('don_hang').select('*', { count: 'exact', head: true }).eq('trang_thai', 'Đang tuyển'),
                supabase.from('ho_so').select('id, ho_ten, anh_ho_so, trang_thai, nganh_nghe_mong_muon, created_at, gioi_tinh').order('created_at', { ascending: false }).limit(6),
                supabase.from('don_hang').select('id, ten_don_hang, trang_thai, nganh_nghe, so_luong_tuyen, created_at').order('created_at', { ascending: false }).limit(4)
            ])
            setStats({
                total: totalCount || 0, newToday: newCount || 0,
                pendingInterview: interviewCount || 0, passed: passedCount || 0,
                orders: ordersCount || 0, activeOrders: activeOrdersCount || 0
            })
            setRecentProfiles(recent || [])
            setRecentOrders(recentOrd || [])
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const STATUS_MAP = {
        'Mới đăng ký': { color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
        'Đã tư vấn': { color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
        'Chờ phỏng vấn': { color: '#7c3aed', bg: '#ede9fe', border: '#ddd6fe' },
        'Đã trúng tuyển': { color: '#db2777', bg: '#fce7f3', border: '#fbcfe8' },
        'Đã xuất cảnh': { color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe' },
        'Hủy hồ sơ': { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0' },
    }
    const ORDER_MAP = {
        'Đang tuyển': { color: '#059669', bg: '#d1fae5' },
        'Mới đăng': { color: '#2563eb', bg: '#dbeafe' },
        'Sắp hết hạn': { color: '#d97706', bg: '#fef3c7' },
        'Đã đóng': { color: '#64748b', bg: '#f1f5f9' },
    }

    const getS = (status) => STATUS_MAP[status] || { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0' }
    const getO = (status) => ORDER_MAP[status] || { color: '#64748b', bg: '#f1f5f9' }

    const timeAgo = (d) => {
        const m = Math.floor((Date.now() - new Date(d)) / 60000)
        if (m < 60) return `${m || 1} phút trước`
        const h = Math.floor(m / 60)
        if (h < 24) return `${h} giờ trước`
        return `${Math.floor(h / 24)} ngày trước`
    }

    if (loading) return (
        <div className="admd-loading">
            <div className="admd-spinner" />
            <p>Đang tải dữ liệu...</p>
        </div>
    )

    return (
        <div className="admd-root">
            {/* Header */}
            <div className="admd-page-header">
                <div>
                    <div className="admd-header-badge">
                        <Activity size={11} />
                        Hệ thống đang hoạt động
                    </div>
                    <h1 className="admd-title">Tổng quan hệ thống</h1>
                    <p className="admd-subtitle">Xin chào! Dưới đây là tóm tắt hoạt động hôm nay.</p>
                </div>
                <button onClick={fetchDashboardData} className="admd-refresh-btn">
                    <Activity size={14} />
                    Làm mới
                </button>
            </div>

            {/* KPI Grid */}
            <div className="admd-kpi-grid">
                <KpiCard icon={<Users size={20} />} label="Tổng hồ sơ" value={stats.total} unit="ứng viên" accent="#10b981" accentLight="#d1fae5" trend="+12%" trendUp onClick={() => navigate('/admin/ho-so')} />
                <KpiCard icon={<UserPlus size={20} />} label="Đăng ký hôm nay" value={stats.newToday} unit="mới" accent="#3b82f6" accentLight="#dbeafe" trend={`+${stats.newToday}`} trendUp={stats.newToday > 0} onClick={() => navigate('/admin/ho-so')} />
                <KpiCard icon={<Clock size={20} />} label="Chờ phỏng vấn" value={stats.pendingInterview} unit="hồ sơ" accent="#7c3aed" accentLight="#ede9fe" trend="Cần xử lý" neutral onClick={() => navigate('/admin/ho-so')} />
                <KpiCard icon={<CheckCircle size={20} />} label="Đã trúng tuyển" value={stats.passed} unit="người" accent="#db2777" accentLight="#fce7f3" trend="+5%" trendUp onClick={() => navigate('/admin/ho-so')} />
                <KpiCard icon={<Briefcase size={20} />} label="Tổng đơn hàng" value={stats.orders} unit="đơn" accent="#f59e0b" accentLight="#fef3c7" trend="Tổng cộng" neutral onClick={() => navigate('/admin/don-hang')} />
                <KpiCard icon={<Zap size={20} />} label="Đang tuyển dụng" value={stats.activeOrders} unit="đơn mở" accent="#059669" accentLight="#d1fae5" trend="Đang chạy" neutral onClick={() => navigate('/admin/don-hang')} />
            </div>

            {/* Content */}
            <div className="admd-content-grid">
                {/* Left: Recent Profiles */}
                <div className="admd-panel">
                    <div className="admd-panel-header">
                        <div className="admd-panel-title">
                            <Users size={15} className="admd-panel-icon-el" />
                            Hồ sơ mới nhất
                        </div>
                        <Link to="/admin/ho-so" className="admd-panel-link">
                            Xem tất cả <ArrowRight size={13} />
                        </Link>
                    </div>
                    <div>
                        {recentProfiles.length === 0 ? (
                            <div className="admd-empty">
                                <Users size={28} className="admd-empty-icon" />
                                <p>Chưa có hồ sơ nào</p>
                            </div>
                        ) : recentProfiles.map(p => {
                            const sc = getS(p.trang_thai || 'Mới đăng ký')
                            const avatar = p.anh_ho_so || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.ho_ten)}&background=${p.gioi_tinh === 'Nữ' ? 'fce7f3' : 'd1fae5'}&color=${p.gioi_tinh === 'Nữ' ? 'be185d' : '065f46'}&bold=true`
                            return (
                                <div key={p.id} className="admd-profile-row" onClick={() => navigate(`/ho-so/${p.id}`)}>
                                    <img src={avatar} className="admd-profile-av" alt="" />
                                    <div className="admd-profile-info">
                                        <span className="admd-profile-name">{p.ho_ten}</span>
                                        <span className="admd-profile-meta">{p.nganh_nghe_mong_muon || 'Chưa chọn ngành'}</span>
                                    </div>
                                    <div className="admd-profile-right">
                                        <span className="admd-status-badge" style={{ color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                                            {p.trang_thai || 'Mới đăng ký'}
                                        </span>
                                        <span className="admd-time">{timeAgo(p.created_at)}</span>
                                    </div>
                                    <ChevronRight size={14} className="admd-profile-arrow" />
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Right Column */}
                <div className="admd-right-col">
                    {/* Recent Orders */}
                    <div className="admd-panel">
                        <div className="admd-panel-header">
                            <div className="admd-panel-title">
                                <Briefcase size={15} className="admd-panel-icon-el" />
                                Đơn hàng gần đây
                            </div>
                            <Link to="/admin/don-hang" className="admd-panel-link">
                                Xem tất cả <ArrowRight size={13} />
                            </Link>
                        </div>
                        <div>
                            {recentOrders.length === 0 ? (
                                <div className="admd-empty">
                                    <Briefcase size={24} className="admd-empty-icon" />
                                    <p>Chưa có đơn hàng</p>
                                </div>
                            ) : recentOrders.map(o => {
                                const osc = getO(o.trang_thai)
                                return (
                                    <div key={o.id} className="admd-order-row" onClick={() => navigate('/admin/don-hang')}>
                                        <div className="admd-order-info">
                                            <p className="admd-order-name">{o.ten_don_hang}</p>
                                            <p className="admd-order-meta">{o.nganh_nghe} · {o.so_luong_tuyen} người</p>
                                        </div>
                                        <span className="admd-order-status" style={{ color: osc.color, background: osc.bg }}>
                                            {o.trang_thai}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="admd-panel">
                        <div className="admd-panel-header">
                            <div className="admd-panel-title">
                                <Zap size={15} className="admd-panel-icon-el" />
                                Hành động nhanh
                            </div>
                        </div>
                        <div className="admd-quick-grid">
                            <QuickAction icon={<Users size={17} />} label="Quản lý hồ sơ" desc="Xem & xử lý ứng viên" accent="#10b981" accentLight="#d1fae5" to="/admin/ho-so" />
                            <QuickAction icon={<Briefcase size={17} />} label="Đơn hàng" desc="Thêm & quản lý đơn" accent="#3b82f6" accentLight="#dbeafe" to="/admin/don-hang" />
                            <QuickAction icon={<GitMerge size={17} />} label="Ghép đơn thi" desc="Kết nối ứng viên" accent="#7c3aed" accentLight="#ede9fe" to="/admin/ghep-don" />
                            <QuickAction icon={<Globe size={17} />} label="Trang chủ" desc="Xem giao diện người dùng" accent="#f59e0b" accentLight="#fef3c7" to="/" />
                        </div>
                    </div>

                    {/* Pipeline */}
                    <div className="admd-panel">
                        <div className="admd-panel-header">
                            <div className="admd-panel-title">
                                <BarChart2 size={15} className="admd-panel-icon-el" />
                                Pipeline ứng viên
                            </div>
                        </div>
                        <div className="admd-pipeline">
                            {[
                                { label: 'Tổng hồ sơ', value: stats.total, max: stats.total || 1, color: '#10b981', bg: '#d1fae5' },
                                { label: 'Chờ phỏng vấn', value: stats.pendingInterview, max: stats.total || 1, color: '#7c3aed', bg: '#ede9fe' },
                                { label: 'Đã trúng tuyển', value: stats.passed, max: stats.total || 1, color: '#db2777', bg: '#fce7f3' },
                            ].map(item => (
                                <div key={item.label} className="admd-pipeline-item">
                                    <div className="admd-pipeline-label">
                                        <span>{item.label}</span>
                                        <span style={{ color: item.color, fontWeight: 800 }}>{item.value}</span>
                                    </div>
                                    <div className="admd-pipeline-track">
                                        <div className="admd-pipeline-bar" style={{
                                            width: `${Math.min(100, (item.value / item.max) * 100)}%`,
                                            background: item.color,
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

                .admd-root {
                    min-height: calc(100vh - 56px);
                    background: #f8fafc;
                    padding: 1.5rem 1.25rem 3rem;
                    font-family: 'Inter', sans-serif;
                }

                .admd-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: calc(100vh - 56px);
                    gap: 0.75rem;
                    color: #94a3b8;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.85rem;
                }

                .admd-spinner {
                    width: 36px; height: 36px;
                    border: 2px solid #e2e8f0;
                    border-top-color: #10b981;
                    border-radius: 50%;
                    animation: admdSpin 0.8s linear infinite;
                }

                @keyframes admdSpin { to { transform: rotate(360deg); } }

                /* ─── HEADER ─── */
                .admd-page-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
                    gap: 1rem;
                }

                .admd-header-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #059669;
                    background: #d1fae5;
                    border: 1px solid #a7f3d0;
                    border-radius: 20px;
                    padding: 0.25rem 0.6rem;
                    margin-bottom: 0.5rem;
                }

                .admd-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.5px;
                }

                .admd-subtitle {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    margin-top: 0.2rem;
                }

                .admd-refresh-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.5rem 0.9rem;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    color: #64748b;
                    font-size: 0.78rem;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.15s;
                    flex-shrink: 0;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
                }

                .admd-refresh-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    color: #334155;
                }

                /* ─── KPI ─── */
                .admd-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                }

                @media (min-width: 768px) { .admd-kpi-grid { grid-template-columns: repeat(3, 1fr); } }
                @media (min-width: 1280px) { .admd-kpi-grid { grid-template-columns: repeat(6, 1fr); } }

                /* ─── CONTENT GRID ─── */
                .admd-content-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }

                @media (min-width: 1024px) { .admd-content-grid { grid-template-columns: 1fr 360px; } }

                .admd-right-col {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                /* ─── PANEL ─── */
                .admd-panel {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }

                .admd-panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.1rem;
                    border-bottom: 1px solid #f1f5f9;
                }

                .admd-panel-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #374151;
                }

                .admd-panel-icon-el { color: #94a3b8; }

                .admd-panel-link {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.73rem;
                    font-weight: 600;
                    color: #059669;
                    text-decoration: none;
                    transition: opacity 0.15s;
                }

                .admd-panel-link:hover { opacity: 0.7; }

                /* ─── PROFILE ROWS ─── */
                .admd-profile-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.7rem 1.1rem;
                    cursor: pointer;
                    transition: background 0.12s;
                    border-bottom: 1px solid #f8fafc;
                }

                .admd-profile-row:last-child { border-bottom: none; }
                .admd-profile-row:hover { background: #f8fafc; }

                .admd-profile-av {
                    width: 34px; height: 34px;
                    border-radius: 9px;
                    object-fit: cover;
                    border: 1.5px solid #e2e8f0;
                    flex-shrink: 0;
                }

                .admd-profile-info {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .admd-profile-name {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: #0f172a;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .admd-profile-meta {
                    font-size: 0.7rem;
                    color: #94a3b8;
                }

                .admd-profile-right {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 3px;
                    flex-shrink: 0;
                }

                .admd-status-badge {
                    font-size: 0.62rem;
                    font-weight: 700;
                    padding: 0.15rem 0.5rem;
                    border-radius: 20px;
                    white-space: nowrap;
                }

                .admd-time {
                    font-size: 0.65rem;
                    color: #cbd5e1;
                }

                .admd-profile-arrow {
                    color: #e2e8f0;
                    flex-shrink: 0;
                    transition: transform 0.15s, color 0.15s;
                }

                .admd-profile-row:hover .admd-profile-arrow {
                    transform: translateX(3px);
                    color: #94a3b8;
                }

                /* ─── ORDER ROWS ─── */
                .admd-order-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.75rem;
                    padding: 0.75rem 1.1rem;
                    cursor: pointer;
                    transition: background 0.12s;
                    border-bottom: 1px solid #f8fafc;
                }

                .admd-order-row:last-child { border-bottom: none; }
                .admd-order-row:hover { background: #f8fafc; }

                .admd-order-info { flex: 1; min-width: 0; }

                .admd-order-name {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: #0f172a;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .admd-order-meta {
                    font-size: 0.7rem;
                    color: #94a3b8;
                    margin-top: 1px;
                }

                .admd-order-status {
                    font-size: 0.63rem;
                    font-weight: 700;
                    padding: 0.2rem 0.55rem;
                    border-radius: 20px;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                /* ─── QUICK ACTIONS ─── */
                .admd-quick-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.6rem;
                    padding: 0.85rem;
                }

                /* ─── PIPELINE ─── */
                .admd-pipeline {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding: 1rem 1.1rem;
                }

                .admd-pipeline-label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 500;
                    margin-bottom: 0.4rem;
                }

                .admd-pipeline-track {
                    height: 6px;
                    background: #f1f5f9;
                    border-radius: 10px;
                    overflow: hidden;
                }

                .admd-pipeline-bar {
                    height: 100%;
                    border-radius: 10px;
                    transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
                    min-width: 4px;
                }

                /* ─── EMPTY ─── */
                .admd-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 2rem;
                    color: #e2e8f0;
                    font-size: 0.8rem;
                }

                .admd-empty-icon { color: #e2e8f0; }
            `}</style>
        </div>
    )
}

function KpiCard({ icon, label, value, unit, accent, accentLight, trend, trendUp, neutral, onClick }) {
    return (
        <div className="admd-kpi" style={{ '--a': accent, '--al': accentLight }} onClick={onClick}>
            <div className="admd-kpi-top">
                <div className="admd-kpi-icon">{icon}</div>
                <div className={`admd-kpi-trend ${neutral ? 'n' : trendUp ? 'u' : 'd'}`}>
                    {!neutral && (trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />)}
                    {trend}
                </div>
            </div>
            <div className="admd-kpi-value">{value.toLocaleString()}</div>
            <div className="admd-kpi-label">{label}</div>
            <div className="admd-kpi-unit">{unit}</div>

            <style>{`
                .admd-kpi {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }

                .admd-kpi::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    background: var(--a);
                    opacity: 0.7;
                }

                .admd-kpi:hover {
                    border-color: var(--a);
                    background: var(--al);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
                }

                .admd-kpi-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                }

                .admd-kpi-icon {
                    width: 38px; height: 38px;
                    background: var(--al);
                    border: 1.5px solid var(--a)30;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--a);
                }

                .admd-kpi-trend {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    font-size: 0.62rem;
                    font-weight: 700;
                    padding: 0.2rem 0.4rem;
                    border-radius: 6px;
                }

                .admd-kpi-trend.u { color: #059669; background: #d1fae5; }
                .admd-kpi-trend.d { color: #d97706; background: #fef3c7; }
                .admd-kpi-trend.n { color: #64748b; background: #f1f5f9; }

                .admd-kpi-value {
                    font-size: 1.7rem;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -1px;
                    line-height: 1;
                    margin-bottom: 0.2rem;
                }

                .admd-kpi-label {
                    font-size: 0.73rem;
                    font-weight: 600;
                    color: #64748b;
                    line-height: 1.3;
                }

                .admd-kpi-unit {
                    font-size: 0.65rem;
                    color: #cbd5e1;
                    margin-top: 2px;
                }
            `}</style>
        </div>
    )
}

function QuickAction({ icon, label, desc, accent, accentLight, to }) {
    const navigate = useNavigate()
    return (
        <button
            onClick={() => navigate(to)}
            className="admd-qa"
            style={{ '--qa': accent, '--qal': accentLight }}
        >
            <div className="admd-qa-icon">{icon}</div>
            <span className="admd-qa-label">{label}</span>
            <span className="admd-qa-desc">{desc}</span>

            <style>{`
                .admd-qa {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.3rem;
                    padding: 0.85rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.15s;
                    font-family: inherit;
                    text-align: left;
                    width: 100%;
                }

                .admd-qa:hover {
                    background: var(--qal);
                    border-color: var(--qa)50;
                }

                .admd-qa-icon {
                    width: 32px; height: 32px;
                    background: var(--qal);
                    border: 1.5px solid var(--qa)30;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--qa);
                    margin-bottom: 0.2rem;
                }

                .admd-qa-label {
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                .admd-qa-desc {
                    font-size: 0.65rem;
                    color: #94a3b8;
                }
            `}</style>
        </button>
    )
}
