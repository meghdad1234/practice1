const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 🔥 اصلاح اساسی: استفاده از req.originalUrl
app.use('/users', async (req, res) => {
  try {
    const targetUrl = `http://localhost:5001${req.originalUrl}`;
    console.log('🔀 درخواست users به:', targetUrl);
    
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ پاسخ از سرویس کاربران:', response.status);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('❌ خطا در Gateway برای users:', error.message);
    if (error.response) {
      console.error('📞 وضعیت خطا:', error.response.status);
      console.error('📦 داده خطا:', error.response.data);
    }
    res.status(error.response?.status || 500).json({ 
      error: 'خطا در ارتباط با سرویس کاربران',
      details: error.response?.data 
    });
  }
});

app.use('/products', async (req, res) => {
  try {
    const targetUrl = `http://localhost:5002${req.originalUrl}`;
    console.log('🔀 درخواست products به:', targetUrl);
    
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ پاسخ از سرویس محصولات:', response.status);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('❌ خطا در Gateway برای products:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'خطا در ارتباط با سرویس محصولات',
      details: error.response?.data 
    });
  }
});

// مسیریابی به سرویس سفارشات
app.use('/orders', async (req, res) => {
  try {
    const targetUrl = `http://localhost:5003${req.originalUrl}`;
    console.log('🔀 درخواست orders به:', targetUrl);
    
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ پاسخ از سرویس سفارشات:', response.status);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('❌ خطا در Gateway برای orders:', error.message);
    if (error.response) {
      console.error('📞 وضعیت خطا:', error.response.status);
      console.error('📦 داده خطا:', error.response.data);
    }
    res.status(error.response?.status || 500).json({ 
      error: 'خطا در ارتباط با سرویس سفارشات',
      details: error.response?.data 
    });
  }
});


// صفحه اصلی
app.get('/', (req, res) => {
  res.json({ 
    message: "🚪 API Gateway فعال است",
    routes: {
      users: "GET/POST /users",
      products: "GET/POST /products",
      orders: "GET/POST /orders"
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚪 API Gateway روی پورت ${PORT} فعال شد`);
});