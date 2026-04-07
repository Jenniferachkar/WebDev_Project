import mongoose from 'mongoose'

const { Schema } = mongoose

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // en euros
  priceUSDC: { type: Number }, // prix en USDC (stablecoin)
  category: {
    type: String,
    enum: ['t-shirts', 'pantalons', 'robes', 'vestes', 'accessoires', 'chaussures'],
    required: true,
  },
  sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] }],
  colors: [String],
  images: [String],
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Product', productSchema)
