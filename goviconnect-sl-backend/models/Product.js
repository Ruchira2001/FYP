const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    nameSi: String,
    category: {
      type: String,
      required: true,
    },
    description: String,
    targetDisease: String,
    targetCrops: [String],
    dosage: String,
    price: {
      type: Number,
      required: true,
    },
    unit: String,
    emoji: String,
    imageUrl: String,
    stock: {
      type: Number,
      default: 0,
    },
    availability: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
    },
    manufacturer: String,
    activeIngredient: String,
  },
  {
    timestamps: true,
  }
);

productSchema.index({ shopId: 1 });
productSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('Product', productSchema);
