// routes/orders.js
import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

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

export default router;
