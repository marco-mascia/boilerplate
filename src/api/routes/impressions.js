
const express = require('express');
const router = express.Router();

const csv = require('csv-parser')
const fs = require('fs')
const results = [];

fs.createReadStream("../../assets/data.csv")
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(results);
  });


router.get('/', (req, res, next) => {
    res.status(200).json(results)
});

module.exports = router;
