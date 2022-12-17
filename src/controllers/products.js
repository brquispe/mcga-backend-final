const conn = require('../models/connection');
const { Product } = require('../models/product');
const { Provider } = require('../models/provider');

const getProductList = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false }).populate({
      path: 'provider',
      match: { isDeleted: false },
      select: { name: true },
    });
    return res.json({
      message: products.length > 0 ? 'Products found' : 'Products not found',
      data: products,
      error: false,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(error.status || 400).json({
      error: true,
      message: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  const product = {
    name: req.body.name,
    price: req.body.price,
    ...(req.body.providerId && { provider: { _id: req.body.providerId } }),
  };
  try {
    const session = await conn.startSession();
    let newProduct;
    await session.withTransaction(async () => {
      const newProduct = new Product(product);
      const createdProduct = await newProduct.save({ session });
      if (req.body.providerId) {
        await Provider.findByIdAndUpdate(
          req.body.providerId,
          {
            $addToSet: {
              products: createdProduct,
            },
          },
          { session }
        );
      }

      newProduct = createdProduct;
      return createdProduct;
    });
    session.endSession();

    return res.status(201).json({
      message: 'Product created!',
      data: newProduct,
      error: false,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      data: product,
      error: true,
    });
  }
};

const getProduct = async (req, res) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found!',
        data: undefined,
        error: true,
      });
    }

    return res.json({
      message: 'Product found',
      data: product,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error,
      data: undefined,
      error: true,
    });
  }
};

const updateProduct = async (req, res) => {
  const productId = req.params.productId;
  const newData = {
    name: req.body.name,
    price: req.body.price,
    ...(req.body.providerId && { provider: { _id: req.body.providerId } }),
  };
  try {
    const session = await conn.startSession();
    let product;

    await session.withTransaction(async () => {
      product = await Product.findByIdAndUpdate(
        productId,
        { $set: newData },
        { session, new: true }
      );
      if (!product) {
        return res.status(404).json({
          message: 'Product not found!',
          data: undefined,
          error: true,
        });
      }

      if (newData.providerId) {
        const resp = await Provider.findByIdAndUpdate(
          newData.providerId,
          {
            $addToSet: { products: product },
          },
          { session }
        );
        product.provider = resp;
      }
    });

    return res.json({
      message: 'Product updated!',
      data: product,
      error: false,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      data: newData,
      error: true,
    });
  }
};

const deleteProduct = async (req, res) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found!',
        data: undefined,
        error: true,
      });
    }
    product.isDeleted = true;
    const result = await product.save();
    return res.status(204).json({
      message: 'Deleted product!',
      data: result,
      error: false,
    });
  } catch (error) {
    return res.status(400).json({
      message: error,
      data: product,
      error: true,
    });
  }
};

const activateProduct = async (req, res) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found!',
        data: undefined,
        error: true,
      });
    }
    product.isDeleted = false;
    const result = await product.save();
    return res.status(204).json({
      message: 'Activated product!',
      data: result,
      error: false,
    });
  } catch (error) {
    return res.status(400).json({
      message: error,
      data: product,
      error: true,
    });
  }
};

module.exports = {
  getProductList,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  activateProduct,
};
