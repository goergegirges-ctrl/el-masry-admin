import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import AddProduct from './pages/AddProduct/AddProduct'
import Products from './pages/Products/Products'
import Orders from './pages/Orders/Orders'
import Dashboard from './pages/Dashboard/Dashboard'
import EditProduct from './pages/EditProduct/EditProduct'
import Categories from './pages/Categories/Categories'
import Customers from './pages/Customers/Customers'
import CustomerDetails from './pages/Customers/CustomerDetails'
import OrderDetails from './pages/Orders/OrderDetails'
import Analytics from './pages/Analytics/Analytics'
import Login from './pages/Login/Login'
import Forbidden403 from './components/Forbidden403'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Layout = ({ setToken, url, token }) => {
  return (
    <div>
      <Navbar setToken={setToken} />
      <div className="app-content">
        <Sidebar setToken={setToken} />
        <Outlet />
      </div>
    </div>
  )
}

const ProtectedRoute = ({ token, user }) => {
  if (!token) return <Navigate to="/login" />
  if (user && user.role !== 'admin') return <Navigate to="/403" />
  return <Outlet />
}

const App = () => {
  const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "")
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("admin_user")) || null)

  useEffect(() => {
    if (token) {
      localStorage.setItem("admin_token", token);
    } else {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      setUser(null);
    }
  }, [token])

  // Sync user state when token is set/cleared
  useEffect(() => {
    if (!token) {
      setUser(null);
    } else {
      const savedUser = JSON.parse(localStorage.getItem("admin_user"));
      setUser(savedUser);
    }
  }, [token])

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={!token ? <Login setToken={setToken} url={url} /> : <Navigate to="/" />} />
        <Route path="/403" element={<Forbidden403 />} />
        
        <Route element={<ProtectedRoute token={token} user={user} />}>
          <Route element={<Layout setToken={setToken} url={url} token={token} />}>
            <Route path="/" element={<Dashboard url={url} token={token} setToken={setToken} />} />
            <Route path="/products" element={<Products url={url} token={token} setToken={setToken} />} />
            <Route path="/products/add" element={<AddProduct url={url} token={token} setToken={setToken} />} />
            <Route path="/products/edit/:id" element={<EditProduct url={url} token={token} setToken={setToken} />} />
            <Route path="/orders" element={<Orders url={url} token={token} setToken={setToken} />} />
            <Route path="/orders/:id" element={<OrderDetails url={url} token={token} setToken={setToken} />} />
            <Route path="/categories" element={<Categories url={url} token={token} setToken={setToken} />} />
            <Route path="/customers" element={<Customers url={url} token={token} setToken={setToken} />} />
            <Route path="/customers/:id" element={<CustomerDetails url={url} token={token} setToken={setToken} />} />
            <Route path="/analytics" element={<Analytics url={url} token={token} setToken={setToken} />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
      </Routes>
    </>
  )
}

export default App
