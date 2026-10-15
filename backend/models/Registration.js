const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  eventTitle: {
    type: String,
    required: true
  },
  eventDate: {
    type: String,
    required: true
  },
  eventTime: {
    type: String,
    default: '10:00 AM'
  },
  eventLocation: {
    type: String,
    default: 'Main Auditorium'
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  studentEmail: {
    type: String,
    required: [true, 'Student email is required'],
    trim: true,
    lowercase: true
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true
  },
  department: {
    type: String,
    default: 'Computer Science'
  },
  passCode: {
    type: String,
    required: true,
    unique: true
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: {
    type: Date,
    default: null
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index to prevent duplicate registrations for the same event and student
RegistrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });
RegistrationSchema.index({ eventId: 1, studentEmail: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
