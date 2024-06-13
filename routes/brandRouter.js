import express from 'express';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import {
  createBrand,
  deleteBrand,
  getBrand,
  getBrands,
  updateBrand,
} from '../controllers/brandController.js';
import isAdmin from '../middlewares/isAdmin.js';

const brandRoutes = express.Router();

brandRoutes.post('/', isLoggedIn, isAdmin, createBrand);
brandRoutes.get('/', getBrands);
brandRoutes.get('/:id', getBrand);
brandRoutes.put('/:id', isLoggedIn, isAdmin, updateBrand);
brandRoutes.delete('/:id', isLoggedIn, isAdmin, deleteBrand);

export default brandRoutes;
