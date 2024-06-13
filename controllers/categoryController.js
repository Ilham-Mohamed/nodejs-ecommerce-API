import Category from '../model/Category.js';
import asyncHandler from 'express-async-handler';

// @desc   Create new category
// @route  POST /api/v1/categories
// @access Private/Admin

export const createCategory = asyncHandler(async (req, res) => {
  let { name } = req.body;
  name = name.toLowerCase();

  // category exists
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    throw new Error('Category already exists');
  }

  // create
  const category = await Category.create({
    name: name.toLowerCase(),
    user: req.userAuthId,
    image: req.file.path,
  });

  res.json({
    status: 'success',
    message: 'Category created successfully',
    category,
  });
});

// @desc   Get all categories
// @route  GET /api/v1/categories
// @access Public

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  res.json({
    status: 'success',
    message: 'Categories fetched successfully',
    categories,
  });
});

// @desc   Get single category
// @route  GET /api/v1/categories/:id
// @access Public

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new Error('Category not found');
  }

  res.json({
    status: 'success',
    message: 'Category fetched successfully',
    category,
  });
});

// @desc   Update category
// @route  PUT /api/v1/categories/:id
// @access Private/Admin

export const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const category = await Category.findByIdAndUpdate(
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
    message: 'Category updated successfully',
    category,
  });
});

// // @desc   Delete category
// // @route  DELETE /api/v1/categories/:id
// // @access Private/Admin

export const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);

  res.json({
    status: 'success',
    message: 'Category deleted successfully',
  });
});
