import express from 'express';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  getCoupons,
  updateCoupon,
} from '../controllers/couponController.js';
import isAdmin from '../middlewares/isAdmin.js';

const couponRoutes = express.Router();

couponRoutes.post('/', isLoggedIn, isAdmin, createCoupon);
couponRoutes.get('/', getCoupons);
couponRoutes.get('/:id', getCoupon);
couponRoutes.put('/:id', isLoggedIn, isAdmin, updateCoupon);
couponRoutes.delete('/:id', isLoggedIn, isAdmin, deleteCoupon);

export default couponRoutes;
