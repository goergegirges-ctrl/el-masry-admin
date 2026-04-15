import React, { useEffect, useState, useMemo } from 'react'
import './Products.css'
import api from '../../utility/api';
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'

const Products = ({ url, token, setToken }) => {

    const [list, setList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const CATEGORY_ORDER = ["كوفات", "تيكودات", "ليدات", "بورد", "مساطر شاشات", "كاميرات وأنظمة أمان", "شاشات", "منتجات أخرى"];

    const categoryTabs = useMemo(() => {
        const categoryCounts = {};
        list.forEach(p => {
            if (p.category) {
                categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
            }
        });

        const tabs = [{ name: "All", count: list.length }];
        
        // Add hardcoded order first, skip empty
        CATEGORY_ORDER.forEach(cat => {
            if (categoryCounts[cat]) {
                tabs.push({ name: cat, count: categoryCounts[cat] });
            }
        });

        // Auto-add any new categories not in hardcoded list
        Object.keys(categoryCounts).forEach(cat => {
            if (!CATEGORY_ORDER.includes(cat) && !tabs.find(t => t.name === cat)) {
                tabs.push({ name: cat, count: categoryCounts[cat] });
            }
        });

        return tabs;
    }, [list]);

    const filteredProducts = list.filter(product => {
        const matchesSearch = !searchQuery.trim() || 
            product.name?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            product.category?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            product.sku?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            product.brand?.toLowerCase().includes(searchQuery.toLowerCase().trim());

        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const fetchList = async () => {
        try {
            const response = await api.get(`/api/product/list`);
            if (response.data.success) {
                const fetchedData = response.data.data;
                setList(fetchedData);
                
                // Edge case: if selected category has no products in the new list, reset to All
                if (selectedCategory !== "All") {
                    const hasProductsInCategory = fetchedData.some(p => p.category === selectedCategory);
                    if (!hasProductsInCategory) {
                        setSelectedCategory("All");
                    }
                }
            } else {
                toast.error("Error fetching products");
            }
        } catch (error) {
            console.error("Fetch List Error:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                if (setToken) { localStorage.removeItem("admin_token"); setToken(""); }
            } else {
                toast.error("Error connecting to server");
            }
        }
    }

    const removeProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to remove this product?")) return;
        try {
            const response = await api.post(`/api/product/remove`, { id: productId });
            if (response.data.success) {
                toast.success(response.data.message);
                await fetchList();
            } else {
                toast.error("Error removing product");
            }
        } catch (error) {
            console.error("Remove Product Error:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                if (setToken) { localStorage.removeItem("admin_token"); setToken(""); }
            } else {
                toast.error("Error connecting to server");
            }
        }
    }

    const toggleFeatured = async (product) => {
        try {
            const updateData = {
                id: product.id,
                isFeatured: !product.isFeatured
            };

            const response = await api.put(`/api/product/update`, updateData);
            if (response.data.success) {
                toast.success("Featured status updated");
                await fetchList();
            } else {
                toast.error("Error updating featured status");
            }
        } catch (error) {
            console.error("Toggle Featured Error:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                toast.error("Session expired.");
                if (setToken) { localStorage.removeItem("admin_token"); setToken(""); }
            } else {
                toast.error("Error updating featured status");
            }
        }
    }

    const toggleActive = async (product) => {
        try {
            const updateData = {
                id: product.id,
                isActive: !product.isActive
            };

            const response = await api.put(`/api/product/update`, updateData);
            if (response.data.success) {
                toast.success("Status updated");
                await fetchList();
            } else {
                toast.error("Error updating status");
            }
        } catch (error) {
            console.error("Toggle Active Error:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                toast.error("Session expired.");
                if (setToken) { localStorage.removeItem("admin_token"); setToken(""); }
            } else {
                toast.error("Error updating status");
            }
        }
    }

    useEffect(() => {
        fetchList();
    }, [])

    return (
        <div className='list add flex-col'>
            <div className='header-row' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p>All Products List <span style={{ color: '#999', fontSize: '14px', fontWeight: '400' }}>({filteredProducts.length} products)</span></p>
            </div>

            <div className="category-tabs">
                {categoryTabs.map((cat, index) => (
                    <button
                        key={index}
                        className={`category-tab ${selectedCategory === cat.name ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.name)}
                    >
                        {cat.name} <span className="count">({cat.count})</span>
                    </button>
                ))}
            </div>

            <div style={{ position: "relative", marginBottom: "16px" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
                <input
                    type="text"
                    placeholder="Search by name, category, SKU, or brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px 40px 10px 36px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "14px"
                    }}
                />
                {searchQuery && (
                    <span
                        onClick={() => setSearchQuery("")}
                        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#999" }}
                    >✕</span>
                )}
            </div>
            <div className="list-table">
                <div className="list-table-format title">
                    <b>Image</b>
                    <b>Name</b>
                    <b>Category</b>
                    <b>Price</b>
                    <b>Stock</b>
                    <b>Cond.</b>
                    <b>Active</b>
                    <b>Featured</b>
                    <b>Action</b>
                </div>
                {filteredProducts.map((item, index) => {
                    const productImg = (item.images && item.images.length > 0)
                        ? item.images[0]
                        : (item.image ? (item.image.startsWith('http') ? item.image : `${url}/images/${item.image}`) : assets.upload_area);

                    return (
                        <div key={index} className='list-table-format'>
                            <img src={productImg} alt={item.name} onError={(e) => {
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = assets.upload_area;
                            }} />
                            <p>{item.name}</p>
                            <p>{item.category}</p>
                            <p>{item.price} ج.م</p>
                            <p className={item.stock < 5 ? 'low-stock' : ''}>{item.stock}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{item.condition || '-'}</p>
                            <p onClick={() => toggleActive(item)} className={`status-toggle ${item.isActive ? 'active' : 'inactive'}`}>
                                {item.isActive ? 'Yes' : 'No'}
                            </p>
                            <p onClick={() => toggleFeatured(item)} className={`status-toggle ${item.isFeatured ? 'featured' : 'not-featured'}`}>
                                {item.isFeatured ? 'Yes' : 'No'}
                            </p>
                            <div className='list-actions'>
                                <Link to={`/products/edit/${item.id}`} className='edit-link'>Edit</Link>
                                <p onClick={() => removeProduct(item.id)} className='cursor delete-action'>Delete</p>
                            </div>
                        </div>
                    )
                })}
            </div>
            {filteredProducts.length === 0 && (
                <p style={{ textAlign: "center", color: "#999", padding: "20px" }}>
                    No products found {searchQuery && `for "${searchQuery}"`} {selectedCategory !== "All" && `in category "${selectedCategory}"`}
                </p>
            )}
        </div>
    )
}

export default Products
