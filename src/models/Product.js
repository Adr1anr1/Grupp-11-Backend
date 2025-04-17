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
    min: 0,
    get: function(num) {
      return num.toString().replace('.', ',');
    }
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
      type: String,
      get: function(text) {
        if (!text) return text;
        return text.replace(/(\d+)\.(\d+)/g, '$1,$2');
      }
    },
    innehallsforteckning: {
      type: String
    },
    bild: {
      type: String
    },
    mangd: {
      type: String
    }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

export default mongoose.model("Product", productSchema);
