import express from "express";
import Product from "../models/Product.js";
import { auth, adminAuth } from "../middleware/auth.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import Supplier from "../models/Supplier.js";

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
    // Validera grundläggande fält
    const requiredFields = ['namn', 'pris', 'beskrivning', 'bild', 'mangd', 'innehallsforteckning', 'jamforpris'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Följande fält saknas: ${missingFields.join(', ')}` });
    }
    
    // Validera att bild är en giltig URL
    if (!isValidURL(req.body.bild)) {
      return res.status(400).json({ error: "Ogiltig bild-URL" });
    }
    
    // Förbered produktdata
    const productData = { ...req.body };
    
    // Hantera kategorier (kan vara namn eller ID:n)
    if (req.body.kategorier && Array.isArray(req.body.kategorier)) {
      const categoryIds = [];
      
      for (const category of req.body.kategorier) {
        // Om det är ett namn, hitta eller skapa kategori
        if (typeof category === 'string' && !mongoose.Types.ObjectId.isValid(category)) {
          // Använd case-insensitive sökning med regex
          let categoryDoc = await Category.findOne({ 
            namn: { $regex: new RegExp(`^${category}$`, 'i') } 
          });
          
          // Om kategorin inte finns, skapa den med formaterad första bokstav stor
          if (!categoryDoc) {
            const formattedName = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
            categoryDoc = await Category.create({ namn: formattedName });
          }
          
          categoryIds.push(categoryDoc._id);
        } else {
          // Om det är ett giltigt ID, använd det
          categoryIds.push(category);
        }
      }
      
      productData.kategorier = categoryIds;
    }
    
    // Hantera varumärke (kan vara namn eller ID)
    if (req.body.varumarke && typeof req.body.varumarke === 'string' && !mongoose.Types.ObjectId.isValid(req.body.varumarke)) {
      // Case-insensitive sökning
      let brandDoc = await Brand.findOne({ 
        namn: { $regex: new RegExp(`^${req.body.varumarke}$`, 'i') } 
      });
      
      if (!brandDoc) {
        const formattedName = req.body.varumarke.charAt(0).toUpperCase() + req.body.varumarke.slice(1).toLowerCase();
        brandDoc = await Brand.create({ namn: formattedName });
      }
      
      productData.varumarke = brandDoc._id;
    }
    
    // Hantera leverantör (kan vara namn eller ID)
    if (req.body.leverantor && typeof req.body.leverantor === 'string' && !mongoose.Types.ObjectId.isValid(req.body.leverantor)) {
      // Case-insensitive sökning
      let supplierDoc = await Supplier.findOne({ 
        namn: { $regex: new RegExp(`^${req.body.leverantor}$`, 'i') } 
      });
      
      if (!supplierDoc) {
        const formattedName = req.body.leverantor.charAt(0).toUpperCase() + req.body.leverantor.slice(1).toLowerCase();
        supplierDoc = await Supplier.create({ namn: formattedName });
      }
      
      productData.leverantor = supplierDoc._id;
    }
    
    // Skapa produkten med behandlad data
    const product = new Product(productData);
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
    // Validera grundläggande fält
    const requiredFields = ['namn', 'pris', 'beskrivning', 'bild', 'mangd', 'innehallsforteckning', 'jamforpris'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Följande fält saknas: ${missingFields.join(', ')}` });
    }
    
    // Validera att bild är en giltig URL
    if (!isValidURL(req.body.bild)) {
      return res.status(400).json({ error: "Ogiltig bild-URL" });
    }
    
    // Förbered produktdata
    const productData = { ...req.body };
    
    // Hantera kategorier (kan vara namn eller ID:n)
    if (req.body.kategorier && Array.isArray(req.body.kategorier)) {
      const categoryIds = [];
      
      for (const category of req.body.kategorier) {
        // Om det är ett namn, hitta eller skapa kategori
        if (typeof category === 'string' && !mongoose.Types.ObjectId.isValid(category)) {
          // Använd case-insensitive sökning med regex
          let categoryDoc = await Category.findOne({ 
            namn: { $regex: new RegExp(`^${category}$`, 'i') } 
          });
          
          // Om kategorin inte finns, skapa den med formaterad första bokstav stor
          if (!categoryDoc) {
            const formattedName = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
            categoryDoc = await Category.create({ namn: formattedName });
          }
          
          categoryIds.push(categoryDoc._id);
        } else {
          // Om det är ett giltigt ID, använd det
          categoryIds.push(category);
        }
      }
      
      productData.kategorier = categoryIds;
    }
    
    // Hantera varumärke (kan vara namn eller ID)
    if (req.body.varumarke && typeof req.body.varumarke === 'string' && !mongoose.Types.ObjectId.isValid(req.body.varumarke)) {
      // Case-insensitive sökning
      let brandDoc = await Brand.findOne({ 
        namn: { $regex: new RegExp(`^${req.body.varumarke}$`, 'i') } 
      });
      
      if (!brandDoc) {
        const formattedName = req.body.varumarke.charAt(0).toUpperCase() + req.body.varumarke.slice(1).toLowerCase();
        brandDoc = await Brand.create({ namn: formattedName });
      }
      
      productData.varumarke = brandDoc._id;
    }
    
    // Hantera leverantör (kan vara namn eller ID)
    if (req.body.leverantor && typeof req.body.leverantor === 'string' && !mongoose.Types.ObjectId.isValid(req.body.leverantor)) {
      // Case-insensitive sökning
      let supplierDoc = await Supplier.findOne({ 
        namn: { $regex: new RegExp(`^${req.body.leverantor}$`, 'i') } 
      });
      
      if (!supplierDoc) {
        const formattedName = req.body.leverantor.charAt(0).toUpperCase() + req.body.leverantor.slice(1).toLowerCase();
        supplierDoc = await Supplier.create({ namn: formattedName });
      }
      
      productData.leverantor = supplierDoc._id;
    }
    
    // Uppdatera produkten
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    )
      .populate("kategorier", "namn")
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

// Hjälpfunktion för att validera URL:er
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export default router;