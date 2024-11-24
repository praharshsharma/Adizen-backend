const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDatabase = require("./db/connect");
require('dotenv/config');
let cookieParser = require('cookie-parser'); 
app.use(cookieParser()); 

app.use(cors());
app.options('*',cors());

//middleware
app.use(bodyParser.json());
const errorMiddleware = require('./middlewares/error');
app.use(errorMiddleware);


//import routes
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

//using routes
app.use(`/api/products`,productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);



//server and connect to database
const port = process.env.PORT || 5000;
const StartServer = async () => {
  try {
    await connectDatabase(process.env.CONNECTION_STRING);
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

  } catch (error) {
    console.log(error);
  }
};

StartServer();