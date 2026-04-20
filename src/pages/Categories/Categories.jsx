import React, { useEffect, useState } from 'react'
import './Categories.css'
import api from '../../utility/api'
import { toast } from 'react-toastify'
import { Package, Hash, ExternalLink } from 'lucide-react'

const Categories = ({ url, token }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const response = await api.get(`/api/product/categories`);
            if (response.data.success) {
                setCategories(response.data.data);
            } else {
                toast.error("Error fetching categories");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            fetchCategories();
        }
    }, [token]);

    return (
        <div className='categories-page'>
            <div className="categories-header">
                <h1>Categories</h1>
                <p>All product categories with stock counts.</p>
            </div>

            {loading ? (
                <div className="skeleton-grid">
                    {[1, 2, 3, 4].map(n => <div key={n} className="skeleton-card"></div>)}
                </div>
            ) : categories.length > 0 ? (
                <div className="categories-grid">
                    {categories.map((cat, index) => (
                        <div key={index} className="category-card">
                            <div className="category-image">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} />
                                ) : (
                                    <div className="no-image"><Package size={40} /></div>
                                )}
                            </div>
                            <div className="category-info">
                                <h3>{cat.name}</h3>
                                <div className="category-stats">
                                    <span className="stat-badge">
                                        <Hash size={14} />
                                        {cat.count} Products
                                    </span>
                                </div>
                                <button className="view-btn" onClick={() => window.location.href = `/products?category=${cat.name}`}>
                                    View Products <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <Package size={48} />
                    <p>No categories found. Start by adding products!</p>
                </div>
            )}
        </div>
    )
}

export default Categories
