import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import Category from "../src/models/Category.js";
import Product from "../src/models/Product.js";
import Brand from "../src/models/Brand.js";
import Supplier from "../src/models/Supplier.js";

dotenv.config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Rensa databasen
    await Category.deleteMany();
    await Product.deleteMany();
    await Brand.deleteMany();
    await Supplier.deleteMany();

    // Ladda kategorier
    const categoriesData = JSON.parse(fs.readFileSync("./src/data/categories.json"));
    const createdCategories = await Category.insertMany(categoriesData);
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.namn.toLowerCase()] = cat._id;
    });

    // Ladda produkter
    const productsData = JSON.parse(fs.readFileSync("./src/data/products.json"));

    // Skapa varumärken
    const uniqueBrands = [...new Set(productsData.map(p => p["varumärke"]).filter(Boolean))];
    const brandsData = uniqueBrands.map(namn => ({ namn }));
    const createdBrands = await Brand.insertMany(brandsData);

    // Skapa brand-lookup
    const brandMap = {};
    createdBrands.forEach(brand => {
      brandMap[brand.namn] = brand._id;
    });

    // Ladda leverantörer från suppliers.json
    const suppliersData = JSON.parse(fs.readFileSync("./src/data/suppliers.json"));
    const createdSuppliers = await Supplier.insertMany(suppliersData);

    // Skapa leverantör-lookup
    const supplierMap = {};
    createdSuppliers.forEach(supplier => {
      supplierMap[supplier.namn] = supplier._id;
    });

    // Mappa produkter
    const productsWithRefs = productsData.map(p => {
      // Hämta leverantörsnamn från produkten
      const leverantorNamn = p["leverantör"] || p.leverantör || "Ingen Leverantör Angiven"; // Defaulta till Ingen Leverantör Angiven om leverantör saknas
      
      return {
        namn: p.namn || p.name,
        beskrivning: p.beskrivning || p.description || "",
        pris: p.pris || p.price,
        kategorier: (p.kategorier || p.category || [])
          .map(namn => categoryMap[namn.toLowerCase()])
          .filter(Boolean),
        varumarke: brandMap[p["varumärke"]] || null,
        leverantor: supplierMap[leverantorNamn], // Använd korrekt leverantörs-ID baserat på namn
        jamforpris: p["jämförelsepris"] || "",
        innehallsforteckning: p["innehållsförteckning"] || "",
        bild: p.bild || "",
        mangd: p.mängd || p.mangd || ""
      };
    });

    await Product.insertMany(productsWithRefs);

    console.log("✅ Seed complete!");
    process.exit();
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seedDatabase();
