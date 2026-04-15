import React, { useState } from 'react'
import api from '../../utility/api';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify'

const AddProduct = ({ url, token, setToken }) => {

    const [imageUrl, setImageUrl] = useState("");
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "كوفات",
        stock: 0,
        condition: "Original",
        manualCategory: ""
    })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        const productData = {
            name: data.name,
            description: data.description,
            price: Number(data.price),
            category: data.manualCategory ? data.manualCategory : data.category,
            stock: Number(data.stock),
            condition: data.condition,
            images: [imageUrl], // Sending as array of hosted URLs
            isActive: true
        }

        try {
            const response = await api.post(`/api/product/add`, productData);
            if (response.data.success) {
                setData({
                    name: "",
                    description: "",
                    price: "",
                    category: "كوفات",
                    stock: 0,
                    condition: "Original",
                    manualCategory: ""
                })
                setImageUrl("");
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Add Product Error:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                toast.error("Session expired. Please login again.");
                if (setToken) { localStorage.removeItem("admin_token"); setToken(""); }
            } else {
                toast.error("Error adding product");
            }
        }
    }

    return (
        <div className='add'>
            <div className='add-product'>
                <form className='flex-col' onSubmit={onSubmitHandler}>
                    <div className="add-img-upload flex-col">
                        <p>Product Image URL</p>
                        <div className="url-input-container">
                            <input
                                onChange={(e) => setImageUrl(e.target.value)}
                                value={imageUrl}
                                type="text"
                                placeholder='Paste hosted image URL here (Cloudinary, imgbb, etc.)'
                                required
                                className="url-input"
                            />
                        </div>
                        {imageUrl && (
                            <div className="image-preview">
                                <p>Preview:</p>
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    onError={(e) => {
                                        e.target.src = assets.upload_area;
                                        toast.error("Invalid image URL");
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="add-product-name flex-col">
                        <p>Product name</p>
                        <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' required />
                    </div>
                    <div className="add-product-description flex-col">
                        <p>Product description</p>
                        <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder='Write content here' required></textarea>
                    </div>

                    <div className="add-category-price">
                        <div className="add-category flex-col">
                            <p>Category</p>
                            <select onChange={onChangeHandler} name="category" value={data.category}>
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
                            <input onChange={onChangeHandler} value={data.stock} type="Number" name='stock' placeholder='10' required />
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

                    <div className="add-product-description flex-col">
                        <p>Manual Category Override (Optional)</p>
                        <input onChange={onChangeHandler} value={data.manualCategory} type="text" name='manualCategory' placeholder='Type category manually' />
                    </div>

                    <button type='submit' className='add-btn'>ADD PRODUCT</button>
                </form>
            </div>
        </div>
    )
}

export default AddProduct
