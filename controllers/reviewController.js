import Product from '../model/Product.js';
import Review from '../model/Review.js';
import asyncHandler from 'express-async-handler';

// @desc   Create new review
// @route  POST /api/v1/reviews
// @access Private/Admin

export const createReview = asyncHandler(async (req, res) => {
  const { product, message, rating } = req.body;

  // 1. Find the product
  const { productID } = req.params;
  const productFound = await Product.findById(productID).populate('reviews');

  if (!productFound) {
    throw new Error('Product Not Found');
  }

  // 2. check if user already reviewed this product
  const hasReviewed = productFound?.reviews?.find((review) => {
    return review?.user.toString() === req.userAuthId.toString();
  });

  if (hasReviewed) {
    throw new Error('You have already reviewed this product');
  }
  // 3. create review
  const review = await Review.create({
    message,
    rating,
    product: productFound?._id,
    user: req.userAuthId,
  });

  // 4. Push review into product found
  productFound.reviews.push(review?._id);

  // resave
  await productFound.save();

  res.json({
    status: 'success',
    message: 'Review created successfully',
    product,
  });
});
