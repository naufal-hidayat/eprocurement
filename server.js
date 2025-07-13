const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inisialisasi Express app
const app = express();
app.use(express.json()); // Untuk parse JSON request body

// Koneksi ke MongoDB (Database)
mongoose.connect('mongodb://localhost:27017/eprocurement', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log('MongoDB Connection Error:', err));

// Schema untuk User (Menghapus `username` untuk menghindari error duplikasi)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Schema untuk Vendor
const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactInfo: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Vendor = mongoose.model('Vendor', vendorSchema);

// Schema untuk Produk
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }
});

const Product = mongoose.model('Product', productSchema);

// Register Endpoint (Tanpa `username` karena dihapus)
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        // Cek apakah email sudah terdaftar
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ userId: newUser._id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User not found');

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid credentials');

    // Membuat JWT Token
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
    res.json({ token });
});

// Vendor Register
app.post('/vendor/register', async (req, res) => {
    const { name, contactInfo, userId } = req.body;

    try {
        const newVendor = new Vendor({ name, contactInfo, userId });
        await newVendor.save();
        res.status(201).send('Vendor Registered');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Endpoint untuk mendapatkan semua pengguna
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Endpoint untuk mendapatkan Vendor berdasarkan userId
app.get('/vendor/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
      // Cari vendor berdasarkan userId
      const vendor = await Vendor.findOne({ userId }).populate('userId', 'email');
      if (!vendor) {
          return res.status(404).json({ message: 'Vendor not found for this user' });
      }
      res.json(vendor);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});

// Endpoint untuk mendapatkan semua vendor
app.get('/vendors', async (req, res) => {
    try {
        const vendors = await Vendor.find().populate('userId', 'email');
        res.json(vendors);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Produk CRUD Endpoints
// Buat Produk
app.post('/product', async (req, res) => {
    const { name, description, price, vendorId } = req.body;

    try {
        const newProduct = new Product({ name, description, price, vendorId });
        await newProduct.save();
        res.status(201).send('Product Created');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Ambil Semua Data Produk oleh Vendor
app.get('/products/:vendorId', async (req, res) => {
    const { vendorId } = req.params;

    try {
        const products = await Product.find({ vendorId });
        res.json(products);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update Produk
app.put('/product/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, { name, description, price }, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Hapus Produk
app.delete('/product/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Product.findByIdAndDelete(id);
        res.status(200).send('Product Deleted');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Mulai server
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});