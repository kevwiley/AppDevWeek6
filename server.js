// Postman link: https://documenter.getpostman.com/view/52247049/2sBXcDHMWt

// Import packages, initialize an express app, and define the port you will use
const express = require("express");
const app = express();
app.use(express.json());
const port = 3000;


app.listen(port, () => {
    console.log(`Menu API Server running at http://localhost:${port} `);
});

// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Define routes and implement middleware here

const {body, validationResult} = require('express-validator');
const menuValidation = [ //checks that each part of the menu item is valid
  body('name').isString().trim().isLength({ min: 3}).withMessage('Item must be a string with at least 3 characters.'),
  body('description').isString().trim().isLength({ min: 10 }).withMessage('Description must be string with at least 10 characters.'),
  body('price').isFloat({ gt: 0}).withMessage('Price must be a number greater than 0.'),
  body('category').isIn(['appetizer', 'entree', 'dessert', 'beverage'])
  .withMessage('Categorymust be appetizer, entree, dessert, or beverage'),
  body('ingredients').isArray({ min: 1 }).withMessage('Ingredients must be an array with at least 1 item.'),
  body('available').optional().isBoolean().withMessage('Availability must be a boolean.').default(true)
];


const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`); //logs timestamp method and url

  if (req.method === 'POST' || req.method === 'PUT') { //if the request if a post or put also gets specifically what is being posted or put
    console.log('Request Body:',
      JSON.stringify(req.body, null, 2)
    );
    }
  
  next();
};

const errorHandling = (req, res, next) => {//will display errors if validation fails
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array().map(error => error.msg); //displays each message cleanly
    return res.status(400).json({ Error: "Validation Fail", Message: errorMessage });
  }
  next();
};

app.use(requestLogger)

app.get("/api/menu", (req, res) => {
  res.status(200).json(menuItems); //returns 200 status on success
});

app.get("/api/menu/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const item = menuItems.find(menuItem => menuItem.id === id); //gets item using specific id

  if (item) { //handles errors and returns staus
    res.status(200).json(item);
  } else {
    return res.status(404).json({ Error: "Menu Item Not Found"});
  }

});

app.post("/api/menu", menuValidation, errorHandling, (req, res) => { //covered by error handling
  const { name, description, price, category, ingredients, available } = req.body;

  const newItem = {
    id: menuItems.length + 1, //makes new id
    name,
    description,
    price,
    category,
    ingredients,
    available
  };

  menuItems.push(newItem); //adds new item and return 201 on success
  res.status(201).json(newItem);
});

app.put("/api/menu/:id", menuValidation, errorHandling, (req, res) => {
  const itemId = parseInt(req.params.id);

  const { name, description, price, category, ingredients, available } = req.body;


  const itemIndex = menuItems.findIndex(item => item.id === itemId); //finds item

  if (itemIndex === -1) { //checks that the item exists
    return res.status(404).json({ Error: "Menu Item Not Found"});
  }

  menuItems[itemIndex] = {
    id: itemId, //makes sure that id doesnt change
    name,
    description,
    price,
    category,
    ingredients,
    available
  };
  res.status(200).json(menuItems[itemIndex]);
});

app.delete("/api/menu/:id", (req, res) => {
  const itemId = parseInt(req.params.id);
  const itemIndex = menuItems.findIndex(item => item.id === itemId);

  if (itemIndex === -1) { //checks that the item exists
    return res.status(404).json({ Error: "Menu Item Not Found"});
  }

  const deletedItem = menuItems.splice(itemIndex, 1)[0]; //removes item from array

  res.status(200).json({ message: "Menu Item Deleted Successfully", deletedItem });

});

module.exports = app;