const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return !users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required."});
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: "Invalid username or password."});
  }

  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken };
  return res.status(200).json({message: "User successfully logged in", accessToken});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.user;
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!review) {
    return res.status(400).json({message: "Review text is required as a query parameter."});
  }

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found."});
  }

  books[isbn].reviews = books[isbn].reviews || {};
  books[isbn].reviews[username] = review;

  return res.status(200).json({message: "Review successfully posted/updated.", reviews: books[isbn].reviews});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.user;
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found."});
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({message: "Review not found for this user."});
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({message: "Review deleted successfully.", reviews: books[isbn].reviews});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
