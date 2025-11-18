const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 5003;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'orders.json');

// تابع خواندن از فایل
async function readOrders() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('📁 فایل orders.json ایجاد شد');
    const initialData = { orders: [] };
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
}

// تابع ذخیره در فایل
async function writeOrders(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// ==================== مسیرهای API ====================

// صفحه اصلی
app.get('/', (req, res) => {
  res.json({ message: "🚚 سرویس سفارشات فعال است!" });
});

// دریافت همه سفارشات
app.get('/orders', async (req, res) => {
  try {
    const data = await readOrders();
    console.log('📦 دریافت لیست سفارشات');
    res.json(data.orders);
  } catch (error) {
    console.log('❌ خطا در دریافت سفارشات:', error);
    res.status(500).json({ error: "خطا در دریافت سفارشات" });
  }
});

// ایجاد سفارش جدید
app.post('/orders', async (req, res) => {
  try {
    console.log('🆕 درخواست ایجاد سفارش جدید:', req.body);
    
    const data = await readOrders();
    const { customerName, customerPhone, items, totalAmount } = req.body;

    // اعتبارسنجی ساده
    if (!customerName || !customerPhone || !items || !totalAmount) {
      return res.status(400).json({ error: "تمام فیلدها الزامی هستند" });
    }

    // ایجاد سفارش جدید
    const newOrder = {
      id: data.orders.length > 0 ? Math.max(...data.orders.map(o => o.id)) + 1 : 1,
      customerName,
      customerPhone,
      items,
      totalAmount,
      status: "pending", // وضعیت پیش‌فرض: در انتظار
      createdAt: new Date().toISOString()
    };

    data.orders.push(newOrder);
    await writeOrders(data);

    console.log('✅ سفارش جدید ایجاد شد - مبلغ:', totalAmount);
    res.status(201).json({ 
      message: "سفارش با موفقیت ثبت شد",
      order: newOrder 
    });
  } catch (error) {
    console.log('❌ خطا در ایجاد سفارش:', error);
    res.status(500).json({ error: "خطا در ثبت سفارش" });
  }
});

// به‌روزرسانی وضعیت سفارش
app.put('/orders/:id/status', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    
    const data = await readOrders();
    const orderIndex = data.orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: "سفارش پیدا نشد" });
    }

    data.orders[orderIndex].status = status;
    await writeOrders(data);

    console.log('✅ وضعیت سفارش به‌روزرسانی شد:', status);
    res.json({ 
      message: "وضعیت سفارش به‌روزرسانی شد",
      order: data.orders[orderIndex]
    });
  } catch (error) {
    console.log('❌ خطا در به‌روزرسانی سفارش:', error);
    res.status(500).json({ error: "خطا در به‌روزرسانی سفارش" });
  }
});

// شروع سرور
app.listen(PORT, () => {
  console.log(`🚚 سرویس سفارشات روی پورت ${PORT} فعال شد`);
  console.log(`📝 مسیرهای موجود:`);
  console.log(`  GET  /orders           - دریافت همه سفارشات`);
  console.log(`  POST /orders           - ایجاد سفارش جدید`);
  console.log(`  PUT  /orders/:id/status - تغییر وضعیت سفارش`);
});