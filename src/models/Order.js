// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  produkter: [
    {
      produktId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // refererar till din 'Product'-modell om du vill
        required: true
      },
      antal: {
        type: Number,
        required: true
      }
    }
  ],
  totalsumma: {
    type: Number,
    required: true
  },

  // Kunduppgifter
  förnamn: { type: String, required: true },
  efternamn: { type: String, required: true },
  gatuadress: { type: String, required: true },
  postnr: { type: String, required: true },
  postort: { type: String, required: true },
  mobil: { type: String, required: true },
  mejl: { type: String, required: true },
  anmärkning: { type: String }, // valfri

  // Statusfält
  status: {
    type: String,
    enum: ['ny', 'betald', 'plockas', 'plockad', 'levererad'],
    default: 'ny'
  }
}, {
  timestamps: true // Skapar createdAt & updatedAt automatiskt
});

export default mongoose.model('Order', orderSchema);
