const express = require('express')
const path = require('path')
require('./db/mongoose')

const productRouter = require('./routers/product')

const port = process.env.PORT
const app = express() 


app.use(express.json())
app.set('view engine', 'ejs')

app.use(express.static(__dirname + "/public"))
app.set('views', path.join(__dirname, '/views'))

// Routers
app.use(productRouter)


// Server
app.listen(port, () => {
  console.log(`Server up in port ${port}`)
})