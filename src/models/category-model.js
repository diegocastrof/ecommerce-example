const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  categories: [{
    category: {
      type: String,
      required: true
    }
  }]
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category