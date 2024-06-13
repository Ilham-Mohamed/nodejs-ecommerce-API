import Brand from '../model/Brand.js';
import asyncHandler from 'express-async-handler';

// @desc   Create new Brand
// @route  POST /api/v1/brands
// @access Private/Admin

export const createBrand = asyncHandler(async (req, res) => {
  let { name } = req.body;
  name = name.toLowerCase();

  // brand exists
  const brandExists = await Brand.findOne({ name });
  if (brandExists) {
    throw new Error('brand already exists');
  }

  // create
  const brand = await Brand.create({
    name: name.toLowerCase(),
    user: req.userAuthId,
  });

  res.json({
    status: 'success',
    message: 'Brand created successfully',
    brand,
  });
});

// @desc   Get all brands
// @route  GET /api/v1/brands
// @access Public

export const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find();

  res.json({
    status: 'success',
    message: 'Brands fetched successfully',
    brands,
  });
});

// @desc   Get single brand
// @route  GET /api/v1/brands/:id
// @access Public

export const getBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!Brand) {
    throw new Error('Brand not found');
  }

  res.json({
    status: 'success',
    message: 'Brand fetched successfully',
    brand,
  });
});

// @desc   Update brand
// @route  PUT /api/v1/brands/:id
// @access Private/Admin

export const updateBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;

  //update
  const brand = await Brand.findByIdAndUpdate(
    req.params.id,
    {
      name,
    },
    {
      new: true,
    }
  );

  res.json({
    status: 'success',
    message: 'Brand updated successfully',
    brand,
  });
});

// // @desc   Delete brand
// // @route  DELETE /api/v1/brands/:id
// // @access Private/Admin

export const deleteBrand = asyncHandler(async (req, res) => {
  await Brand.findByIdAndDelete(req.params.id);

  res.json({
    status: 'success',
    message: 'Brand deleted successfully',
  });
});
