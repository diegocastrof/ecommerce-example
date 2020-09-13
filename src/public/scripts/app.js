// Storage Controller
const StorageCtrl = (function(){
  // Public Methods
  return{
    getStoredItems: function() {
      // Return an array 'items' with the items in LS, if there isn't, returns empty array
      let items;
      if (localStorage.getItem('items') === null){
        items = [];
      } else {
        items = JSON.parse(localStorage.getItem('items'));
      }
      return items
    },
    saveChanges(items) {
      // Save the new array to LS
      localStorage.setItem('items', JSON.stringify(items));
    }
  }
})();

// Product Controller
const ProductCtrl = (function(){
  // Product constructor
  const Product = function(_id, name, url_image, price, discount, categories){
    this.id = id
    this.name = name,
    this.url_image = url_image,
    this.price = price,
    this.discount = discount,
    this.categories = categories
  }
  // Data structure and state 
  const data = {
    products: StorageCtrl.getStoredItems(),
    itemsOnCart: 0,
    totalAmount: 0
  }

  // Public Methods
  return {
    // Get products from Data
    getProducts: function() {
      return data.products
    },
    getData() {
      return data
    }, 
    // Add item to Data.products array
    addItemToCart(product) {
      if (data.products.every(element => element._id !== product._id)) {
        product.count = 1
        data.products.push(product)
        return data.products
      }
      return data.products
    },
    addCount(_id) {
      const found = data.products.find(elem => elem._id === _id)
      if (!found) {
        return data.products
      }
      found.count +=1;
      return data.products
    },
    lessCount(_id) {
      const found = data.products.find(elem => elem._id === _id)
      if (!found || found.count === 0) {
        return data.products
      }
      if (found.count === 1) {
        found.count = 1
        return data.products
      }
      found.count -=1;
      return data.products
    },
    updateCount() {
      let sumItems = 0;
      let sumTotal = 0;
      data.products.forEach(element => {
        sumItems += element.count
        sumTotal += element.count*element.realPrice
      })
      data.itemsOnCart = sumItems
      data.totalAmount = sumTotal
    },
    updateCartChanges(_id, value) {
      const found = data.products.find(elem => elem._id === _id)
      if (!found || found.count === 0) {
        return data.products
      }
      found.count = Number(value);
      return data.products
    },
    removeFromCart(_id) {
      const found = data.products.find(elem => elem._id === _id)
      if (!found || found.count === 0) {
        return data.products
      }
      const result = data.products.filter(elem => elem._id !== _id)
      data.products = result
      return data.products
    },
    logData: function() {
      console.log(data)
    }
  }
})();

