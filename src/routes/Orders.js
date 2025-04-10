// routes/orders.js
import express from 'express';
import Order from '../models/Order.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/orders - Hämta alla beställningar (endast admin)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate({
      path: 'produkter.produktId',
      model: 'Product',
      select: 'namn pris bild beskrivning mangd varumarke'
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders - Skapa ny beställning
router.post('/', async (req, res) => {
  try {
    // Hämta data från body:
    const {
      produkter,
      totalsumma,
      fornamn,
      efternamn,
      gatuadress,
      postnr,
      postort,
      mobil,
      mejl,
      anmarkning
    } = req.body;

    // Skapa ny order
    const order = new Order({
      produkter,
      totalsumma,
      fornamn,
      efternamn,
      gatuadress,
      postnr,
      postort,
      mobil,
      mejl,
      anmarkning
    });

    // Spara i databasen
    const savedOrder = await order.save();

    // Returnera order + meddelande om att man ska swisha
    res.status(201).json({
      message: `Tack för din beställning! Vänligen swisha ${totalsumma} kr till 123 456. Vi levererar snarast och sms:ar innan.`,
      order: savedOrder
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Uppdatera orderstatus (endast admin)
router.put('/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validera status
    if (!status || !['ny', 'betald', 'plockas', 'plockad', 'levererad'].includes(status)) {
      return res.status(400).json({ error: "Ogiltig status" });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate({
      path: 'produkter.produktId',
      model: 'Product',
      select: 'namn pris bild beskrivning'
    });
    
    if (!updatedOrder) {
      return res.status(404).json({ error: "Beställningen hittades inte" });
    }
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
