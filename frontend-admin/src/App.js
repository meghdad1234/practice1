import React, { useState } from 'react';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import AdminUsers from './components/AdminUsers';
import './App.css';

function App() {
  const [currentSection, setCurrentSection] = useState('orders');

  return (
    <div className="App">
      {/* هدر پنل ادمین */}
      <header style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1>👨‍💼 پنل مدیریت فروشگاه پارچه</h1>
        <nav style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setCurrentSection('orders')}
            style={{
              padding: '8px 15px',
              backgroundColor: currentSection === 'orders' ? '#3498db' : 'transparent',
              color: 'white',
              border: '1px solid #3498db',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            📦 سفارشات
          </button>
          <button 
            onClick={() => setCurrentSection('products')}
            style={{
              padding: '8px 15px',
              backgroundColor: currentSection === 'products' ? '#3498db' : 'transparent',
              color: 'white',
              border: '1px solid #3498db',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🛒 محصولات
          </button>
          <button 
            onClick={() => setCurrentSection('users')}
            style={{
              padding: '8px 15px',
              backgroundColor: currentSection === 'users' ? '#3498db' : 'transparent',
              color: 'white',
              border: '1px solid #3498db',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            👥 کاربران
          </button>
        </nav>
      </header>

      {/* محتوای اصلی */}
      <main style={{ padding: '20px' }}>
        {currentSection === 'orders' && <AdminOrders />}
        {currentSection === 'products' && <AdminProducts />}
        {currentSection === 'users' && <AdminUsers />}
        {currentSection === 'products' && (
          <div>
            <h2>مدیریت محصولات</h2>
          </div>
        )}
        {currentSection === 'users' && (
          <div>
            <h2>مدیریت کاربران</h2>
            <p></p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;