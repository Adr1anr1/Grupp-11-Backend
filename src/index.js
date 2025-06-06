import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/Orders.js';
import brandRoutes from './routes/brands.js';
import supplierRoutes from './routes/suppliers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
//hej 
// Middleware
app.use(cors({
  origin: [
    'https://webshop-2025-g11-fe1.vercel.app', 
    'https://hakim-livs-backend-fork.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// API Documentation route
app.get('/api', (req, res) => {
  res.json({
    name: "Hakim Livs API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register a new user",
        "POST /api/auth/login": "Login with username and password"
      },
      products: {
        "GET /api/products": "Get all products",
        "GET /api/products/:id": "Get a single product by ID",
        "POST /api/products": "Create a new product (Admin only)",
        "PUT /api/products/:id": "Update a product (Admin only)",
        "DELETE /api/products/:id": "Delete a product (Admin only)"
      },
      categories: {
        "GET /api/categories": "Get all categories"
      },
      brands: {
        "GET /api/brands": "Get all brands"
      },
      suppliers: {
        "GET /api/suppliers": "Get all suppliers"
      },
      orders: {
        "GET /api/orders": "Get all orders (Admin only)",
        "POST /api/orders": "Create a new order"
      }
    },
    authentication: "Use Bearer token in Authorization header for protected routes"
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/suppliers', supplierRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI/* || "mongodb://localhost:27017/hakim-livs"*/)
  .then(() => console.log('Connected to MongoDB', process.env.MONGODB_URI))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});