import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Ingen token tillhandahållen' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'Ogiltig token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Ogiltig token' });
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Åtkomst nekad. Endast administratörer har tillgång till denna funktion.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Serverfel vid verifiering av admin-rättigheter' });
  }
};
