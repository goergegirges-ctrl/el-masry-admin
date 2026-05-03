import React, { useEffect, useState, useMemo, useRef } from 'react'
import './Products.css'
import api from '../../utility/api';
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import ExportButton from '../../components/ExportButton/ExportButton'
import { Check, X, ArrowUpDown } from 'lucide-react'

const CATEGORY_ORDER = ["كوفات", "تيكودات", "ليدات", "بورد", "مساطر شاشات", "كاميرات وأنظمة أمان", "شاشات", "منتجات أخرى"]

const Products = ({ url, token, setToken }) => {
    const [list, setList] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [stockFilter, setStockFilter] = useState('all')
    const [sortBy, setSortBy] = useState('name')
    const [sortDir, setSortDir] = useState('asc')

    // Inline price editing
    const [editingPrice, setEditingPrice] = useState(null)
    const [priceInput, setPriceInput] = useState('')
    const priceRef = useRef(null)

    // Inline stock editing
    const [editingStock, setEditingStock] = useState(null)
    const [stockInput, setStockInput] = useState('')
    const stockRef = useRef(null)

    // Bulk stock update
    const [selectedIds, setSelectedIds] = useState(new Set())
    const [bulkStockInput, setBulkStockInput] = useState('')
    const [isBulkApplying, setIsBulkApplying] = useState(false)

    const categoryTabs = useMemo(() => {
        const counts = {}
        list.forEach(p => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1 })
        const tabs = [{ name: 'All', count: list.length }]
        CATEGORY_ORDER.forEach(cat => { if (counts[cat]) tabs.push({ name: cat, count: counts[cat] }) })
        Object.keys(counts).forEach(cat => {
            if (!CATEGORY_ORDER.includes(cat) && !tabs.find(t => t.name === cat))
                tabs.push({ name: cat, count: counts[cat] })
        })
        return tabs
    }, [list])

    const filteredProducts = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        let result = list.filter(product => {
            const matchesSearch = !q ||
                product.name?.toLowerCase().includes(q) ||
                product.category?.toLowerCase().includes(q) ||
                product.sku?.toLowerCase().includes(q) ||
                product.brand?.toLowerCase().includes(q)
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
            const stock = Number(product.stock) || 0
            const matchesStock =
                stockFilter === 'all'      ? true :
                stockFilter === 'in-stock' ? stock >= 5 :
                stockFilter === 'low-stock'? stock > 0 && stock < 5 :
                /* out-of-stock */           stock === 0
            return matchesSearch && matchesCategory && matchesStock
        })

        result = [...result].sort((a, b) => {
            let av, bv
            if (sortBy === 'name')  { av = (a.name || '').toLowerCase(); bv = (b.name || '').toLowerCase() }
            else if (sortBy === 'price') { av = Number(a.price) || 0; bv = Number(b.price) || 0 }
            else if (sortBy === 'stock') { av = Number(a.stock) || 0; bv = Number(b.stock) || 0 }
            else /* date */ { av = new Date(a.createdAt || 0); bv = new Date(b.createdAt || 0) }
            if (av < bv) return sortDir === 'asc' ? -1 : 1
            if (av > bv) return sortDir === 'asc' ? 1 : -1
            return 0
        })
        return result
    }, [list, searchQuery, selectedCategory, stockFilter, sortBy, sortDir])

    const fetchList = async () => {
        try {
            const response = await api.get('/api/product/list')
            if (response.data.success) {
                const fetchedData = response.data.data
                setList(fetchedData)
                if (selectedCategory !== 'All' && !fetchedData.some(p => p.category === selectedCategory))
                    setSelectedCategory('All')
            } else {
                toast.error('Error fetching products')
            }
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                if (setToken) { localStorage.removeItem('admin_token'); setToken('') }
            } else {
                toast.error('Error connecting to server')
            }
        }
    }

    const removeProduct = async (productId, productName) => {
        const label = productName ? `"${productName}"` : 'this product'
        if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return
        try {
            const response = await api.post('/api/product/remove', { id: productId })
            if (response.data.success) {
                toast.success(response.data.message)
                await fetchList()
            } else {
                toast.error('Error removing product')
            }
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                if (setToken) { localStorage.removeItem('admin_token'); setToken('') }
            } else {
                toast.error('Error connecting to server')
            }
        }
    }

    const toggleFeatured = async (product) => {
        try {
            const response = await api.put('/api/product/update', { id: product.id, isFeatured: !product.isFeatured })
            if (response.data.success) {
                toast.success('Featured status updated')
                await fetchList()
            } else { toast.error('Error updating featured status') }
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                toast.error('Session expired — please log in again.')
                if (setToken) { localStorage.removeItem('admin_token'); setToken('') }
            } else { toast.error('Error updating featured status') }
        }
    }

    const toggleActive = async (product) => {
        try {
            const response = await api.put('/api/product/update', { id: product.id, isActive: !product.isActive })
            if (response.data.success) {
                toast.success('Status updated')
                await fetchList()
            } else { toast.error('Error updating status') }
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                toast.error('Session expired — please log in again.')
                if (setToken) { localStorage.removeItem('admin_token'); setToken('') }
            } else { toast.error('Error updating status') }
        }
    }

    const startEditPrice = (product) => {
        setEditingPrice(product.id)
        setPriceInput(String(product.price || ''))
        setTimeout(() => priceRef.current?.focus(), 0)
    }

    const commitPrice = async (productId) => {
        const val = parseFloat(priceInput)
        if (isNaN(val) || val < 0) { toast.error('Invalid price'); cancelEditPrice(); return }
        try {
            const response = await api.put('/api/product/update', { id: productId, price: val })
            if (response.data.success) {
                toast.success('Price updated')
                await fetchList()
            } else { toast.error('Error updating price') }
        } catch { toast.error('Error updating price') }
        setEditingPrice(null)
    }

    const cancelEditPrice = () => setEditingPrice(null)

    const startEditStock = (product) => {
        setEditingStock(product.id)
        setStockInput(String(product.stock || 0))
        setTimeout(() => stockRef.current?.focus(), 0)
    }

    const commitStock = async (productId) => {
        const val = parseInt(stockInput, 10)
        if (isNaN(val) || val < 0) { toast.error('Invalid stock value'); cancelEditStock(); return }
        try {
            const response = await api.put('/api/product/update', { id: productId, stock: val })
            if (response.data.success) {
                toast.success('Stock updated')
                await fetchList()
            } else { toast.error('Error updating stock') }
        } catch { toast.error('Error updating stock') }
        setEditingStock(null)
    }

    const cancelEditStock = () => setEditingStock(null)

    const toggleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortBy(col); setSortDir('asc') }
    }

    const allSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p.id))
    const someSelected = selectedIds.size > 0

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleSelectAll = () => {
        if (allSelected) setSelectedIds(new Set())
        else setSelectedIds(new Set(filteredProducts.map(p => p.id)))
    }

    const bulkUpdateStock = async () => {
        const val = parseInt(bulkStockInput, 10)
        if (isNaN(val) || val < 0) { toast.error('Enter a valid stock quantity'); return }
        if (!window.confirm(`Set stock to ${val} for ${selectedIds.size} product(s)?`)) return
        setIsBulkApplying(true)
        try {
            await Promise.all([...selectedIds].map(id =>
                api.put('/api/product/update', { id, stock: val })
            ))
            toast.success(`Stock updated for ${selectedIds.size} product${selectedIds.size !== 1 ? 's' : ''}`)
            setSelectedIds(new Set())
            setBulkStockInput('')
            await fetchList()
        } catch {
            toast.error('Error updating some products')
        } finally {
            setIsBulkApplying(false)
        }
    }

    useEffect(() => { fetchList() }, [])

    const SortIcon = ({ col }) => (
        <ArrowUpDown
            size={12}
            className={`sort-icon ${sortBy === col ? 'sort-icon--active' : ''}`}
        />
    )

    return (
        <div className="list add flex-col">
            <div className="header-row">
                <p className="page-title">
                    Products
                    <span className="page-count">({filteredProducts.length})</span>
                </p>
                <ExportButton
                    data={filteredProducts.map(p => ({
                        ID: p.id,
                        Name: p.name,
                        Category: p.category || '',
                        'Price (EGP)': p.price,
                        Stock: p.stock,
                        SKU: p.sku || '',
                        Brand: p.brand || '',
                        Condition: p.condition || '',
                        Active: p.isActive ? 'Yes' : 'No',
                        Featured: p.featured ? 'Yes' : 'No',
                    }))}
                    filename="products-export"
                    sheetName="Products"
                />
            </div>

            {/* Category tabs */}
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

            {/* Toolbar: search + stock filter + sort */}
            <div className="products-toolbar">
                <div className="products-search-wrap">
                    <span className="products-search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, category, SKU, or brand..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="products-search-input"
                    />
                    {searchQuery && (
                        <span onClick={() => setSearchQuery('')} className="products-search-clear">✕</span>
                    )}
                </div>

                <div className="products-controls">
                    <select
                        className="products-filter-select"
                        value={stockFilter}
                        onChange={e => setStockFilter(e.target.value)}
                    >
                        <option value="all">All Stock</option>
                        <option value="in-stock">In Stock (5+)</option>
                        <option value="low-stock">Low Stock (1–4)</option>
                        <option value="out-of-stock">Out of Stock</option>
                    </select>

                    <select
                        className="products-filter-select"
                        value={`${sortBy}-${sortDir}`}
                        onChange={e => {
                            const [col, dir] = e.target.value.split('-')
                            setSortBy(col); setSortDir(dir)
                        }}
                    >
                        <option value="name-asc">Name A→Z</option>
                        <option value="name-desc">Name Z→A</option>
                        <option value="price-asc">Price ↑</option>
                        <option value="price-desc">Price ↓</option>
                        <option value="stock-asc">Stock ↑</option>
                        <option value="stock-desc">Stock ↓</option>
                        <option value="date-desc">Newest first</option>
                        <option value="date-asc">Oldest first</option>
                    </select>
                </div>
            </div>

            {/* Bulk action bar */}
            {someSelected && (
                <div className="bulk-action-bar">
                    <p className="bulk-selected-count"><span>{selectedIds.size}</span> product{selectedIds.size !== 1 ? 's' : ''} selected</p>
                    <span className="bulk-stock-label">Set stock to:</span>
                    <input
                        type="number"
                        min="0"
                        className="bulk-stock-input"
                        placeholder="qty"
                        value={bulkStockInput}
                        onChange={e => setBulkStockInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && bulkUpdateStock()}
                    />
                    <button className="bulk-apply-btn" onClick={bulkUpdateStock} disabled={isBulkApplying}>
                        {isBulkApplying ? 'Applying…' : 'Apply'}
                    </button>
                    <button className="bulk-clear-btn" onClick={() => setSelectedIds(new Set())}>Clear</button>
                </div>
            )}

            {/* Table */}
            <div className="list-table">
                <div className="list-table-format title">
                    <input
                        type="checkbox"
                        className="row-checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        title={allSelected ? 'Deselect all' : 'Select all'}
                    />
                    <b>Image</b>
                    <b>Name</b>
                    <b>Category</b>
                    <b
                        className="sortable-col"
                        onClick={() => toggleSort('price')}
                        title="Sort by price"
                    >
                        Price <SortIcon col="price" />
                    </b>
                    <b
                        className="sortable-col"
                        onClick={() => toggleSort('stock')}
                        title="Sort by stock"
                    >
                        Stock <SortIcon col="stock" />
                    </b>
                    <b><abbr title="Condition" style={{ textDecoration: 'none' }}>Cond.</abbr></b>
                    <b>Active</b>
                    <b>Featured</b>
                    <b>Action</b>
                </div>

                {filteredProducts.map((item) => {
                    const productImg = (item.images && item.images.length > 0)
                        ? item.images[0]
                        : (item.image
                            ? (item.image.startsWith('http') ? item.image : `${url}/images/${item.image}`)
                            : assets.upload_area)

                    return (
                        <div key={item.id} className="list-table-format">
                            <input
                                type="checkbox"
                                className="row-checkbox"
                                checked={selectedIds.has(item.id)}
                                onChange={() => toggleSelect(item.id)}
                            />
                            <img
                                src={productImg}
                                alt={item.name}
                                onError={(e) => { e.target.onerror = null; e.target.src = assets.upload_area }}
                            />
                            <p>{item.name}</p>
                            <p>{item.category}</p>

                            {/* Inline price edit */}
                            {editingPrice === item.id ? (
                                <div className="inline-edit-wrap">
                                    <input
                                        ref={priceRef}
                                        type="number"
                                        className="inline-edit-input"
                                        value={priceInput}
                                        onChange={e => setPriceInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') commitPrice(item.id)
                                            if (e.key === 'Escape') cancelEditPrice()
                                        }}
                                    />
                                    <button className="inline-edit-ok" onClick={() => commitPrice(item.id)}><Check size={12} /></button>
                                    <button className="inline-edit-cancel" onClick={cancelEditPrice}><X size={12} /></button>
                                </div>
                            ) : (
                                <p
                                    className="editable-cell"
                                    onClick={() => startEditPrice(item)}
                                    title="Click to edit price"
                                >
                                    {item.price} ج.م
                                </p>
                            )}

                            {/* Inline stock edit */}
                            {editingStock === item.id ? (
                                <div className="inline-edit-wrap">
                                    <input
                                        ref={stockRef}
                                        type="number"
                                        className="inline-edit-input"
                                        value={stockInput}
                                        onChange={e => setStockInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') commitStock(item.id)
                                            if (e.key === 'Escape') cancelEditStock()
                                        }}
                                    />
                                    <button className="inline-edit-ok" onClick={() => commitStock(item.id)}><Check size={12} /></button>
                                    <button className="inline-edit-cancel" onClick={cancelEditStock}><X size={12} /></button>
                                </div>
                            ) : (
                                <p
                                    className={`editable-cell ${item.stock < 5 ? 'low-stock' : ''}`}
                                    onClick={() => startEditStock(item)}
                                    title="Click to edit stock"
                                >
                                    {item.stock}
                                </p>
                            )}

                            <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{item.condition || '-'}</p>
                            <p
                                onClick={() => toggleActive(item)}
                                className={`status-toggle ${item.isActive ? 'active' : 'inactive'}`}
                            >
                                {item.isActive ? 'Yes' : 'No'}
                            </p>
                            <p
                                onClick={() => toggleFeatured(item)}
                                className={`status-toggle ${item.isFeatured ? 'featured' : 'not-featured'}`}
                            >
                                {item.isFeatured ? 'Yes' : 'No'}
                            </p>
                            <div className="list-actions">
                                <Link to={`/products/edit/${item.id}`} className="edit-link">Edit</Link>
                                <p
                                    onClick={() => removeProduct(item.id, item.name)}
                                    className="cursor delete-action"
                                >
                                    Delete
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filteredProducts.length === 0 && (
                <p className="empty-products-msg">
                    No products found
                    {searchQuery && ` for "${searchQuery}"`}
                    {selectedCategory !== 'All' && ` in category "${selectedCategory}"`}
                    {stockFilter !== 'all' && ` with filter "${stockFilter}"`}
                </p>
            )}
        </div>
    )
}

export default Products
