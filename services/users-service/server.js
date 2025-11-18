const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = 5001;

const cors = require('cors');

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// مسیر فایل دیتابیس
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// ==================== توابع کمکی برای فایل ====================
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // اگر فایل وجود نداشت، ایجادش کن
    console.log('📁 فایل data.json ایجاد شد');
    const initialData = { users: [] };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// تابع hash کردن پسورد
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// تابع بررسی پسورد
async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// ==================== مسیرها ====================

// صفحه اصلی
app.get('/', (req, res) => {
  console.log('✅ صفحه اصلی');
  res.json({ message: "سلام! سرویس کاربران فعال است!" });
});

// دریافت همه کاربران
app.get('/users', async (req, res) => {
  try {
    console.log('📋 دریافت لیست کاربران');
    const data = await readData();
    res.json(data.users);
  } catch (error) {
    console.log('❌ خطا در دریافت کاربران:', error);
    res.status(500).json({ error: "خطا در خواندن داده‌ها" });
  }
});

// دریافت یک کاربر
app.get('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log(`🔍 درخواست کاربر با ID: ${userId}`);
    
    const data = await readData();
    const user = data.users.find(u => u.id === userId);
    
    if (!user) {
      console.log('❌ کاربر پیدا نشد');
      return res.status(404).json({ error: "کاربر پیدا نشد" });
    }
    
    console.log('✅ کاربر پیدا شد:', user.name);
    res.json(user);
  } catch (error) {
    console.log('❌ خطا در یافتن کاربر:', error);
    res.status(500).json({ error: "خطا در یافتن کاربر" });
  }
});

// ایجاد کاربر جدید
app.post('/users', async (req, res) => {
  try {
    console.log('🆕 درخواست ایجاد کاربر جدید');
    
    const data = await readData();
    const { name, email, password } = req.body;

    // اعتبارسنجی
    if (!name || name.trim() === '') {
      console.log('❌ خطا: نام وجود ندارد یا خالی است');
      return res.status(400).json({ error: "نام الزامی است" });
    }

    if (email === undefined || email === null || email.trim() === '') {
      console.log('❌ خطا: ایمیل ارسال نشده یا خالی است');
      return res.status(400).json({ error: "ایمیل الزامی است" });
    }

    if (!email || email.trim() === '') {
      return res.status(400).json({ error: "ایمیل الزامی است" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "پسورد باید حداقل ۶ کاراکتر باشد" });
    }

    // بررسی اینکه کاربر از قبل وجود ندارد
    const existingUser = data.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "این ایمیل قبلاً ثبت شده است" });
    }

    // 🔥 Hash کردن پسورد
    const hashedPassword = await hashPassword(password);


    // ایجاد کاربر جدید
    const newUser = {
      id: data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword, // 🔥 پسورد hash شده
      createdAt: new Date().toISOString()
    };

    data.users.push(newUser);
    await writeData(data);

    console.log('✅ کاربر جدید ایجاد شد:', newUser.name);

    // 🔥 پسورد رو برنگردون
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ 
      message: "کاربر با موفقیت ایجاد شد",
      user: userWithoutPassword 
    });
  } catch (error) {
    console.log('❌ خطا در ایجاد کاربر:', error);
    res.status(500).json({ error: "خطا در ایجاد کاربر" });
  }
});

// ویرایش کاربر
app.put('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log(`✏️ درخواست ویرایش کاربر ID: ${userId}`);
    
    const data = await readData();
    const userIndex = data.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      console.log('❌ کاربر برای ویرایش پیدا نشد');
      return res.status(404).json({ error: "کاربر پیدا نشد" });
    }

    const { name, email } = req.body;

    // اعتبارسنجی
    if (name && name.trim() === '') {
      console.log('❌ خطا: نام نمی‌تواند خالی باشد');
      return res.status(400).json({ error: "نام نمی‌تواند خالی باشد" });
    }

    if (email !== undefined && email.trim() === '') {
      console.log('❌ خطا: ایمیل نمی‌تواند خالی باشد');
      return res.status(400).json({ error: "ایمیل نمی‌تواند خالی باشد" });
    }

    // آپدیت کاربر
    data.users[userIndex] = {
      ...data.users[userIndex],
      ...(name && { name: name.trim() }),
      ...(email && { email: email.trim() })
    };

    await writeData(data);

    console.log('✅ کاربر ویرایش شد:', data.users[userIndex].name);
    res.json({ 
      message: "کاربر با موفقیت ویرایش شد",
      user: data.users[userIndex]
    });
  } catch (error) {
    console.log('❌ خطا در ویرایش کاربر:', error);
    res.status(500).json({ error: "خطا در ویرایش کاربر" });
  }
});

// حذف کاربر
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log(`🗑️ درخواست حذف کاربر ID: ${userId}`);
    
    const data = await readData();
    const userIndex = data.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      console.log('❌ کاربر برای حذف پیدا نشد');
      return res.status(404).json({ error: "کاربر پیدا نشد" });
    }

    const deletedUser = data.users.splice(userIndex, 1)[0];
    await writeData(data);

    console.log('✅ کاربر حذف شد:', deletedUser.name);
    res.json({ 
      message: "کاربر با موفقیت حذف شد",
      user: deletedUser
    });
  } catch (error) {
    console.log('❌ خطا در حذف کاربر:', error);
    res.status(500).json({ error: "خطا در حذف کاربر" });
  }
});

// 🔐 endpoint لاگین
app.post('/users/login', async (req, res) => {
  try {
    console.log('🔐 درخواست ورود:', req.body.email);
    
    const data = await readData();
    const { email, password } = req.body;

    // اعتبارسنجی
    if (!email || !password) {
      return res.status(400).json({ error: "ایمیل و پسورد الزامی هستند" });
    }

    // پیدا کردن کاربر
    const user = data.users.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ کاربر پیدا نشد:', email);
      return res.status(401).json({ error: "ایمیل یا پسورد اشتباه است" });
    }

    // 🔥 بررسی پسورد
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ پسورد اشتباه برای کاربر:', email);
      return res.status(401).json({ error: "ایمیل یا پسورد اشتباه است" });
    }

    console.log('✅ ورود موفق:', user.name);
    
    // پسورد رو برنگردون
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      message: "ورود موفق",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('❌ خطا در ورود:', error);
    res.status(500).json({ error: "خطا در ورود" });
  }
});

// شروع سرور
app.listen(PORT, () => {
  console.log(`🚀 سرور روی پورت ${PORT} فعال شد`);
  console.log(`💾 داده‌ها در فایل data.json ذخیره می‌شوند`);
  console.log(`📝 مسیرهای موجود:`);
  console.log(`  GET    /              - صفحه اصلی`);
  console.log(`  GET    /users         - دریافت همه کاربران`);
  console.log(`  GET    /users/:id     - دریافت یک کاربر`);
  console.log(`  POST   /users         - ایجاد کاربر جدید`);
  console.log(`  PUT    /users/:id     - ویرایش کاربر`);
  console.log(`  DELETE /users/:id     - حذف کاربر`);
});