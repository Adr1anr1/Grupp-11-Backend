import express from "express";
import Brand from "../models/Brand.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 