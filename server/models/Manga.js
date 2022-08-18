import mongoose from 'mongoose'
const { Schema } = mongoose

const mangaSchema = new Schema({
 manga_name: {
  type: String,
  required: true
 },
 manga_thumb: {
  type: String,
  required: true
 },
 last_episode_read: {
  type: Number,
  require: true
 },
 release_day: {
  type: String,
  require: false
 },
 url_manga: {
  type: String,
  require: true
 },
 url_crawler: {
  type: String,
  require: false
 },
 site: {
  type: String,
  require: false
 }
});

export default mongoose.model('manga', mangaSchema)
