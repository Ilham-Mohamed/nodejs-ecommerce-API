import dotenv from 'dotenv';
dotenv.config();
import Stripe from 'stripe';
import express from 'express';
import path from 'path';
import dbConnect from '../config/dbConnect.js';
import {
  globalErrorHandler,
  notFound,
} from '../middlewares/globalErrorHandler.js';
import userRoutes from '../routes/userRouter.js';
import productRoutes from '../routes/productRouter.js';
import categoryRoutes from '../routes/categoryRouter.js';
import brandRoutes from '../routes/brandRouter.js';
import colorRoutes from '../routes/colorRouter.js';
import reviewRoutes from '../routes/reviewRouter.js';
import orderRoutes from '../routes/orderRouter.js';
import Order from '../model/Order.js';
import couponRoutes from '../routes/couponRouter.js';

//db connect
dbConnect();

const app = express();

//stripe webhook

//stripe instance
const stripe = new Stripe(process.env.STRIPE_KEY);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEB_HOOK_SECRET;

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      //Update the order
      const session = event.data.object;
      const { orderId } = session.metadata;
      const paymentStatus = session.payment_status;
      const paymentMethod = session.payment_method_types[0];
      const totalAmount = session.amount_total;
      const currency = session.currency;

      //find the order
      const order = await Order.findByIdAndUpdate(
        JSON.parse(orderId),
        {
          totalPrice: totalAmount / 100,
          currency,
          paymentMethod,
          paymentStatus,
        },
        {
          new: true,
        }
      );
    } else {
      return;
    }
    // // Handle the event
    // switch (event.type) {
    //   case 'payment_intent.succeeded':
    //     const paymentIntentSucceeded = event.data.object;
    //     // Then define and call a function to handle the event payment_intent.succeeded
    //     break;
    //   // ... handle other event types
    //   default:
    //     console.log(`Unhandled event type ${event.type}`);
    // }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

//pass incoming data
app.use(express.json());

//server static file
app.use(express.static('public'));

//routes
//Home route
app.get('/', (req, res) => {
  res.sendFile(path.join('public', 'index.html'));
});
app.use('/api/v1/users/', userRoutes);
app.use('/api/v1/products/', productRoutes);
app.use('/api/v1/categories/', categoryRoutes);
app.use('/api/v1/brands/', brandRoutes);
app.use('/api/v1/colors/', colorRoutes);
app.use('/api/v1/reviews/', reviewRoutes);
app.use('/api/v1/orders/', orderRoutes);
app.use('/api/v1/coupons/', couponRoutes);

//err middleware
app.use(notFound);
app.use(globalErrorHandler);

export default app;