// UI Controller
const UICtrl = (function(){
  // Selectors
  const UISelectors = {
    // Header Selectors
    headerCart: 'header-cart',

    // Cart Selectors
    cartMain: 'cart-main',
    cartBody: 'cart-body',

    cardItemQuantifier: 'card-item-quantifier',
    card: 'card',
    main: 'main',

    purcharse: 'purcharse',
    cartBtn: 'btn-cart',
    addCart: '.add-cart',
    searchBtn: 'btn-search',
    inputSearch: 'input-search',
    clearBtn: 'btn-clear',
    saleBtn: 'btn-sale',
    realPrice: 'real-price',
    offerPrice: 'offer-price',


  }
  // Public Methods
  return{
    
    populateCart: function(products) {
      let html = '';
      products.forEach(product => {
        let priceHTML = ''
        if (product.discount > 0) {
          priceHTML = `
          <span class="text-muted"><del>$ ${product.price}</del></span>
          <span class="tex">$ ${product.realPrice}</span>
          `
        } else {
          priceHTML = `
          <span class="tex">$ ${product.realPrice}</span>
          `
        }
        
        html += `
        <div name="${product._id}" class="row">
          <div class="col-md-6">
              <div class="cart-header justify-content-start">
                  <img class="cart-img img-fluid" src="${product.url_image}" alt="product photo">
                  <p class="cart-item-title lead">${product.name}</p>
              </div>
          </div>
          <div class="col-md-2">
              <div class="cart-header text-center">
                  <p class="lead price"> 
                    ${priceHTML}                 
                  </p>
              </div>
          </div>
          <div class="col-md-4">
              <div class="cart-header text-center">
                  <input value="${product.count}" class="cart-quantifier" type="number" step="1">
                  <button class="btn btn-danger btn-remove">Remove</button>
              </div>
          </div>
        </div>
        `
      });
      document.getElementById(UISelectors.cartBody).innerHTML = html;
    },
    updateTotal(data) {
      document.getElementById('total-price').textContent = data.totalAmount
    },
    getSelectors: function() {
      return UISelectors;
    },
    getProductInfo: function(_id) {
      const productElement = document.getElementById(_id);
      // Get element from info displayed on DOM (Se ve terrible, lo se jaj)
      const product = {}
      product._id = _id
      product.name = productElement.childNodes[3].childNodes[1].textContent
      product.url_image = productElement.childNodes[1].getAttribute('src')
      
      if (productElement.childNodes[3].childNodes[3].childNodes.length === 1) {
        product.price = Number(productElement.childNodes[3].childNodes[3].childNodes[0].textContent.substring(2))
        product.discount = 0
        product.realPrice = Number(productElement.childNodes[3].childNodes[3].childNodes[0].textContent.substring(2))
      } else {
        product.price = Number(productElement.childNodes[3].childNodes[3].childNodes[1].textContent.substring(2))
        product.discount = Number(productElement.childNodes[3].childNodes[3].childNodes[5].textContent.slice(2,4))
        product.realPrice = Number(productElement.childNodes[3].childNodes[3].childNodes[3].textContent.substring(2))
      }
      // return product object 
      return product
    },
    updateCartUI(data) {
      document.getElementById(UISelectors.headerCart).textContent = data.itemsOnCart
    },
    initQuantifiers(products) {
      const itemsCards = document.getElementsByClassName(UISelectors.card)
      for (let i = 0; i < itemsCards.length; i++) {
        let item = itemsCards[i]
        let found = {}
        found = products.find(elem => elem._id === item.id)
        if (found) {
          this.showButtons(item.id)
          item.childNodes[3].lastElementChild.childNodes[3].value = found.count
        }
      }
    },
    updateItemQuantifierOnCard(_id, products) {
      const item = document.getElementById(_id)
      const quantifier = item.childNodes[3].lastElementChild.childNodes[3]
      const found = products.find(elem => elem._id === _id)
      if (!found) {
        quantifier.value = 0
      } else {
        quantifier.value = found.count
      }
    },
    showButtons(_id) {
      const cardElem = document.getElementById(_id)
      cardElem.lastElementChild.lastElementChild.classList.remove('d-none')
      cardElem.lastElementChild.childNodes[5].classList.add('d-none')
    },
    hideButtons(_id) {
      const cardElem = document.getElementById(_id)
      cardElem.lastElementChild.lastElementChild.classList.add('d-none')
      cardElem.lastElementChild.childNodes[5].classList.remove('d-none')
    },
  }
})();

