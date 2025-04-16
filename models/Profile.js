// profile.js (Mongoose Model)
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Assuming 'User' model for login system
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profilePic: {
    type: String,  // URL to the profile picture (or store it locally)
    default: 'default-pic-url.jpg'
  },
  about: {
    type: String,
    default: 'This is your about section. You can update it anytime.'
  },
  socialLinks: {
    linkedIn: String,
    github: String
  },
  progress: {
    type: Map,
    of: String // Storing task/progress-related information dynamically
  },
  notifications: {
    type: Array,
    default: []
  },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
