var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("home page");
});

/* GET all drinks */
router.get('/drinks', function(req, res) {
    makecocktails();
  res.send("drinks page");
});

/* GET drink description */
router.get('/drinks/:drinkname', function(req, res) {
  res.send("page for a specific_drink");
});

module.exports = router;
