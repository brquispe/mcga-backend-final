const mongoose = require('mongoose');
const { DATABASE_URL } = require('../config/environment');

mongoose.connect(DATABASE_URL).then(() => {
  console.log('DB connected');
}).catch(err => {
  console.log('There was an error on the DB connection');
  console.log(err);
});

const conn = mongoose.connection;

module.exports = conn
