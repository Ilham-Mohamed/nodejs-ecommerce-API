import User from '../model/User.js';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
// @desc Register User
// @route POST /api/v1/users/register
// @access Private/Admin

export const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;

  //Check user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    //throw
    throw new Error('User already exists');
  }

  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //create the user
  const user = await User.create({
    fullname,
    email,
    password: hashedPassword,
  });
  res.status(201).json({
    status: 'success',
    message: 'User Registered Successfully',
    data: user,
  });
});

// @desc Login User
// @route POST /api/v1/users/login
// @access Public

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find the user in db by email only
  const userFound = await User.findOne({
    email,
  });
  if (userFound && (await bcrypt.compare(password, userFound?.password))) {
    res.json({
      status: 'success',
      message: 'User logged in successfully',
      token: generateToken(userFound?._id),
      userFound,
    });
  } else {
    throw new Error('Invalid login credentials');
  }
});

// @desc Get user profile
// @route POST /api/v1/users/profile
// @access Private

export const getUserProfile = asyncHandler(async (req, res) => {
  // Find the user
  const user = await User.findById(req.userAuthId).populate('orders');
  
  res.json({
    status: 'Success',
    message: 'User profile fetched successfully',
    user,
  });
});

// @desc Update user shipping address
// @route POST /api/v1/users/update/shipping
// @access Private

export const updateShippingAddress = asyncHandler(async (req, res) => {
  const { firstName, lastName, address, city, postalCode, province, phone } =
    req.body;

  const user = await User.findByIdAndUpdate(
    req.userAuthId,
    {
      shippingAddress: {
        firstName,
        lastName,
        address,
        city,
        postalCode,
        province,
        phone,
      },
      hasShippingAddress: true,
    },
    {
      new: true,
    }
  );
  res.json({
    status: 'Success',
    message: 'User shipping address updated successfully',
    user,
  });
});
