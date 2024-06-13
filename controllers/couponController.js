import asyncHandler from 'express-async-handler';
import Coupon from '../model/Coupon.js';

// @desc   Create new Coupon
// @route  POST /api/v1/coupons
// @access Private/Admin

export const createCoupon = asyncHandler(async (req, res) => {
  const { code, startDate, endDate, discount } = req.body;
  // check if admin
  //check if coupon already exists
  const couponExists = await Coupon.findOne({
    code,
  });
  if (couponExists) {
    throw new Error('Coupon already exists');
  }

  //check if discount is a number
  if (isNaN(discount)) {
    throw new Error('Discount value must be a number');
  }

  //create coupon
  const coupon = await Coupon.create({
    code: code?.toUpperCase(),
    startDate,
    endDate,
    discount,
    user: req.userAuthId,
  });

  //send the response
  res.status(201).json({
    status: 'Success',
    message: 'Coupon created successfully',
    coupon,
  });
});

// @desc   Get All Coupons
// @route  GET /api/v1/coupons/
// @access private/admin

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();

  res.status(200).json({
    status: 'Success',
    messaage: 'All coupons',
    coupons,
  });
});

// @desc   Get single coupon
// @route  GET /api/v1/coupons/:id
// @access private/admin

export const getCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  res.json({
    status: 'success',
    message: 'Coupon fetched',
    coupon,
  });
});

// @desc   Update coupon
// @route  PUT /api/v1/coupons/:id
// @access private/admin

export const updateCoupon = asyncHandler(async (req, res) => {
  const { code, startDate, endDate, discount } = req.body;
  const updatedCoupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    {
      code: code?.toUpperCase(),
      startDate,
      endDate,
      discount,
    },
    {
      new: true,
    }
  );

  res.json({
    status: 'success',
    message: 'Coupon updated successfully',
    updatedCoupon,
  });
});

// @desc   Delete coupon
// @route  DELETE /api/v1/coupons/:id
// @access private/admin

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);

  res.json({
    status: 'success',
    message: 'Coupon deleted successfully',
  });
});
