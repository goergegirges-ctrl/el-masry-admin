import React, { useEffect, useState } from 'react'
import './Customers.css'
import api from '../../utility/api'
import { toast } from 'react-toastify'
import { User, Mail, Phone, MapPin, ShoppingBag, CreditCard, Heart, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import ExportButton from '../../components/ExportButton/ExportButton'

const Customers = ({ url, token, setToken }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/api/admin/customers')
            if (response.data.success) {
                setCustomers(response.data.customers);
            } else {
                toast.error("Error fetching customers");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching customers");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCustomers();
    }, []);

    return (
        <div className='customers-page'>
            <div className="customers-header">
                <div>
                    <h1>Customers</h1>
                    <p>Order history and purchase data by customer.</p>
                </div>
                <ExportButton
                    data={customers.map(c => ({
                        ID: c.id,
                        'First Name': c.firstName || '',
                        'Last Name': c.lastName || '',
                        Email: c.email || '',
                        Phone: c.phone || '',
                        'Total Orders': c.totalOrders || 0,
                        'Total Spent (EGP)': c.totalSpent || 0,
                        'Last Order Date': c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-GB') : '',
                        'Joined': c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB') : '',
                    }))}
                    filename="customers-export"
                    sheetName="Customers"
                />
            </div>

            <div className="customers-list">
                {loading ? (
                    <div className="skeleton-rows">
                        {[1, 2, 3, 4, 5].map(n => <div key={n} className="skeleton-row"></div>)}
                    </div>
                ) : customers.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                    <th>Orders</th>
                                    <th>Total spent</th>
                                    <th>Wishlist</th>
                                    <th>Last Order</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((cust, index) => (
                                    <tr key={cust.id}>
                                        <td>
                                            <div className="cust-cell">
                                                <div className="avatar"><User size={20} /></div>
                                                <div className="cust-name">
                                                    <b>{cust.firstName} {cust.lastName}</b>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-cell">
                                                <p><Mail size={14} /> {cust.email}</p>
                                                <p><Phone size={14} /> {cust.phone || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="location-cell">
                                                <p><MapPin size={14} /> {cust.savedAddresses?.find(a => a.isDefault)?.city || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="stats-cell">
                                                <span className="badge-orders"><ShoppingBag size={12} /> {cust.totalOrders}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="spent-cell">
                                                <b>{(cust.totalSpent || 0).toLocaleString()} EGP</b>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="wishlist-cell">
                                                <span className="badge-wishlist"><Heart size={12} /> {cust.wishlist?.length || 0}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td>
                                            <Link to={`/customers/${cust.id}`} className="view-btn">
                                                <Eye size={16} /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <User size={48} />
                        <p>No customers found yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Customers
