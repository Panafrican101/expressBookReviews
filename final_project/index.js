const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

const ACCESS_TOKEN_SECRET = "access";

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
  if (!req.session || !req.session.authorization || !req.session.authorization.accessToken) {
    return res.status(403).json({message: "Access denied. Log in to continue."});
  }

  const accessToken = req.session.authorization.accessToken;
  try {
    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    req.user = decoded.username || decoded.user || decoded;
    next();
  } catch (err) {
    return res.status(401).json({message: "Invalid access token."});
  }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
