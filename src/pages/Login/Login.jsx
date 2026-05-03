import React, { useState } from 'react'
import './Login.css'
import api from '../../utility/api'
import { toast } from 'react-toastify'
import { Eye, EyeOff, Loader2, ArrowRight, Mail, Lock } from 'lucide-react'

const Login = ({ setToken }) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const onLoginHandler = async (event) => {
        event.preventDefault()
        setLoading(true)
        try {
            const response = await api.post(`/api/admin/login`, { email, password })

            if (response.data.success) {
                const token = response.data.token
                const user = response.data.user
                localStorage.setItem("admin_token", token)
                localStorage.setItem("admin_user", JSON.stringify(user))
                setToken(token)
                toast.success("Login Successful")
            } else {
                toast.error(response.data.message || "Authentication failed")
            }
        } catch (error) {
            console.error("Login Error:", error)
            if (error.response) {
                toast.error(error.response.data.message || "Server error: Unauthorized access")
            } else if (error.request) {
                toast.error("Network error: Please check if the backend server is running")
            } else {
                toast.error("Connection error: " + error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-root">
            {/* ── Hero panel ─────────────────────────────────────── */}
            <div className="login-hero">
                <div className="lh-brand">
                    <div className="lh-mark">M</div>
                    <div className="lh-name">
                        El-Masry Electronics
                        <small>المصري للشاشات والكاميرات</small>
                    </div>
                </div>

                <div className="lh-mid">
                    <h2>
                        Genuine TV spare parts, delivered fast.
                        <span className="lh-ar">قطع غيار أصلية بأفضل الأسعار</span>
                    </h2>
                    <p>Egypt's professional marketplace for screens, boards, backlight LEDs and flex cables — with 12-month warranty.</p>
                </div>

                <div className="lh-stats">
                    <div className="lh-stat">
                        <div className="lh-stat-n">12K+</div>
                        <div className="lh-stat-l">Pro buyers</div>
                    </div>
                    <div className="lh-stat">
                        <div className="lh-stat-n">8.5K</div>
                        <div className="lh-stat-l">SKUs in stock</div>
                    </div>
                    <div className="lh-stat">
                        <div className="lh-stat-n">24h</div>
                        <div className="lh-stat-l">Cairo delivery</div>
                    </div>
                </div>
            </div>

            {/* ── Form panel ─────────────────────────────────────── */}
            <div className="login-pane">
                <div className="login-lang-tabs">
                    <button className="active" type="button">EN</button>
                    <button type="button" className="ar-btn">ع</button>
                </div>

                <div className="login-card">
                    <h1 className="lc-title">
                        Welcome back
                        <span className="lc-title-ar">مرحباً بعودتك</span>
                    </h1>
                    <p className="lc-sub">Sign in to your El-Masry admin account to continue.</p>

                    <form onSubmit={onLoginHandler} className="lc-form">
                        <div className="lc-field">
                            <label>
                                Email Address
                                <span className="lc-label-ar">| البريد الإلكتروني</span>
                            </label>
                            <div className="lc-input">
                                <Mail size={18} className="lc-input-icon" />
                                <input
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    type="email"
                                    placeholder="admin@elmasry.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="lc-field">
                            <label>
                                Password
                                <span className="lc-label-ar">| كلمة المرور</span>
                            </label>
                            <div className="lc-input">
                                <Lock size={18} className="lc-input-icon" />
                                <input
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="lc-eye"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`lc-cta${loading ? " loading" : ""}`}
                            disabled={loading}
                        >
                            {loading
                                ? <><Loader2 size={18} className="lc-spin" /><span>Signing you in…</span></>
                                : <><span>Sign in</span><ArrowRight size={18} /></>
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
