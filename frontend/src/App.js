import React, { useState, useEffect } from 'react';
import UserManagement from './components/UserManagement';
import ProductManagement from './components/ProductManagement';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('products');
  const [user, setUser] = useState(null);

  // بارگذاری کاربر از localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // تابع برای آپدیت وضعیت کاربر (از UserManagement فراخوانی میشه)
  const updateUser = (userData) => {
    setUser(userData);
  };

  // تابع برای خروج
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div className="App">
      {/* نوار ناوبری */}
      <nav style={{ 
        padding: '15px', 
        borderBottom: '2px solid #eee',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setCurrentPage('products')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentPage === 'products' ? '#007bff' : 'transparent',
              color: currentPage === 'products' ? 'white' : '#007bff',
              border: '2px solid #007bff',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🛒 فروشگاه پارچه
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user ? (
            <>
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                👋 سلام {user.name}
              </span>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🚪 خروج
              </button>
            </>
          ) : (
            <button 
              onClick={() => setCurrentPage('auth')}
              style={{
                padding: '10px 20px',
                backgroundColor: currentPage === 'auth' ? '#28a745' : 'transparent',
                color: currentPage === 'auth' ? 'white' : '#28a745',
                border: '2px solid #28a745',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🔐 ثبت‌نام / ورود
            </button>
          )}
        </div>
      </nav>

      {/* نمایش صفحه فعال */}
      <main>
        {currentPage === 'products' && <ProductManagement user={user} />}
        {currentPage === 'auth' && <UserManagement onUserUpdate={updateUser} />}
      </main>
    </div>
  );
}

export default App;