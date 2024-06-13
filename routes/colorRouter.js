import express from 'express';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import {
  createColor,
  deleteColor,
  getColor,
  getcolors,
  updateColor,
} from '../controllers/colorController.js';
import isAdmin from '../middlewares/isAdmin.js';

const colorRoutes = express.Router();

colorRoutes.post('/', isLoggedIn, isAdmin, createColor);
colorRoutes.get('/', getcolors);
colorRoutes.get('/:id', getColor);
colorRoutes.put('/:id', isLoggedIn, isAdmin, updateColor);
colorRoutes.delete('/:id', isLoggedIn, isAdmin, deleteColor);

export default colorRoutes;
