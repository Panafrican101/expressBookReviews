const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const SERVER_URL = "http://localhost:5000";

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required."});
  }

  if (!isValid(username)) {
    return res.status(400).json({message: "Username already exists."});
  }

  users.push({ username, password });
  return res.status(200).json({message: "User successfully registered. You can now login."});
});

// Internal routes used by async/await Axios handlers
public_users.get('/internal/books', (req, res) => {
  return res.status(200).json(books);
});

public_users.get('/internal/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }
  return res.status(404).json({message: "Book not found."});
});

public_users.get('/internal/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const filteredBooks = Object.keys(books)
    .filter((isbn) => books[isbn].author.toLowerCase() === author)
    .map((isbn) => ({ isbn, ...books[isbn] }));

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  }

  return res.status(404).json({message: "No books found for the given author."});
});

public_users.get('/internal/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const filteredBooks = Object.keys(books)
    .filter((isbn) => books[isbn].title.toLowerCase() === title)
    .map((isbn) => ({ isbn, ...books[isbn] }));

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  }

  return res.status(404).json({message: "No books found for the given title."});
});

// Public routes using async/await with axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${SERVER_URL}/internal/books`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({message: "Unable to fetch book list."});
  }
});

public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${SERVER_URL}/internal/isbn/${isbn}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(404).json({message: "Book not found."});
  }
});
  
public_users.get('/author/:author', async function (req, res) {
  const author = encodeURIComponent(req.params.author);
  try {
    const response = await axios.get(`${SERVER_URL}/internal/author/${author}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(404).json({message: "No books found for the given author."});
  }
});

public_users.get('/title/:title', async function (req, res) {
  const title = encodeURIComponent(req.params.title);
  try {
    const response = await axios.get(`${SERVER_URL}/internal/title/${title}`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(404).json({message: "No books found for the given title."});
  }
});

public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({message: "Book not found."});
});

module.exports.general = public_users;
