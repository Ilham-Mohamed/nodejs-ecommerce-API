import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from '../controllers/productController.js';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import upload from '../config/fileUpload.js';
import isAdmin from '../middlewares/isAdmin.js';

const productRoutes = express.Router();

productRoutes.post(
  '/',
  isLoggedIn,
  isAdmin,
  upload.array('files'),
  createProduct
);

productRoutes.get('/', getProducts);
productRoutes.get('/:id', getProduct);
productRoutes.put('/:id', isLoggedIn, isAdmin, updateProduct);
productRoutes.delete('/:id', isLoggedIn, isAdmin, deleteProduct);

export default productRoutes;
