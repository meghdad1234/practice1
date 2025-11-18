// frontend-admin/src/components/AdminUsers.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const USERS_API_URL = 'http://localhost:5000/users';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(USERS_API_URL);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('خطا در دریافت کاربران:', error);
      alert('خطا در دریافت لیست کاربران');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2>👥 مدیریت کاربران</h2>
      
      {loading ? (
        <p>⏳ در حال دریافت کاربران...</p>
      ) : users.length === 0 ? (
        <p>📭 هیچ کاربری ثبت‌نام نکرده است</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {users.map(user => (
            <div key={user.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: 'white'
            }}>
              <h4>👤 {user.name}</h4>
              <p>📧 {user.email}</p>
              <p>🆔 شناسه: {user.id}</p>
              <p>📅 عضو since: {new Date(user.createdAt).toLocaleDateString('fa-IR')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminUsers;