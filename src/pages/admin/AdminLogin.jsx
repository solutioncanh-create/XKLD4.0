import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { Globe, Mail, Lock, Eye, EyeOff, LogIn, AlertTriangle, ArrowLeft } from 'lucide-react'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                const { data: roleData } = await supabase.from('admin_roles').select('role').eq('id', session.user.id).single()
                if (roleData?.role) {
                    localStorage.setItem('user_role', roleData.role)
                    navigate('/admin')
                }
            }
        }
        checkSession()
    }, [navigate])

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
            if (authError) throw authError

            const { data: roleData, error: roleError } = await supabase
                .from('admin_roles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            if (roleError || !roleData) throw new Error('Tài khoản không có quyền truy cập hệ thống quản trị.')

            localStorage.setItem('user_role', roleData.role)
            navigate('/admin')
        } catch (err) {
            setError(err.message || 'Sai thông tin đăng nhập. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="alog-root">
            {/* Decorative blobs */}
            <div className="alog-blob alog-blob-1" />
            <div className="alog-blob alog-blob-2" />
            <div className="alog-blob alog-blob-3" />

            <div className="alog-card">
                {/* Card top accent bar */}
                <div className="alog-card-accent" />

                {/* Brand */}
                <div className="alog-brand">
                    <div className="alog-brand-icon">
                        <Globe size={22} />
                    </div>
                    <div>
                        <div className="alog-brand-text">XKLD <span>4.0</span></div>
                        <div className="alog-brand-sub">ADMIN CONTROL PANEL</div>
                    </div>
                </div>

                {/* Heading */}
                <div className="alog-heading">
                    <h1 className="alog-title">Xác thực danh tính</h1>
                    <p className="alog-subtitle">Vui lòng đăng nhập để tiếp tục</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="alog-error">
                        <AlertTriangle size={15} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="alog-form">
                    <div className="alog-field">
                        <label className="alog-label">ĐỊA CHỈ EMAIL</label>
                        <div className="alog-input-wrap">
                            <Mail size={15} className="alog-input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="alog-input"
                                placeholder="admin@xkld.app"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="alog-field">
                        <label className="alog-label">MẬT KHẨU</label>
                        <div className="alog-input-wrap">
                            <Lock size={15} className="alog-input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="alog-input"
                                placeholder="••••••••••"
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="alog-toggle-pw">
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="alog-submit">
                        {loading ? (
                            <><span className="alog-spinner" /> Đang xác thực...</>
                        ) : (
                            <><LogIn size={17} /> Đăng nhập hệ thống</>
                        )}
                    </button>
                </form>

                {/* Warning */}
                <div className="alog-warning">
                    <AlertTriangle size={13} className="alog-warning-icon" />
                    <span>Khu vực hạn chế — chỉ dành cho quản trị viên và nhân viên được ủy quyền</span>
                </div>

                {/* Footer */}
                <div className="alog-footer">
                    <Link to="/" className="alog-back">
                        <ArrowLeft size={13} />
                        Về trang chủ
                    </Link>
                    <span className="alog-copy">© 2025 XKLD 4.0</span>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

                .alog-root {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 40%, #eff6ff 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', sans-serif;
                    position: relative;
                    overflow: hidden;
                    padding: 1rem;
                }

                /* Decorative blobs */
                .alog-blob {
                    position: fixed;
                    border-radius: 50%;
                    filter: blur(80px);
                    pointer-events: none;
                    z-index: 0;
                    opacity: 0.5;
                }

                .alog-blob-1 {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, #a7f3d0, transparent 70%);
                    top: -120px; left: -120px;
                }

                .alog-blob-2 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, #bfdbfe, transparent 70%);
                    bottom: -100px; right: -80px;
                }

                .alog-blob-3 {
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, #ddd6fe, transparent 70%);
                    top: 50%; right: 20%;
                    transform: translateY(-50%);
                }

                /* ─── CARD ─── */
                .alog-card {
                    width: 100%;
                    max-width: 420px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    padding: 2rem 2.25rem;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 60px rgba(0,0,0,0.08);
                    position: relative;
                    overflow: hidden;
                    z-index: 10;
                }

                .alog-card-accent {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #059669, #10b981, #34d399);
                }

                /* ─── BRAND ─── */
                .alog-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.75rem;
                }

                .alog-brand-icon {
                    width: 46px; height: 46px;
                    background: linear-gradient(135deg, #059669, #10b981);
                    border-radius: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
                    flex-shrink: 0;
                }

                .alog-brand-text {
                    font-size: 1.25rem;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.5px;
                    line-height: 1.1;
                }

                .alog-brand-text span { color: #059669; }

                .alog-brand-sub {
                    font-size: 0.6rem;
                    font-weight: 700;
                    color: #94a3b8;
                    letter-spacing: 0.12em;
                    margin-top: 2px;
                }

                /* ─── HEADING ─── */
                .alog-heading { margin-bottom: 1.5rem; }

                .alog-title {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.4px;
                    margin-bottom: 0.25rem;
                }

                .alog-subtitle {
                    font-size: 0.82rem;
                    color: #94a3b8;
                }

                /* ─── ERROR ─── */
                .alog-error {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.7rem 0.85rem;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 10px;
                    color: #ef4444;
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }

                /* ─── FORM ─── */
                .alog-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .alog-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }

                .alog-label {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #94a3b8;
                    letter-spacing: 0.1em;
                }

                .alog-input-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 0 0.85rem;
                    height: 46px;
                    transition: all 0.2s;
                }

                .alog-input-wrap:focus-within {
                    background: #fff;
                    border-color: #10b981;
                    box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
                }

                .alog-input-icon {
                    color: #cbd5e1;
                    flex-shrink: 0;
                    transition: color 0.2s;
                }

                .alog-input-wrap:focus-within .alog-input-icon { color: #10b981; }

                .alog-input {
                    flex: 1;
                    background: none;
                    border: none;
                    outline: none;
                    color: #0f172a;
                    font-size: 0.88rem;
                    font-family: inherit;
                    font-weight: 500;
                    min-width: 0;
                }

                .alog-input::placeholder { color: #cbd5e1; }

                .alog-toggle-pw {
                    background: none;
                    border: none;
                    color: #cbd5e1;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    flex-shrink: 0;
                    transition: color 0.15s;
                }

                .alog-toggle-pw:hover { color: #64748b; }

                /* ─── SUBMIT ─── */
                .alog-submit {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    width: 100%;
                    height: 48px;
                    background: linear-gradient(135deg, #059669, #10b981);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 0.88rem;
                    font-weight: 800;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-top: 0.25rem;
                    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
                    letter-spacing: 0.01em;
                }

                .alog-submit:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 20px rgba(16,185,129,0.35);
                }

                .alog-submit:active:not(:disabled) { transform: translateY(0); }

                .alog-submit:disabled {
                    opacity: 0.75;
                    cursor: not-allowed;
                }

                .alog-spinner {
                    width: 16px; height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: alogSpin 0.7s linear infinite;
                    display: inline-block;
                }

                @keyframes alogSpin { to { transform: rotate(360deg); } }

                /* ─── WARNING ─── */
                .alog-warning {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                    margin-top: 1.25rem;
                    padding: 0.65rem 0.85rem;
                    background: #fffbeb;
                    border: 1px solid #fde68a;
                    border-radius: 10px;
                    font-size: 0.74rem;
                    color: #92400e;
                    font-weight: 500;
                    line-height: 1.4;
                }

                .alog-warning-icon {
                    color: #f59e0b;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                /* ─── FOOTER ─── */
                .alog-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 1.25rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f1f5f9;
                }

                .alog-back {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #64748b;
                    text-decoration: none;
                    transition: color 0.15s;
                }

                .alog-back:hover { color: #0f172a; }

                .alog-copy {
                    font-size: 0.7rem;
                    color: #cbd5e1;
                }
            `}</style>
        </div>
    )
}
