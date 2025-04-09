import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  anvandare: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  produkter: [{
    produkt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    antal: {
      type: Number,
      required: true,
      min: 1
    },
    pris: {
      type: Number,
      required: true
    }
  }],
  totalPris: {
    type: Number,
    required: true
  },
  leveransAdress: {
    namn: { type: String, required: true },
    efternamn: { type: String, required: true },
    email: { type: String, required: true },
    telefon: { type: String, required: true },
    gatunamn: { type: String, required: true },
    postnummer: { type: String, required: true },
    stad: { type: String, required: true },
    land: { type: String, required: true },
    info: { type: String }  // Valfri extra information
  },
  status: {
    type: String,
    enum: ["väntande", "bekräftad", "skickad", "levererad", "avbruten"],
    default: "väntande"
  },
  betalningsStatus: {
    type: String,
    enum: ["väntande", "betald", "återbetald"],
    default: "väntande"
  }
}, {
  timestamps: true
});

export default mongoose.model("Order", orderSchema); 