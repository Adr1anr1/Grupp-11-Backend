import express from "express";
import Supplier from "../models/Supplier.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 