// App Controller
const App = (function(ProductCtrl, StorageCtrl, UICtrl){
  
  const loadEventListeners = function(){
    const UISelectors = UICtrl.getSelectors()
    
    // Add to Cart button event
    document.getElementById(UISelectors.main).addEventListener('click', addToCart)

    // Add one button event
    document.getElementById(UISelectors.main).addEventListener('click', addOne)

    // Takes one off button event
    document.getElementById(UISelectors.main).addEventListener('click', lessOne)

    // Changes on card input event
    document.getElementById(UISelectors.main).addEventListener('change', changeOnCard)

    // Changes on cart input event
    document.getElementById(UISelectors.cartMain).addEventListener('change', changeOnCart)

    // Remove element from Cart
    document.getElementById(UISelectors.cartMain).addEventListener('click', removeFromCart)

    // Purcharse button
    document.getElementById(UISelectors.purcharse).addEventListener('click', purcharseEvent)

    // Search button
    document.getElementById(UISelectors.inputSearch).addEventListener('keyup', searchEvent)

  }

  const addToCart = function(e) {
    if (e.target.classList.contains('add-cart')){
      // Gets element id
      const _id = e.target.parentElement.parentElement.id
      // Get product information, returns a object with product
      const productInfo = UICtrl.getProductInfo(_id);
      // Saves product to data, returns array with all data on the cart
      ProductCtrl.addItemToCart(productInfo)
      // Update count on data
      ProductCtrl.updateCount()
      
      // Update products in LS
      saveLocalStorage()
      
      // Shows quantifiers buttons
      UICtrl.showButtons(_id)
      // Updates UI with changes
      updateUI(_id)

    }
    e.preventDefault()
  }
  
  const addOne = function(e) {
    if (e.target.classList.contains('add-count')){
      // Gets element id
      const _id = e.target.parentElement.parentElement.parentElement.id
      // Adds item to count
      ProductCtrl.addCount(_id)
      // Updates count on data
      ProductCtrl.updateCount()
            
      // Update products in LS
      saveLocalStorage()
      
      // Updates UI with changes
      updateUI(_id)
    }
    e.preventDefault()
  }

  const lessOne = function(e) {
    if (e.target.classList.contains('less-count')){
      // Gets element id
      const _id = e.target.parentElement.parentElement.parentElement.id
      // Takes item from count
      ProductCtrl.lessCount(_id)
      // Updates count on data
      ProductCtrl.updateCount()
            
      // Update products in LS
      saveLocalStorage()
      
      // Updates UI with changes
      updateUI(_id)
    }
    e.preventDefault()
  }

  const changeOnCard = function (e) {
    // Gets element id
    const _id = e.target.parentElement.parentElement.parentElement.id
    // Make sure of not getting negative values on quantifiers
    const input = e.target
    if (isNaN(input.value) || input.value <= 0) {
      input.value = 1
    }
    // Updates changes
    ProductCtrl.updateCartChanges(_id, input.value)
    // Updates on data
    ProductCtrl.updateCount()
        
    // Update products in LS
    saveLocalStorage()
    

    const data = ProductCtrl.getData()
    UICtrl.updateCartUI(data) 
    UICtrl.populateCart(data.products)
    UICtrl.updateTotal(data)

  }

  const changeOnCart = function (e) {
    // Gets element id
    const _id = e.target.parentElement.parentElement.parentElement.getAttribute('name')
    // Make sure of not getting negative values on quantifiers
    const input = e.target
    if (isNaN(input.value) || input.value <= 0) {
      input.value = 1
    }
    // Updates changes
    ProductCtrl.updateCartChanges(_id, input.value)
    // Updates changes
    ProductCtrl.updateCount()
        
    // Update products in LS
    saveLocalStorage()
    
    // Updates UI with changes
    updateUI(_id)
  }

  const removeFromCart = function (e) {
    if (e.target.classList.contains('btn-remove')) {
      // Gets element id
      const _id = e.target.parentElement.parentElement.parentElement.getAttribute('name')
      // Removes item from cart
      ProductCtrl.removeFromCart(_id)
      // Updates data
      ProductCtrl.updateCount()
                
      // Update products in LS
      saveLocalStorage()
      
      // Hide quantifiers 
      UICtrl.hideButtons(_id)
      // Updates UI with changes
      updateUI(_id)
    }
    e.preventDefault()
  }

  const purcharseEvent = function() {
    alert('Gracias por su tiempo!')
  }
  const searchEvent = function(e) {
    const query = document.getElementById('query')
    query.href = `store?search=${e.target.value}`
    console.log(query.href)
  }
  // /////////////////////////////////
  // Aux Functions
  
  const updateUI = function(_id) {
    const data = ProductCtrl.getData()
    
    UICtrl.updateCartUI(data) 
    UICtrl.populateCart(data.products)
    UICtrl.updateTotal(data)
    // Update quantifier on Items 
    UICtrl.updateItemQuantifierOnCard(_id, data.products)
  }

  const saveLocalStorage = function() {
    const products = ProductCtrl.getProducts()
    StorageCtrl.saveChanges(products)
  }

  return{
    init: function(){
      // Gets data on load
      const data = ProductCtrl.getData()
      // Updates info coming from LS
      ProductCtrl.updateCount()
      // Updates UI on load
      UICtrl.updateCartUI(data) 
      UICtrl.populateCart(data.products)
      UICtrl.updateTotal(data)
      UICtrl.initQuantifiers(data.products)

      // Load events listeners
      loadEventListeners();
    }
  }
})(ProductCtrl, StorageCtrl, UICtrl);

App.init();