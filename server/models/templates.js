const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Template identifier
  subject: { type: String, required: true }, // Email subject
  body: { type: String, required: true }, // Email body with placeholders
  placeholders: [String] // Array of placeholder keys (optional for clarity)
});

module.exports = mongoose.model('Template', templateSchema);
