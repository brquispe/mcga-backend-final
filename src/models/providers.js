const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProviderSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Products'
  }],
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  }
}, { timestamps: true });

module.exports = {
  Provider: mongoose.model('Providers', ProviderSchema)
};