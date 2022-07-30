const express = require("express");
const User = require("../../schemas/UserSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();
const router = express.Router();


const stripe = require("stripe")('sk_test_51LHjpdEZZiK54waal5CeD2qHjc9P5LV7sUqFgUsJ8Vi8EwSkNzGD1XQBEVPCxcKcgabBa8WxdUmWryAs6evDl0Ra00vjb96Cqe');

const calculateOrderAmount = (items) => {
  return 66600;
};

router.post('/pay', async(req,res, next) => {
  const user = await jwt.decode(req.headers.authorization, 'secretkey');
  const foundUser = await User.findOne({
    username: user.username
  })
  const paymentMethods = await stripe.paymentMethods.list({
    customer: foundUser.stripeUserId,
    type: 'card',
  });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(),
      currency: "czk",
      payment_method: paymentMethods.data[0].id,
      customer: foundUser.stripeUserId,
      off_session: true,
      confirm: true
    });

    res.send({
      succeeded: true,
      clientSecret: paymentIntent.client_secret,
      publicKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (err) {
    const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
    return res.send({
      paymentIntentRetrieved,
      err
    })
  }
  return '';
})

router.post("/create", async (req, res) => {
  const user = await jwt.decode(req.headers.authorization, 'secretkey');
  const foundUser = await User.findOne({
    username: user.username
  })
  if (!foundUser.stripeUserId) {
    const customer = await stripe.customers.create({
      email: foundUser.email,
      name: foundUser.firstName + ' ' + foundUser.lastName
    });
    foundUser.stripeUserId = customer.id;
    await foundUser.save();
  }
  const setupIntent = await stripe.setupIntents.create({
  customer: foundUser.stripeUserId,
    payment_method_types: ['card'],
});

  res.send({
    client_secret: setupIntent.client_secret
  });
});
module.exports = router;