import mongoose from "mongoose";
//Ska testa att reverta git
const productSchema = new mongoose.Schema({
  namn: {
    type: String,
    required: true,
    trim: true
  },
  beskrivning: {
    type: String,
    default: ""
  },
  pris: {
    type: Number,
    required: true,
    min: 0
  },
  kategorier: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    }],
    varumarke: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand"
    },
    leverantor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier"
    },
    jamforpris: {
      type: String
    },
    innehallsforteckning: {
      type: String
    },
    bild: {
      type: String
    },
    mangd: {
      type: String
    },
  
}, {
  timestamps: true,
});

export default mongoose.model("Product", productSchema);
