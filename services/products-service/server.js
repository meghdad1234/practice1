// products-service/server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'products.json');

// تابع خواندن از فایل
async function readProducts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // فقط اگر فایل واقعاً وجود نداشت، ایجادش کن
    console.log('📁 فایل products.json ایجاد شد');
    const initialData = { products: [] };
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
}

// تابع ذخیره در فایل
async function writeProducts(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// صفحه اصلی سرویس محصولات
app.get('/', (req, res) => {
  res.json({ 
    message: "🛒 سرویس محصولات پارچه فعال است",
    endpoints: {
      getAll: "GET /products",
      create: "POST /products" 
    }
  });
});

// دریافت همه محصولات
app.get('/products', async (req, res) => {
  try {
    const data = await readProducts();
    console.log('📦 دریافت لیست محصولات');
    res.json(data.products);
  } catch (error) {
    res.status(500).json({ error: "خطا در دریافت محصولات" });
  }
});

// ایجاد محصول جدید
app.post('/products', async (req, res) => {
  try {
    console.log('🆕 درخواست ایجاد محصول:', req.body);

    const data = await readProducts();
    const { name, price, category, minOrder = 10 } = req.body;
    
    console.log('🔍 داده‌های دریافتی:', { name, price, category });

    // اعتبارسنجی
    if (!name || !price || !category) {
      return res.status(400).json({ 
        error: "نام، قیمت و دسته‌بندی الزامی هستند",
        received: { name, price, category }
      });
    }

    // ایجاد ID جدید
    const newId = data.products.length > 0 
    ? Math.max(...data.products.map(p => p.id)) + 1 
    : 1;
    // ایجاد محصول
    const newProduct = {
      id: newId,
      name: name.toString().trim(),
      price: parseInt(price),
      category: category.toString().trim(),
      minOrder: parseInt(minOrder),
      createdAt: new Date().toISOString()
    };
    
    console.log('✅ محصول جدید:', newProduct);

    data.products.push(newProduct);
    await writeProducts(data);
    
    
    res.status(201).json({ 
      message: "محصول با موفقیت ایجاد شد",
      product: newProduct 
    });

  } catch (error) {
    console.error('💥 خطا در ایجاد محصول:', error);
    res.status(500).json({ error: "خطا در ایجاد محصول: " + error.message });
  }
});

// ویرایش محصول موجود
app.put('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    console.log('✏️ درخواست ویرایش محصول ID:', productId);
    
    const data = await readProducts();
    const productIndex = data.products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: "محصول پیدا نشد" });
    }

    const { 
      name, 
      price, 
      category, 
      fabricType, 
      width, 
      minOrder, 
      description, 
      colors, 
      inStock 
    } = req.body;

    // آپدیت محصول
    data.products[productIndex] = {
      ...data.products[productIndex], // اطلاعات قبلی
      ...(name && { name: name.toString().trim() }),
      ...(price && { price: parseInt(price) }),
      ...(category && { category: category.toString().trim() }),
      ...(fabricType && { fabricType: fabricType.toString().trim() }),
      ...(width && { width: width.toString().trim() }),
      ...(minOrder && { minOrder: parseInt(minOrder) }),
      ...(description && { description: description.toString().trim() }),
      ...(colors && { colors: Array.isArray(colors) ? colors : [colors.toString().trim()] }),
      ...(inStock !== undefined && { inStock: Boolean(inStock) })
    };

    await writeProducts(data);

    console.log('✅ محصول ویرایش شد:', data.products[productIndex].name);
    res.json({ 
      message: "محصول با موفقیت ویرایش شد",
      product: data.products[productIndex]
    });
  } catch (error) {
    console.error('❌ خطا در ویرایش محصول:', error);
    res.status(500).json({ error: "خطا در ویرایش محصول" });
  }
});

// حذف محصول
app.delete('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    console.log('🗑️ درخواست حذف محصول ID:', productId);
    
    const data = await readProducts();
    const productIndex = data.products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: "محصول پیدا نشد" });
    }

    const deletedProduct = data.products.splice(productIndex, 1)[0];
    await writeProducts(data);

    console.log('✅ محصول حذف شد:', deletedProduct.name);
    res.json({ 
      message: "محصول با موفقیت حذف شد",
      product: deletedProduct
    });
  } catch (error) {
    console.error('❌ خطا در حذف محصول:', error);
    res.status(500).json({ error: "خطا در حذف محصول" });
  }
});

app.listen(PORT, () => {
  console.log(`🛒 سرویس محصولات پارچه روی پورت ${PORT}`);
});