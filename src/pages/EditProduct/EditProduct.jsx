import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../AddProduct/AddProduct.css'
import api from '../../utility/api';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify'

const EditProduct = ({ url, token, setToken }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [imageUrl, setImageUrl] = useState("");
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Other",
        stock: 0,
        condition: "Original",
        isActive: true,
        brand: "",
        sku: "",
    })

    const fetchProductDetails = useCallback(async () => {
        try {
            const response = await api.get(`/api/product/${id}`);
            if (response.data.success) {
                const product = response.data.data;
                setData({
                    name: product.name,
                    description: product.description || "",
                    price: product.price,
                    category: product.category,
                    stock: product.stock,
                    condition: product.condition || "Original",
                    isActive: product.isActive,
                    brand: product.brand || "",
                    sku: product.sku || "",
                });
                setImageUrl((product.images && product.images.length > 0) ? product.images[0] : (product.image || ""));
            }
        } catch (error) {
            console.error("Fetch Product Error:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                if (setToken) { localStorage.removeItem("admin_token"); setToken(""); }
            } else {
                toast.error("Error fetching details");
            }
        }
    }, [id, setToken]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails])

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = name === 'isActive' ? event.target.checked : event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        const updateData = {
            id: id,
            name: data.name,
            description: data.description,
            price: Number(data.price),
            category: data.category,
            stock: Number(data.stock),
            condition: data.condition,
            isActive: data.isActive,
            brand: data.brand.trim() || null,
            sku:   data.sku.trim()   || null,
        }

        if (imageUrl && imageUrl.trim() !== '') {
            updateData.images = [imageUrl.trim()];
        }

        try {
            const response = await api.put(`/api/product/update`, updateData);
            if (response.data.success) {
                toast.success(response.data.message);
                navigate('/products');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Update Product Error:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                toast.error("Session expired — please log in again.");
                if (setToken) { localStorage.removeItem("admin_token"); setToken(""); }
            } else {
                toast.error("Error updating product");
            }
        }
    }

    return (
        <div className='add'>
            <div className='add-product'>
                <form className='flex-col' onSubmit={onSubmitHandler}>
                    <div className="add-img-upload flex-col">
                        <p>Product Image URL</p>
                        <input
                            onChange={(e) => setImageUrl(e.target.value)}
                            value={imageUrl}
                            type="text"
                            placeholder='Paste hosted image URL here'
                        />
                        {imageUrl && (
                            <div className="image-preview" style={{ marginTop: '10px' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Preview:</p>
                                <img
                                    src={imageUrl.startsWith('http') ? imageUrl : `${url}/images/${imageUrl}`}
                                    alt="Preview"
                                    style={{ maxWidth: '120px', borderRadius: '8px', marginTop: '5px' }}
                                    onError={(e) => {
                                        // e.target.src = assets.upload_area;
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="add-product-name flex-col">
                        <p>Product name</p>
                        <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' required />
                    </div>

                    <div className="add-category-price">
                        <div className="add-category flex-col">
                            <p>Brand <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span></p>
                            <input onChange={onChangeHandler} value={data.brand} type="text" name='brand' placeholder='e.g. Samsung, Hisense' />
                        </div>
                        <div className="add-price flex-col">
                            <p>SKU / MPN <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span></p>
                            <input onChange={onChangeHandler} value={data.sku} type="text" name='sku' placeholder='e.g. BN44-00442A' />
                        </div>
                    </div>

                    <div className="add-product-description flex-col">
                        <p>Product description</p>
                        <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder='Write content here' required></textarea>
                    </div>

                    <div className="add-category-price">
                        <div className="add-category flex-col">
                            <p>Category</p>
                            <select onChange={onChangeHandler} value={data.category} name="category">
                                <option value="كوفات">كوفات</option>
                                <option value="تيكونات">تيكونات</option>
                                <option value="ليدات">ليدات</option>
                                <option value="بورد">بورد</option>
                                <option value="مساطر شاشات">مساطر شاشات</option>
                                <option value="كاميرات وأنظمة أمان">كاميرات وأنظمة أمان</option>
                                <option value="شاشات">شاشات</option>
                                <option value="منتجات أخرى">منتجات أخرى</option>
                            </select>
                        </div>
                        <div className="add-price flex-col">
                            <p>Price</p>
                            <input onChange={onChangeHandler} value={data.price} type="Number" name='price' placeholder='20' required />
                        </div>
                        <div className="add-stock flex-col">
                            <p>Stock</p>
                            <input onChange={onChangeHandler} value={data.stock} type="Number" name='stock' placeholder='Quantity' required />
                        </div>
                        <div className="add-stock flex-col">
                            <p>Condition</p>
                            <select onChange={onChangeHandler} name="condition" value={data.condition}>
                                <option value="Original">Original</option>
                                <option value="Used">Used</option>
                                <option value="Substitute">Substitute</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-col">
                        <label className='flex-row' style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                            <input type="checkbox" name="isActive" checked={data.isActive} onChange={onChangeHandler} style={{ width: '20px', height: '20px' }} />
                            <span>Active (visible to customers)</span>
                        </label>
                    </div>

                    <button type='submit' className='add-btn'>Save Changes</button>
                </form>
            </div>
        </div>
    )
}

export default EditProduct
