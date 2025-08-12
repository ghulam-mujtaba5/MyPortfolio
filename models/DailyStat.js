// models/DailyStat.js
import mongoose from 'mongoose';

const DailyStatSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true, // Only one entry per day
  },
  articleViews: {
    type: Number,
    default: 0,
  },
  projectViews: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.models.DailyStat || mongoose.model('DailyStat', DailyStatSchema);
