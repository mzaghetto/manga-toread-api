import mongoose from 'mongoose';
const { Schema } = mongoose;

// Stores HTTP headers returned by the scrape service
const headerSchema = new Schema({
  name: { type: String, required: true, unique: true },
  value: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('header', headerSchema);