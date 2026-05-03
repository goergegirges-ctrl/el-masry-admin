import React, { useEffect, useState, useMemo } from 'react'
import '../../css/AdminOrders.css'
import api from '../../utility/api';
import { toast } from 'react-toastify'
import { Search, X, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ExportButton from '../../components/ExportButton/ExportButton'

const STATUS_OPTS = [
    { value: 'all',              label: 'All Statuses' },
    { value: 'pending',          label: 'Pending' },
    { value: 'confirmed',        label: 'Confirmed' },
    { value: 'out for delivery', label: 'Out for Delivery' },
    { value: 'delivered',        label: 'Delivered' },
    { value: 'cancelled',        label: 'Cancelled' },
]

const statusSlug = (s) => s.toLowerCase().replace(/\s+/g, '-')

const Orders = ({ url, token, setToken }) => {
    const [orders, setOrders]           = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo]     = useState('')
    const navigate = useNavigate()

    const fetchAllOrders = async () => {
        try {
            const response = await api.get('/api/order/list')
            if (response.data.success) {
                setOrders(response.data.data.reverse())
            } else {
                toast.error(response.data.message || 'Error fetching orders')
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setToken('')
                localStorage.removeItem('admin_token')
            }
            toast.error('Error fetching orders')
        }
    }

    const statusHandler = async (event, orderId) => {
        try {
            const response = await api.put('/api/order/update', { id: orderId, status: event.target.value })
            if (response.data.success) {
                toast.success('Status updated')
                await fetchAllOrders()
            }
        } catch {
            toast.error('Error updating status')
        }
    }

    useEffect(() => {
        if (token) fetchAllOrders()
    }, [token])

    const filteredOrders = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        const from = dateFrom ? new Date(dateFrom) : null
        const to   = dateTo   ? new Date(dateTo + 'T23:59:59') : null

        return orders.filter(order => {
            const matchesSearch = !q || [
                order.id,
                order.customer?.firstName,
                order.customer?.lastName,
                order.customer?.phone,
                order.customer?.city,
            ].some(v => v?.toString().toLowerCase().includes(q))

            const matchesStatus = statusFilter === 'all'
                || order.status.toLowerCase() === statusFilter

            const orderDate = order.createdAt ? new Date(order.createdAt) : null
            const matchesFrom = !from || !orderDate || orderDate >= from
            const matchesTo   = !to   || !orderDate || orderDate <= to

            return matchesSearch && matchesStatus && matchesFrom && matchesTo
        })
    }, [orders, searchQuery, statusFilter, dateFrom, dateTo])

    const totalRevenue = useMemo(
        () => filteredOrders.reduce((sum, o) => sum + (o.subtotal || 0) + (o.deliveryFee || 0), 0),
        [filteredOrders]
    )

    const clearDateRange = () => { setDateFrom(''); setDateTo('') }

    return (
        <div className="admin-order-container">
            <div className="order-page-header">
                <div>
                    <h2>Orders</h2>
                    <span className="order-total-count">{filteredOrders.length} of {orders.length}</span>
                </div>
                <ExportButton
                    data={filteredOrders.map(o => ({
                        'Order ID':         o.id.slice(-8).toUpperCase(),
                        Date:               new Date(o.createdAt).toLocaleDateString('en-GB'),
                        Customer:           `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim(),
                        Phone:              o.customer?.phone || '',
                        City:               o.customer?.city || '',
                        Items:              o.items?.length || 0,
                        'Subtotal (EGP)':   o.subtotal,
                        'Delivery Fee (EGP)': o.deliveryFee || 0,
                        'Total (EGP)':      (o.subtotal || 0) + (o.deliveryFee || 0),
                        Status:             o.status,
                        'Payment Method':   o.paymentMethod || '',
                    }))}
                    filename="orders-export"
                    sheetName="Orders"
                />
            </div>

            {/* Revenue summary */}
            <div className="order-revenue-bar">
                <DollarSign size={16} className="order-revenue-icon" />
                <span className="order-revenue-label">Total Revenue (filtered):</span>
                <span className="order-revenue-value">{totalRevenue.toLocaleString()} EGP</span>
            </div>

            {/* Filters */}
            <div className="order-filters">
                <div className="order-search-wrap">
                    <Search size={16} className="order-search-icon" />
                    <input
                        type="text"
                        className="order-search-input"
                        placeholder="Search by name, phone, or order ID…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="order-search-clear" onClick={() => setSearchQuery('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <select
                    className="order-status-filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    {STATUS_OPTS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>

                <div className="order-date-range">
                    <input
                        type="date"
                        className="order-date-input"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        title="From date"
                    />
                    <span className="order-date-sep">–</span>
                    <input
                        type="date"
                        className="order-date-input"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        title="To date"
                    />
                    {(dateFrom || dateTo) && (
                        <button className="order-date-clear" onClick={clearDateRange} title="Clear date range">
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="order-table-wrapper">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>City</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="order-row">
                                <td className="order-id-cell">
                                    #{order.id.slice(-8).toUpperCase()}
                                </td>
                                <td className="order-date-cell" title={new Date(order.createdAt).toLocaleString()}>
                                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                </td>
                                <td className="order-customer-cell">
                                    <div className="oc-name">
                                        {order.customer.firstName} {order.customer.lastName}
                                    </div>
                                    <div className="oc-phone">{order.customer.phone}</div>
                                </td>
                                <td className="order-city-cell">{order.customer.city}</td>
                                <td className="order-items-cell">{order.items.length}</td>
                                <td className="order-total-cell">
                                    {(order.subtotal + (order.deliveryFee || 0)).toLocaleString()} EGP
                                </td>
                                <td className="order-status-cell">
                                    <select
                                        className={`order-status-sel ss-${statusSlug(order.status)}`}
                                        onChange={(e) => statusHandler(e, order.id)}
                                        value={order.status.toLowerCase()}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="out for delivery">Out for Delivery</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="order-action-cell">
                                    <button
                                        className="order-view-btn"
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                    >
                                        View →
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredOrders.length === 0 && (
                    <div className="order-empty">
                        {orders.length === 0 ? 'No orders yet.' : 'No orders match your filters.'}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Orders
