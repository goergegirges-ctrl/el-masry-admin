import React, { useState } from 'react'
import './Login.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = ({ setToken, url }) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onLoginHandler = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            console.log("Attempting login for:", email);
            const response = await axios.post(`${url}/api/admin/login`, { email, password });
            console.log("LOGIN response:", response.data);

            if (response.data.success) {
                const token = response.data.token;
                // Store in localStorage FIRST to ensure interceptors pick it up immediately
                localStorage.setItem("admin_token", token);
                setToken(token);
                toast.success("Login Successful");
            } else {
                toast.error(response.data.message || "Authentication failed");
            }
        } catch (error) {
            console.error("Login Error:", error);
            if (error.response) {
                toast.error(error.response.data.message || "Server error: Unauthorized access");
            } else if (error.request) {
                toast.error("Network error: Please check if the backend server is running");
            } else {
                toast.error("Connection error: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='login'>
            <div className="login-card">
                <div className="login-header">
                    <h1>Admin Panel</h1>
                    <p>Welcome back, please login to your account.</p>
                </div>

                <form onSubmit={onLoginHandler} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            placeholder='admin@elmasry.com'
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-input-wrapper">
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                type={showPassword ? "text" : "password"}
                                placeholder='Password'
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button type='submit' className="login-btn" disabled={loading}>
                        {loading ? <><Loader2 className="spinner" size={18} /> Logging in...</> : "Login"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
