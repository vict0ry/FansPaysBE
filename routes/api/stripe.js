const express = require("express");
const app = express();
const router = express.Router();


const stripe = require("stripe")('sk_test_51LHjpdEZZiK54waal5CeD2qHjc9P5LV7sUqFgUsJ8Vi8EwSkNzGD1XQBEVPCxcKcgabBa8WxdUmWryAs6evDl0Ra00vjb96Cqe');

const calculateOrderAmount = (items) => {
  
  return 1400;
};

router.post("/create", async (req, res) => {
  // const { items } = req.body;
  const customer = await stripe.customers.create();
  await stripe.customers
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
  customer: customer.id,
  setup_future_usage: 'off_session',
  amount: 1099,
  currency: 'eur',
  automatic_payment_methods: {
    enabled: true,
  },
});

// try {
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: 1099,
//     currency: 'usd',
//     customer: '{{CUSTOMER_ID}}',
//     payment_method: '{{PAYMENT_METHOD_ID}}',
//     off_session: true,
//     confirm: true,
//   });
// } catch (err) {
//   // Error code will be authentication_required if authentication is needed
//   console.log('Error code is: ', err.code);
//   const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
//   console.log('PI retrieved: ', paymentIntentRetrieved.id);
// }
console.log(paymentIntent, 'cskdmaksdkasmkd');

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});
module.exports = router;