const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    minlength: 2,
    maxlength: 50
  },
  resource: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
    unique: true
  }
  // isAdmin: Boolean
});

const User = mongoose.model('User', userSchema, 'Twilio_users');

exports.User = User;
