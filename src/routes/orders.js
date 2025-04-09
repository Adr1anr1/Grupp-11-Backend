import express from "express";
import Order from "../models/Order.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// Skapa ny beställning (inloggade användare)
router.post("/", verifyToken, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      anvandare: req.user._id
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: "Kunde inte skapa beställning: " + error.message });
  }
});

// Hämta användarens egna beställningar
router.get("/mina", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ anvandare: req.user._id })
      .populate("produkter.produkt")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Kunde inte hämta beställningar: " + error.message });
  }
});

// Hämta en specifik beställning (användare eller admin)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("produkter.produkt")
      .populate("anvandare", "username email");
    
    if (!order) {
      return res.status(404).json({ error: "Beställningen hittades inte" });
    }

    // Kontrollera om användaren har rätt att se beställningen
    if (!req.user.isAdmin && order.anvandare.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Åtkomst nekad" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Kunde inte hämta beställningen: " + error.message });
  }
});

// Uppdatera beställningsstatus (endast admin)
router.put("/:id/status", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status, betalningsStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, betalningsStatus },
      { new: true, runValidators: true }
    ).populate("produkter.produkt");

    if (!order) {
      return res.status(404).json({ error: "Beställningen hittades inte" });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: "Kunde inte uppdatera beställningen: " + error.message });
  }
});

// Hämta alla beställningar (endast admin)
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("produkter.produkt")
      .populate("anvandare", "username email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Kunde inte hämta beställningar: " + error.message });
  }
});

export default router; 