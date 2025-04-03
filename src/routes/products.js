import express from "express";
import Product from "../models/Product.js";
import { auth, adminAuth } from "../middleware/auth.js";
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

// Get all products (öppet för alla)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("kategorier", "namn")
      .populate("varumarke", "namn")
      .populate("leverantor", "namn");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product (öppet för alla)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("kategorier", "namn")
      .populate("varumarke", "namn")
      .populate("leverantor", "namn");
    if (!product) {
      return res.status(404).json({ error: "Produkten hittades inte." });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product (endast admin)
router.post("/", auth, adminAuth, async (req, res) => {
  try {
    // Enkel validering: exempelvis kräver "namn" & "pris"
    if (!req.body.namn || req.body.pris === undefined) {
      return res.status(400).json({ error: "Fälten 'namn' och 'pris' måste anges." });
    }

    const product = new Product(req.body);
    await product.save();
    
    // Populera referenser innan vi skickar tillbaka produkten
    const populatedProduct = await Product.findById(product._id)
      .populate("kategorier", "namn")
      .populate("varumarke", "namn")
      .populate("leverantor", "namn");
      
    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update product (endast admin)
router.put("/:id", auth, adminAuth, async (req, res) => {
  try {
    // Enkel validering
    if (!req.body.namn || req.body.pris === undefined) {
      return res.status(400).json({ error: "Fälten 'namn' och 'pris' måste anges." });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("kategorier", "namn")
     .populate("varumarke", "namn")
     .populate("leverantor", "namn");

    if (!updatedProduct) {
      return res.status(404).json({ error: "Produkten hittades inte." });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete product (endast admin)
router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Produkten hittades inte." });
    }
    res.json({ message: "Produkten har tagits bort." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

