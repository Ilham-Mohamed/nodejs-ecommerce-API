import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import Order from '../model/Order.js';
import Product from '../model/Product.js';
import User from '../model/User.js';
import Coupon from '../model/Coupon.js';

dotenv.config();

//stripe
const stripe = new Stripe(process.env.STRIPE_KEY);

// @desc   Create orders
// @route  POST /api/v1/orders
// @access Private

export const createOrder = asyncHandler(async (req, res) => {
  //get the coupon
  const { coupon } = req?.query;

  const couponFound = await Coupon.findOne({
    code: coupon?.toUpperCase(),
  });

  if (couponFound?.isExpired) {
    throw new Error('Coupon has expired');
  }

  if (!couponFound) {
    throw new Error('Coupon does not exists');
  }

  //get discount
  const discount = couponFound?.discount / 100;

  //Get the payload(customer, orderItems, shippingAddress, totalPrice)
  const { orderItems, shippingAddress, totalPrice } = req.body;

  //Find the user
  const user = await User.findById(req.userAuthId);

  //Check if user has shipping address
  if (!user?.hasShippingAddress) {
    throw new Error('Please provide shipping address');
  }

  //Check if order is not empty
  if (orderItems?.length <= 0) {
    throw new Error('No order Items');
  }

  //Place/Create order - save into DB
  const order = await Order.create({
    user: user?._id,
    orderItems,
    shippingAddress,
    totalPrice: couponFound ? totalPrice - totalPrice * discount : totalPrice,
  });

  //Update product qty, sold
  const products = await Product.find({
    _id: { $in: orderItems },
  });

  orderItems?.map(async (order) => {
    const product = products?.find((product) => {
      return product?._id?.toString() === order?._id?.toString();
    });
    if (product) {
      product.totalSold += order.qty;
    }
    await product.save();
  });

  //push order into user
  user.orders.push(order?._id);
  await user.save();

  //Make payment (stripe)
  //convert order items to have same structure taht stripe need
  const convertedOrders = orderItems.map((item) => {
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item?.name,
          description: item?.description,
        },
        unit_amount: item?.price * 100,
      },
      quantity: item?.qty,
    };
  });
  const session = await stripe.checkout.sessions.create({
    line_items: convertedOrders,
    metadata: {
      orderId: JSON.stringify(order?._id),
    },
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel',
  });
  res.send({ url: session.url });
});

//to retrieve all product documents from the Product collection whose IDs are included in the orderItems array.
//This allows you to get the details of multiple products based on a list of their IDs

/*
const products = await Product.find({
    _id: { $in: orderItems }, 
});
    */

// @desc   Get all orders
// @route  GET /api/v1/orders
// @access private

export const getOrders = asyncHandler(async (req, res) => {
  //Find all orders
  const orders = await Order.find();
  res.json({
    success: true,
    message: 'Orders fetched successfully',
    orders,
  });
});

// @desc   Get single order
// @route  GET /api/v1/orders/:id
// @access private/admin

export const getOrder = asyncHandler(async (req, res) => {
  //get the id from param
  const id = req.params.id;
  const order = await Order.findById(id);

  res.json({
    success: true,
    message: 'Single order fetched successfully',
    order,
  });
});

// @desc   Update order to delivered
// @route  GET /api/v1/orders/update/:id
// @access private/admin

export const updateOrder = asyncHandler(async (req, res) => {
  //get the id from param
  const id = req.params.id;

  //update
  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    success: true,
    message: 'Order updated',
    updatedOrder,
  });
});

// @desc   get sales sum of orders
// @route  GET /api/v1/orders/sales/sum
// @access private/admin

export const getOrderStats = asyncHandler(async (req, res) => {
  //get order stats
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        minimumSale: {
          $min: '$totalPrice',
        },
        totalSales: {
          $sum: '$totalPrice',
        },
        maximumSale: {
          $max: '$totalPrice',
        },
        averageSale: {
          $avg: '$totalPrice',
        },
      },
    },
  ]);

  //get the data
  const date = new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const saleToday = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: today,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: '$totalPrice',
        },
      },
    },
  ]);

  //send response
  res.status(200).json({
    success: true,
    message: 'Sum of orders',
    orders,
    saleToday,
  });
});
