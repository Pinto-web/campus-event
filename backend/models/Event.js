const mongoose = require('mongoose');

const AgendaSchema = new mongoose.Schema({
  time: { type: String, required: true },
  title: { type: String, required: true }
}, { _id: false });

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['Hackathon', 'Workshop', 'Seminar', 'Cultural', 'Sports', 'General'],
    default: 'General'
  },
  department: {
    type: String,
    required: true,
    enum: ['Computer Science', 'Business & Management', 'Engineering', 'Arts & Humanities', 'Science', 'Student Life', 'General'],
    default: 'General'
  },
  date: {
    type: String,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    default: '10:00 AM'
  },
  location: {
    type: String,
    required: [true, 'Event location is required']
  },
  speaker: {
    type: String,
    default: 'Guest Speaker'
  },
  speakerRole: {
    type: String,
    default: 'Keynote Host'
  },
  capacity: {
    type: Number,
    required: true,
    min: [1, 'Capacity must be at least 1'],
    default: 50
  },
  registeredCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Sold Out', 'Completed', 'Cancelled'],
    default: 'Published'
  },
  bannerGradient: {
    type: String,
    default: 'from-indigo-600 to-purple-600'
  },
  tags: {
    type: [String],
    default: ['Campus']
  },
  agenda: {
    type: [AgendaSchema],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Event', EventSchema);
