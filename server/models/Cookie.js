import mongoose from 'mongoose';
const { Schema } = mongoose;

const cookieSchema = new Schema({
  name: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  path: { type: String },
  domain: { type: String },
  secure: { type: Boolean },
  httpOnly: { type: Boolean },
  expires: { type: Date },
}, { timestamps: true });

export default mongoose.model('cookie', cookieSchema);