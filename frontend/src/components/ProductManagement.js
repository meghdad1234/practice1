// frontend/src/components/ProductManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PRODUCTS_API_URL = 'http://localhost:5000/products';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [cart, setCart] = useState([]);

  // دریافت محصولات
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(PRODUCTS_API_URL);
      console.log('📦 محصولات دریافت شد:', response.data);
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ خطا در دریافت محصولات:', error);
      alert('خطا در دریافت لیست محصولات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // فیلتر محصولات
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.includes(searchTerm) || 
                         product.description.includes(searchTerm);
    const matchesCategory = selectedCategory === 'همه' || 
                           product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // اضافه به سبد خرید
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    alert(`✅ ${product.name} به سبد خرید اضافه شد`);
  };

  // ثبت سفارش
  const submitOrder = async () => {
    if (cart.length === 0) {
      alert('❌ سبد خرید شما خالی است');
      return;
    }

    const customerName = prompt('👤 نام خود را وارد کنید:');
    const customerPhone = prompt('📞 شماره تماس خود را وارد کنید:');

    if (!customerName || !customerPhone) {
      alert('❌ نام و شماره تماس الزامی است');
      return;
    }

    try {
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const orderData = {
        customerName,
        customerPhone,
        items: cart,
        totalAmount
      };

      console.log('🛒 در حال ثبت سفارش:', orderData);

      const response = await axios.post('http://localhost:5000/orders', orderData);

      alert(`✅ ${response.data.message}`);
      setCart([]); // خالی کردن سبد خرید
    } catch (error) {
      console.error('❌ خطا در ثبت سفارش:', error);
      alert('خطا در ثبت سفارش');
    }
  };

  // دریافت دسته‌بندی‌های منحصر به فرد
  const categories = ['همه', ...new Set(products.map(p => p.category))];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🛒 فروشگاه پارچه عمده</h1>
      
      {/* نوار جستجو و فیلتر */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="جستجو در محصولات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        />
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '8px' }}
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* سبد خرید */}
      {cart.length > 0 && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3>🛍️ سبد خرید ({cart.reduce((sum, item) => sum + item.quantity, 0)} عدد)</h3>
          <div>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.name} × {item.quantity}</span>
                <span>{item.price * item.quantity} تومان</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '10px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
      <strong>جمع کل: {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} تومان</strong>
    </div>
    
    {/* 🔽 این دکمه رو اضافه کن 🔽 */}
    <button 
      onClick={submitOrder}
      style={{
        marginTop: '10px',
        padding: '10px 15px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '100%'
      }}
    >
      📦 ثبت سفارش
    </button>
        </div>
      )}

      {/* لیست محصولات */}
      {loading ? (
        <p>⏳ در حال دریافت محصولات...</p>
      ) : filteredProducts.length === 0 ? (
        <p>هیچ محصولی یافت نشد.</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: 'white'
            }}>
              <h3>{product.name}</h3>
              <p><strong>دسته‌بندی:</strong> {product.category}</p>
              <p><strong>نوع پارچه:</strong> {product.fabricType}</p>
              <p><strong>عرض:</strong> {product.width}</p>
              <p><strong>حداقل سفارش:</strong> {product.minOrder} متر</p>
              <p><strong>قیمت:</strong> {product.price} تومان هر متر</p>
              {product.colors && product.colors.length > 0 && (
                <p><strong>رنگ‌ها:</strong> {product.colors.join('، ')}</p>
              )}
              <p>{product.description}</p>
              
              <button 
                onClick={() => addToCart(product)}
                disabled={!product.inStock}
                style={{
                  padding: '10px 15px',
                  backgroundColor: product.inStock ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: product.inStock ? 'pointer' : 'not-allowed',
                  width: '100%'
                }}
              >
                {product.inStock ? '➕ افزودن به سبد خرید' : 'ناموجود'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductManagement;