// frontend-admin/src/components/AdminOrders.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ORDERS_API_URL = 'http://localhost:5000/orders';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // دریافت سفارشات
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ORDERS_API_URL);
      console.log('📦 سفارشات دریافت شد:', response.data);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ خطا در دریافت سفارشات:', error);
      alert('خطا در دریافت لیست سفارشات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // تغییر وضعیت سفارش
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${ORDERS_API_URL}/${orderId}/status`, { 
        status: newStatus 
      });
      alert('✅ وضعیت سفارش به‌روزرسانی شد');
      fetchOrders(); // دریافت مجدد لیست
    } catch (error) {
      console.error('❌ خطا در به‌روزرسانی سفارش:', error);
      alert('خطا در به‌روزرسانی وضعیت سفارش');
    }
  };

  // محاسبه جمع‌بندی
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{ backgroundColor: '#3498db', color: 'white', padding: '15px', borderRadius: '5px' }}>
          <h3>📦 کل سفارشات</h3>
          <p style={{ fontSize: '24px', margin: 0 }}>{totalOrders}</p>
        </div>
        <div style={{ backgroundColor: '#f39c12', color: 'white', padding: '15px', borderRadius: '5px' }}>
          <h3>⏳ در انتظار</h3>
          <p style={{ fontSize: '24px', margin: 0 }}>{pendingOrders}</p>
        </div>
        <div style={{ backgroundColor: '#27ae60', color: 'white', padding: '15px', borderRadius: '5px' }}>
          <h3>💰 درآمد کل</h3>
          <p style={{ fontSize: '24px', margin: 0 }}>{totalRevenue.toLocaleString()} تومان</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>لیست سفارشات</h2>
        <button 
          onClick={fetchOrders}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#27ae60', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 بروزرسانی لیست
        </button>
      </div>

      {loading ? (
        <p>⏳ در حال دریافت سفارشات...</p>
      ) : orders.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: '#f8f9fa',
          borderRadius: '5px'
        }}>
          <h3>📭 هیچ سفارشی ثبت نشده است</h3>
          <p>هنوز مشتری‌ای سفارش ثبت نکرده است.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {orders.map(order => (
            <div key={order.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                    سفارش #{order.id}
                  </h3>
                  <p><strong>👤 مشتری:</strong> {order.customerName}</p>
                  <p><strong>📞 تلفن:</strong> {order.customerPhone}</p>
                  <p><strong>📅 تاریخ:</strong> {new Date(order.createdAt).toLocaleString('fa-IR')}</p>
                  <p><strong>💰 مبلغ کل:</strong> {order.totalAmount.toLocaleString()} تومان</p>
                  
                  <div style={{ marginTop: '10px' }}>
                    <strong>🛍️ محصولات:</strong>
                    {order.items.map((item, index) => (
                      <div key={index} style={{ 
                        marginLeft: '10px', 
                        padding: '5px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '3px',
                        marginTop: '5px'
                      }}>
                        {item.name} - {item.quantity} متر - {item.price.toLocaleString()} تومان
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ minWidth: '200px' }}>
                  <p><strong>وضعیت:</strong></p>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: 
                      order.status === 'pending' ? '#fff3cd' :
                      order.status === 'confirmed' ? '#d1ecf1' :
                      order.status === 'shipped' ? '#d4edda' : '#e2e3e5',
                    color: 
                      order.status === 'pending' ? '#856404' :
                      order.status === 'confirmed' ? '#0c5460' :
                      order.status === 'shipped' ? '#155724' : '#383d41'
                  }}>
                    {order.status === 'pending' ? '⏳ در انتظار' :
                     order.status === 'confirmed' ? '✅ تایید شده' :
                     order.status === 'shipped' ? '🚚 ارسال شده' : '🎉 تحویل شده'}
                  </span>
                  
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      disabled={order.status !== 'pending'}
                      style={{ 
                        padding: '5px 10px', 
                        backgroundColor: order.status !== 'pending' ? '#6c757d' : '#28a745',
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '3px',
                        cursor: order.status === 'pending' ? 'pointer' : 'not-allowed',
                        fontSize: '12px'
                      }}
                    >
                      تایید سفارش
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      disabled={order.status !== 'confirmed'}
                      style={{ 
                        padding: '5px 10px', 
                        backgroundColor: order.status !== 'confirmed' ? '#6c757d' : '#17a2b8',
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '3px',
                        cursor: order.status === 'confirmed' ? 'pointer' : 'not-allowed',
                        fontSize: '12px'
                      }}
                    >
                      ارسال شده
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      disabled={order.status !== 'shipped'}
                      style={{ 
                        padding: '5px 10px', 
                        backgroundColor: order.status !== 'shipped' ? '#6c757d' : '#6c757d',
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '3px',
                        cursor: order.status === 'shipped' ? 'pointer' : 'not-allowed',
                        fontSize: '12px'
                      }}
                    >
                      تحویل داده شد
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;