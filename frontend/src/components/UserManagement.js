import React, { useState } from 'react';
import axios from 'axios';

const AUTH_API_URL = 'http://localhost:5000/users'; // فعلاً از همین API استفاده می‌کنیم

function UserManagement({ onUserUpdate }) {
  const [isLogin, setIsLogin] = useState(true); // true = ورود, false = ثبت‌نام
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(() => {
    // بارگذاری کاربر از localStorage هنگام لود کامپوننت
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  }); // کاربر لاگین شده

  // تغییر بین حالت ورود و ثبت‌نام
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  // مدیریت تغییرات فرم
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ثبت‌نام کاربر جدید
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('❌ رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    if (formData.password.length < 6) {
      alert('❌ رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    try {
      setLoading(true);
      await axios.post(AUTH_API_URL, {
        name: formData.name,
        email: formData.email,
        password: formData.password 
      });
      
      alert('✅ ثبت‌نام موفق! حالا می‌توانید وارد شوید');
      setIsLogin(true); // برو به صفحه ورود
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      console.error('❌ خطا در ثبت‌نام:', error);
      alert('خطا در ثبت‌نام');
    } finally {
      setLoading(false);
    }
  };

  // ورود کاربر
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 🔥 اول اعتبارسنجی ساده در فرانت‌اند
    if (!formData.email || !formData.password) {
      alert('❌ لطفاً ایمیل و پسورد را وارد کنید');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/users/login', {
        email: formData.email,
        password: formData.password
      });

      const foundUser = response.data.user;
      
        if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        onUserUpdate(foundUser); // ✅ بدون props.
        alert(`✅ خوش آمدید ${foundUser.name}!`);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('❌ خطا در ورود:', error);
      if (error.response && error.response.status === 401) {
        alert('❌ ایمیل یا پسورد اشتباه است');
      } else {
        alert('خطا در ورود');
      }
    } finally {
      setLoading(false);
    }
  };

  // خروج کاربر
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    onUserUpdate(null);
    alert('👋 با موفقیت خارج شدید');
  };

  // اگر کاربر لاگین کرده
  if (user) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
        <div style={{ 
          border: '2px solid #28a745', 
          borderRadius: '10px', 
          padding: '30px',
          backgroundColor: '#f8fff9'
        }}>
          <h2>🎉 خوش آمدید!</h2>
          <div style={{ fontSize: '18px', margin: '20px 0' }}>
            <p><strong>👤 نام:</strong> {user.name}</p>
            <p><strong>📧 ایمیل:</strong> {user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🚪 خروج
          </button>
        </div>
      </div>
    );
  }

  // فرم ثبت‌نام/ورود
  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '10px', 
        padding: '30px',
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          {isLogin ? '🔐 ورود به حساب' : '📝 ثبت‌نام جدید'}
        </h2>

        <form onSubmit={isLogin ? handleLogin : handleSignup}>
          {!isLogin && (
            <div style={{ marginBottom: '15px' }}>
              <label>نام کامل:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  marginTop: '5px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }}
                required={!isLogin}
                placeholder="نام و نام خانوادگی"
              />
            </div>
          )}
          
          <div style={{ marginBottom: '15px' }}>
            <label>ایمیل:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={{ 
                width: '100%', 
                padding: '10px', 
                marginTop: '5px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
              required
              placeholder="example@email.com"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>رمز عبور:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              style={{ 
                width: '100%', 
                padding: '10px', 
                marginTop: '5px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
              required
              placeholder="حداقل ۶ کاراکتر"
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label>تکرار رمز عبور:</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  marginTop: '5px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }}
                required={!isLogin}
                placeholder="تکرار رمز عبور"
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? '⏳ در حال پردازش...' : (isLogin ? '🚀 ورود' : '📝 ثبت‌نام')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? '📝 حساب کاربری ندارید؟ ثبت‌نام کنید' : '🔐 قبلاً ثبت‌نام کردید؟ وارد شوید'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;