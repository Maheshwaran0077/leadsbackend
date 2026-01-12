const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePic: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['superAdmin', 'trainer', 'student'], default: 'student' },
  // Trainer-specific
  course: { type: String },
  salary: { type: String },
  contactNumber: { type: String },

  // Student-specific
  age: Number,
  parentName: String,
  parentOccupation: String,
  fee: String,
  coach: String,
  documents: [String],// array of image URLs or file names,
  mobile: String,
  alternateMobile: String,
  dateOfJoin: Date, // New Field
   

  videos: [{
    title: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]


}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
