// frontend-admin/src/components/AdminProducts.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PRODUCTS_API_URL = 'http://localhost:5000/products';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    fabricType: '',
    width: '150cm',
    minOrder: 10,
    description: '',
    colors: [''],
    inStock: true
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // دریافت محصولات
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(PRODUCTS_API_URL);
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('خطا در دریافت محصولات:', error);
      alert('خطا در دریافت لیست محصولات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ایجاد محصول جدید
  const createProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(PRODUCTS_API_URL, {
        ...formData,
        price: parseInt(formData.price),
        minOrder: parseInt(formData.minOrder)
      });
      alert('✅ محصول جدید ایجاد شد');
      setShowForm(false);
      setFormData({
        name: '', price: '', category: '', fabricType: '', 
        width: '150cm', minOrder: 10, description: '', colors: [''], inStock: true
      });
      fetchProducts();
    } catch (error) {
      alert('خطا در ایجاد محصول');
    }
  };

  // حذف محصول
  const deleteProduct = async (productId) => {
    if (window.confirm('آیا از حذف این محصول مطمئن هستید؟')) {
      try {
        await axios.delete(`http://localhost:5000/products/${productId}`);
        alert('✅ محصول حذف شد');
        fetchProducts();
      } catch (error) {
        console.error('❌ خطا در حذف محصول:', error);
        alert('خطا در حذف محصول');
      }finally {
      setLoading(false); // 🔥 اضافه کردن این خط
      }
    }
  };

  // شروع ویرایش محصول
  const startEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  // ذخیره ویرایش محصول
  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/products/${editingProduct.id}`, {
        name: editingProduct.name,
        price: editingProduct.price,
        category: editingProduct.category,
        fabricType: editingProduct.fabricType || 'عمومی',
        width: editingProduct.width || '150cm',
        minOrder: editingProduct.minOrder || 10,
        description: editingProduct.description || '',
        colors: editingProduct.colors || ['مشکی'],
        inStock: editingProduct.inStock !== false
      });
      alert('✅ محصول ویرایش شد');
      setShowEditForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('❌ خطا در ویرایش محصول:', error);
      alert('خطا در ویرایش محصول');
    }
  };

  // لغو ویرایش
  const cancelEdit = () => {
    setShowEditForm(false);
    setEditingProduct(null);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>مدیریت محصولات</h2>
        <button 
          onClick={() => setShowForm(true)}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ➕ محصول جدید
        </button>
      </div>

      {/* فرم ایجاد محصول */}
      {showForm && (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>ایجاد محصول جدید</h3>
          <form onSubmit={createProduct}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder="نام محصول"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ padding: '8px' }}
                required
              />
              <input
                type="number"
                placeholder="قیمت (تومان)"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                style={{ padding: '8px' }}
                required
              />
              <input
                type="text"
                placeholder="دسته‌بندی"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={{ padding: '8px' }}
                required
              />
              <input
                type="text"
                placeholder="نوع پارچه"
                value={formData.fabricType}
                onChange={(e) => setFormData({...formData, fabricType: e.target.value})}
                style={{ padding: '8px' }}
                required
              />
            </div>
            <textarea
              placeholder="توضیحات محصول"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '8px', marginTop: '10px', minHeight: '60px' }}
            />
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
                ایجاد محصول
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px' }}>
                لغو
              </button>
            </div>
          </form>
        </div>
      )}

      {/* فرم ویرایش محصول */}
      {showEditForm && editingProduct && (
        <div style={{ 
          border: '1px solid #007bff', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: '#e7f3ff'
        }}>
          <h3>✏️ ویرایش محصول</h3>
          <form onSubmit={updateProduct}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder="نام محصول"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                style={{ padding: '8px' }}
                required
              />
              <input
                type="number"
                placeholder="قیمت (تومان)"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                style={{ padding: '8px' }}
                required
              />
              <input
                type="text"
                placeholder="دسته‌بندی"
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                style={{ padding: '8px' }}
                required
              />
              <input
                type="text"
                placeholder="نوع پارچه"
                value={editingProduct.fabricType || ''}
                onChange={(e) => setEditingProduct({...editingProduct, fabricType: e.target.value})}
                style={{ padding: '8px' }}
              />
            </div>
            <textarea
              placeholder="توضیحات محصول"
              value={editingProduct.description || ''}
              onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
              style={{ width: '100%', padding: '8px', marginTop: '10px', minHeight: '60px' }}
            />
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
                ذخیره تغییرات
              </button>
              <button type="button" onClick={cancelEdit} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px' }}>
                لغو
              </button>
            </div>
          </form>
        </div>
      )}

      {/* لیست محصولات */}
      {loading ? (
        <p>⏳ در حال دریافت محصولات...</p>
      ) : products.length === 0 ? (
        <p>📭 هیچ محصولی وجود ندارد</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {products.map(product => (
            <div key={product.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{product.name}</h4>
                <p style={{ margin: '5px 0' }}>{product.category} - {product.fabricType || 'عمومی'}</p>
                <p style={{ margin: 0 }}>{product.price.toLocaleString()} تومان - حداقل {product.minOrder} متر</p>
                {product.description && (
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>{product.description}</p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                <span style={{ 
                  padding: '3px 8px', 
                  borderRadius: '10px', 
                  fontSize: '12px',
                  backgroundColor: product.inStock ? '#d4edda' : '#f8d7da',
                  color: product.inStock ? '#155724' : '#721c24'
                }}>
                  {product.inStock ? 'موجود' : 'ناموجود'}
                </span>
              
                {/* دکمه‌های ویرایش و حذف */}
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button 
                    onClick={() => startEditProduct(product)}
                    style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#ffc107', 
                      color: 'black', 
                      border: 'none', 
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ✏️ ویرایش
                  </button>
                  <button 
                    onClick={() => deleteProduct(product.id)}
                    style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            </div>

          ))}
        </div>
      )}
    </div>
  );
}

export default AdminProducts;