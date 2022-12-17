const { PORT } = require('./config/environment');
const express = require('express');
const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH',
    'DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.use('/auth', authRouter);
app.use(productsRouter);

require('./models/connection');
app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));

module.exports = app;
