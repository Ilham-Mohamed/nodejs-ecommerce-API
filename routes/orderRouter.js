import express from 'express';
import {
  createOrder,
  getOrder,
  getOrderStats,
  getOrders,
  updateOrder,
} from '../controllers/orderController.js';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';

const orderRoutes = express.Router();

orderRoutes.post('/', isLoggedIn, createOrder);
orderRoutes.get('/', isLoggedIn, getOrders);
orderRoutes.get('/:id', isLoggedIn, getOrder);
orderRoutes.put('/update/:id', isLoggedIn, updateOrder);
orderRoutes.get('/sales/stats', isLoggedIn, getOrderStats);

export default orderRoutes;
