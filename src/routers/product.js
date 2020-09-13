const express = require('express')
const Product = require('../models/product-model')

const router = new express.Router()

// Main store - shows the items
router.get('/store', async (req, res) => {
  
  // Sorting, filtering and paginating query handeling
  // Check field 'completed' on query
  let match = {}
  const sort = {}

  
  if (req.query.search) {
    match =  { 
      name : { 
        $regex: new RegExp(req.query.search)  
      } 
    } 
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split('_')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 
  }
  
  try {
    const products = await Product.find(match).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip)).sort(sort)
    res.render('store/main', {products})
  } catch (error) {
    res.send(error)
  }
})

router.get('/store/new', async (req, res) => {
  res.render('store/new')
})

// Adds a new item to DB
router.post('/store', async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.send(product)
  } catch(error){
    res.send(error)
  }  
})

// Deletes one product from DB
router.delete('/store/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.redirect('/store')
  } catch (error) {
    res.send(error)
  }
})

// Erase all products from DB
router.delete('/store', async (req, res) => {
  try {
    await Product.deleteMany({})
    res.redirect('/store')
  } catch (error) {
    res.send(error)
  }
})

module.exports = router