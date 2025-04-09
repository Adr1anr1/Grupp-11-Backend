import express from "express";
import Product from "../models/Product.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all products (öppet för alla)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("kategorier", "namn")
      .populate("varumarke", "namn")
      .populate("leverantor", "namn");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Kunde inte hämta produkter: " + error.message });
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
      return res.status(404).json({ error: "Produkten hittades inte" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Kunde inte hämta produkten: " + error.message });
  }
});

// Create product (endast admin)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    // Populera referenser innan vi skickar tillbaka produkten
    const populatedProduct = await Product.findById(product._id)
      .populate("kategorier", "namn")
      .populate("varumarke", "namn")
      .populate("leverantor", "namn");
      
    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(400).json({ error: "Kunde inte skapa produkt: " + error.message });
  }
});

// Update product (endast admin)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("kategorier", "namn")
     .populate("varumarke", "namn")
     .populate("leverantor", "namn");

    if (!product) {
      return res.status(404).json({ error: "Produkten hittades inte" });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: "Kunde inte uppdatera produkt: " + error.message });
  }
});

// Delete product (endast admin)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Produkten hittades inte" });
    }
    res.json({ message: "Produkten har tagits bort" });
  } catch (error) {
    res.status(500).json({ error: "Kunde inte ta bort produkt: " + error.message });
  }
});

export default router;

