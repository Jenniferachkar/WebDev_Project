import mongoose from 'mongoose'

const { Schema } = mongoose

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  size: String,
  color: String,
})

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalEUR: { type: Number, required: true },
  totalUSDC: { type: Number },
  paymentMethod: {
    type: String,
    enum: ['card', 'usdc', 'token'],
    required: true,
  },
  couponCode: String,
  discountEUR: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  stripePaymentIntentId: String,
  txHash: String, // transaction hash crypto
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)
