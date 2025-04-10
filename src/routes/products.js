import express from "express";
import Product from "../models/Product.js";
import { adminAuth } from "../middleware/auth.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const router = express.Router();

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read products JSON file
const productsJSON = JSON.parse(
  readFileSync(join(__dirname, "../data/products.json"), "utf8")
);

// Get all products
router.get("/", async (req, res) => {
  try {
    // Populera kategorier och visa bara "namn" (och _id).
    const products = await Product.find().populate("kategorier", "namn");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//TODO Get single product

// Create product (admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//TODO Update product (admin only)

//TODO Delete product (admin only)

export default router;
