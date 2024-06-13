import express from 'express';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from '../controllers/categoryController.js';
import categoryFileUpload from '../config/categoryUpload.js';
import isAdmin from '../middlewares/isAdmin.js';

const categoryRoutes = express.Router();

categoryRoutes.post(
  '/',
  isLoggedIn,
  isAdmin,
  categoryFileUpload.single('file'),
  createCategory
);
categoryRoutes.get('/', getCategories);
categoryRoutes.get('/:id', getCategory);
categoryRoutes.put('/:id', isLoggedIn, isAdmin, updateCategory);
categoryRoutes.delete('/:id', isLoggedIn, isAdmin, deleteCategory);

export default categoryRoutes;
