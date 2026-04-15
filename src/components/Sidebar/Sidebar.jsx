import React from 'react'
import './Sidebar.css'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, PlusCircle, ListOrdered, LogOut, Tags, Users, BarChart3 } from 'lucide-react';

const Sidebar = ({ setToken }) => {
  const navigate = useNavigate();

  const logout = () => {
    setToken("");
    localStorage.removeItem("admin_token");
    navigate('/');
  }

  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/' className="sidebar-option">
          <LayoutDashboard size={20} />
          <p>Dashboard</p>
        </NavLink>
        <NavLink to='/orders' className="sidebar-option">
          <ListOrdered size={20} />
          <p>Orders</p>
        </NavLink>
        <NavLink to='/products' className="sidebar-option">
          <ShoppingBag size={20} />
          <p>Products</p>
        </NavLink>
        <NavLink to='/products/add' className="sidebar-option">
          <PlusCircle size={20} />
          <p>Add Product</p>
        </NavLink>
        <NavLink to='/categories' className="sidebar-option">
          <Tags size={20} />
          <p>Categories</p>
        </NavLink>
        <NavLink to='/customers' className="sidebar-option">
          <Users size={20} />
          <p>Customers</p>
        </NavLink>
        <NavLink to='/analytics' className="sidebar-option">
          <BarChart3 size={20} />
          <p>Analytics</p>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <button onClick={logout} className="sidebar-logout-btn">
          <LogOut size={20} />
          <p>Logout</p>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
